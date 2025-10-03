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

    setU