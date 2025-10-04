import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';
import { extractLegalMetadata } from '../../../lib/legalParser';

export const config = {
  api: {
    bodyParser: false,
  },
};

function encryptBuffer(buffer) {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!key) return buffer;
  
  const keybuf = Buffer.from(key, 'base64');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', keybuf, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

function redactText(text) {
  // Remove TAGS section from redacted text
  return text.replace(/---TAGS_START---[\s\S]*?---TAGS_END---\s*/g, '');
  // NO NUMBER REDACTION - numbers are kept as-is
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
    const count = await prisma.document.count();
    if (count >= 30) {
      return res.status(400).json({ error: 'Maximum 30 documents allowed' });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,
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
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.originalFilename?.endsWith('.txt')) {
      return res.status(400).json({ error: 'Only .txt files allowed' });
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    const text = fileBuffer.toString('utf8');
    const metadata = extractLegalMetadata(text);
    const encrypted = encryptBuffer(fileBuffer);
    const redacted = redactText(text);

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
        encrypted: true,
        
        // New metadata fields
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

    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      documentId: doc.id,
      extractedInfo: metadata,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed: ' + error.message 
    });
  }
}
