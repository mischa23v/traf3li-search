// Environment variables validation
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  const optional = [
    'DOCUMENT_ENCRYPTION_KEY',
    'ANTHROPIC_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Warn about optional but recommended variables
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Warning: Missing optional environment variables: ${missingOptional.join(', ')}`);
  }
  
  // Validate format
  if (process.env.DOCUMENT_ENCRYPTION_KEY) {
    try {
      const key = Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY, 'base64');
      if (key.length !== 32) {
        throw new Error('DOCUMENT_ENCRYPTION_KEY must be 32 bytes when decoded');
      }
    } catch (error) {
      throw new Error('DOCUMENT_ENCRYPTION_KEY is invalid: ' + error.message);
    }
  }
  
  console.log('✅ Environment variables validated successfully');
}
