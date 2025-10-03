import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminUpload() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  if (!session) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Admin Access Required</h2>
        <button onClick={() => router.push('/')}>Back to Home</button>
      </div>
    );
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('accessLevel', 'USER_ONLY');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setFile(null);
        document.querySelector('input[type="file"]').value = '';
      }
    } catch (err) {
      setResult({ error: err.message });
    }
    setUploading(false);
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <button 
        onClick={() => router.push('/')} 
        style={{ 
          marginBottom: '20px',
          padding: '8px 16px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← Back to Search
      </button>

      <h2 style={{ marginBottom: '8px' }}>Upload Legal Document</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Only .txt files with Arabic legal judgments
      </p>

      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Select Document (.txt)
          </label>
          <input 
            type="file" 
            accept=".txt"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ 
              width: '100%', 
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        {file && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '8px', 
            background: '#e9ecef',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        <button 
          type="submit" 
          disabled={uploading || !file}
          style={{
            padding: '12px 24px',
            background: uploading || !file ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading || !file ? 'not-allowed' : 'pointer',
            width: '100%',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: result.error ? '#f8d7da' : '#d4edda',
          border: `1px solid ${result.error ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px',
          direction: 'rtl'
        }}>
          {result.error ? (
            <div style={{ color: '#721c24' }}>
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div style={{ color: '#155724' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
                ✓ Uploaded Successfully
              </div>
              {result.extractedInfo && (
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  {result.extractedInfo.title && (
                    <div>العنوان: {result.extractedInfo.title}</div>
                  )}
                  {result.extractedInfo.court && (
                    <div>المحكمة: {result.extractedInfo.court}</div>
                  )}
                  {result.extractedInfo.caseNumber && (
                    <div>رقم القضية: {result.extractedInfo.caseNumber}</div>
                  )}
                  {result.extractedInfo.winningParty && (
                    <div>الطرف الفائز: {result.extractedInfo.winningParty}</div>
                  )}
                  {result.extractedInfo.keywords && result.extractedInfo.keywords.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <strong>الكلمات المفتاحية:</strong> {result.extractedInfo.keywords.join('، ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        background: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '13px',
        color: '#666'
      }}>
        <strong>Notes:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Maximum 30 documents allowed</li>
          <li>Only .txt format accepted</li>
          <li>Documents are encrypted and redacted automatically</li>
          <li>Arabic legal judgments with structured tags work best</li>
        </ul>
      </div>
    </div>
  );
}
