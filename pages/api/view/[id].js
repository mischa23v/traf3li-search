import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';
import { logError, logInfo, logAudit } from '../../../lib/logger';

function decryptBuffer(buffer) {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!key) return buffer;
  
  try {
    const keybuf = Buffer.from(key, 'base64');
    const iv = buffer.slice(0, 16);
    const ciphertext = buffer.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', keybuf, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (error) {
    logError('DECRYPTION', error);
    return buffer;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const docId = req.query.id;

    // Validate document ID
    if (!docId || typeof docId !== 'string') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        fileContent: true,
        encrypted: true,
        redactedText: true,
        mainTitle: true,
        subTitle: true,
        court: true,
        plaintiff: true,
        caseDate: true,
        accessLevel: true,
        judgmentFor: true,
        summary: true
      }
    });

    if (!doc) {
      return res.status(404).json({ error: 'المستند غير موجود' });
    }

    // Check access level
    const isAdmin = session.user.role === 'ADMIN';
    if (doc.accessLevel === 'ADMIN_ONLY' && !isAdmin) {
      return res.status(403).json({ error: 'يتطلب صلاحيات المسؤول' });
    }

    // Get text based on permissions
    let text;
    
    if (isAdmin && req.query.original === 'true' && doc.fileContent) {
      // Admin requesting original with TAGS
      let buffer = doc.fileContent;
      if (doc.encrypted) {
        buffer = decryptBuffer(buffer);
      }
      text = buffer.toString('utf8');
    } else {
      // Everyone else gets redacted version (TAGS already removed)
      text = doc.redactedText || 'المحتوى غير متاح';
    }

    // Remove TAGS section from display (double-check)
    text = text.replace(/---TAGS_START---[\s\S]*?---TAGS_END---\s*/g, '');

    // Add watermark
    const watermark = `\n\n--- تم الاطلاع بواسطة ${session.user.email} في ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })} ---\n\n`;
    text = watermark + text + watermark;

    // Log access with audit trail
    await prisma.searchLog.create({
      data: {
        userId: session.user.email,
        query: `VIEW:${docId}`,
        documentId: docId,
        action: 'VIEW',
        results: 1
      }
    }).catch(err => logError('VIEW_LOG', err, session.user.email));

    logAudit('DOCUMENT_VIEW', session.user.email, {
      documentId: docId,
      isAdmin,
      viewedOriginal: isAdmin && req.query.original === 'true'
    });

    res.json({
      text,
      metadata: {
        mainTitle: doc.mainTitle,
        subTitle: doc.subTitle,
        court: doc.court,
        plaintiff: doc.plaintiff,
        caseDate: doc.caseDate,
        judgmentFor: doc.judgmentFor,
        summary: doc.summary
      }
    });

  } catch (err) {
    logError('VIEW_API', err, session.user.email);
    res.status(500).json({ error: 'فشل تحميل المستند' });
  }
}
