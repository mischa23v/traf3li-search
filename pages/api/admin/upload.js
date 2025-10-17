import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';
import { extractLegalMetadata } from '../../../lib/legalParser';
import { logError, logInfo, logAudit } from '../../../lib/logger';

export const config = {
  api: {
    bodyParser: false,
  },
};

function encryptBuffer(buffer) {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!key) {
    console.warn('DOCUMENT_ENCRYPTION_KEY not set - storing unencrypted');
    return buffer;
  }
  
  try {
    const keybuf = Buffer.from(key, 'base64');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', keybuf, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    logError('ENCRYPTION', error);
    return buffer;
  }
}

function redactText(text) {
  // Remove TAGS section from redacted text
  return text.replace(/---TAGS_START---[\s\S]*?---TAGS_END---\s*/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Check document limit
    const count = await prisma.document.count();
    if (count >= 30) {
      return res.status(400).json({ 
        error: 'تم الوصول للحد الأقصى (30 مستند). يرجى حذف مستندات قديمة أولاً'
      });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.document?.[0] || files.document;
    if (!file) {
      return res.status(400).json({ error: 'لم يتم رفع ملف' });
    }

    // Validate file type
    if (!file.originalFilename?.endsWith('.txt')) {
      return res.status(400).json({ 
        error: 'يُسمح فقط بملفات .txt'
      });
    }

    // Read and process file
    const fileBuffer = fs.readFileSync(file.filepath);
    const text = fileBuffer.toString('utf8');

    // Validate file has content
    if (!text || text.trim().length === 0) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'الملف فارغ' });
    }

    // Extract metadata
    const metadata = extractLegalMetadata(text);

    // Encrypt and redact
    const encrypted = encryptBuffer(fileBuffer);
    const redacted = redactText(text);

    // Save to database
    const doc = await prisma.document.create({
      data: {
        originalName: file.originalFilename,
        fileName: `doc_${Date.now()}_${file.originalFilename}`,
        contentType: file.mimetype || 'text/plain',
        fileSize: file.size,
        uploadedBy: session.user.email,
        accessLevel: fields.accessLevel?.[0] || fields.accessLevel || 'USER_ONLY',
        fileContent: encrypted,
        extractedText: text,
        redactedText: redacted,
        encrypted: !!process.env.DOCUMENT_ENCRYPTION_KEY,
        
        // Metadata fields
        court: metadata.court,
        plaintiff: metadata.plaintiff,
        judgmentFor: metadata.judgmentFor,
        mainTitle: metadata.mainTitle,
        subTitle: metadata.subTitle,
        summary: metadata.summary,
        caseDate: metadata.caseDate,
        keywords: metadata.keywords,
      },
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    logAudit('DOCUMENT_UPLOAD', session.user.email, {
      documentId: doc.id,
      fileName: doc.originalName
    });

    logInfo('DOCUMENT_UPLOAD', 'Document uploaded successfully', {
      documentId: doc.id,
      fileName: doc.originalName,
      uploadedBy: session.user.email
    });

    return res.status(200).json({
      success: true,
      documentId: doc.id,
      extractedInfo: metadata,
    });

  } catch (error) {
    logError('UPLOAD_API', error, session.user.email);
    
    // Provide user-friendly error messages
    let errorMessage = 'فشل رفع الملف';
    if (error.message.includes('Unique constraint')) {
      errorMessage = 'هذا الملف موجود مسبقاً';
    } else if (error.message.includes('too large')) {
      errorMessage = 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)';
    }
    
    return res.status(500).json({ 
      error: errorMessage
    });
  }
}
