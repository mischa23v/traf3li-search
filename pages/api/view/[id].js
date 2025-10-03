import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';

function decryptBuffer(buffer) {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!key) return buffer;
  
  const keybuf = Buffer.from(key, 'base64');
  const iv = buffer.slice(0, 16);
  const ciphertext = buffer.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', keybuf, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const docId = req.query.id;
    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        fileContent: true,
        encrypted: true,
        redactedText: true,
        title: true,
        court: true,
        caseNumber: true,
        dateDecided: true,
        accessLevel: true,
        winningParty: true,
        victoryType: true,
        field: true,
        outcome: true
      }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access level
    const isAdmin = session.user.role === 'ADMIN';
    if (doc.accessLevel === 'ADMIN_ONLY' && !isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get text
    let text;
    
    if (isAdmin && req.query.original === 'true' && doc.fileContent) {
      // Admin requesting original
      let buffer = doc.fileContent;
      if (doc.encrypted) {
        buffer = decryptBuffer(buffer);
      }
      text = buffer.toString('utf8');
    } else {
      // Everyone else gets redacted version
      text = doc.redactedText || 'Content not available';
    }

    // Add watermark
    const watermark = `\n\n--- Viewed by ${session.user.email} on ${new Date().toISOString()} ---\n\n`;
    text = watermark + text + watermark;

    // Log access
    await prisma.searchLog.create({
      data: {
        userId: session.user.email,
        query: `VIEW:${docId}`,
        documentId: docId,
        action: 'VIEW',
        results: 1
      }
    });

    res.json({
      text,
      metadata: {
        title: doc.title,
        court: doc.court,
        caseNumber: doc.caseNumber,
        dateDecided: doc.dateDecided,
        winningParty: doc.winningParty,
        victoryType: doc.victoryType,
        field: doc.field,
        outcome: doc.outcome
      }
    });

  } catch (err) {
    console.error('View error:', err);
    res.status(500).json({ error: 'Failed to load document' });
  }
}