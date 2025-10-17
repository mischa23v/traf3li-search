// Centralized logging utility
export function logError(context, error, userId = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    userId
  };
  
  console.error(JSON.stringify(logEntry, null, 2));
  
  // Optional: Send to external service like Sentry
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: logEntry });
  // }
}

export function logInfo(context, message, data = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log({
      timestamp: new Date().toISOString(),
      context,
      message,
      ...data
    });
  }
}

export function logWarning(context, message, data = {}) {
  console.warn({
    timestamp: new Date().toISOString(),
    context,
    message,
    ...data
  });
}

export function logAudit(action, userId, details = {}) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    ...details
  };
  
  console.log('AUDIT:', JSON.stringify(auditLog));
  
  // TODO: Store audit logs in database for compliance
  // await prisma.auditLog.create({ data: auditLog });
}
