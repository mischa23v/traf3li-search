import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import { CASE_TOPICS } from '../../lib/legalParser';

export default function NewCase() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lawyerId } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  
  const [formData, setFormData] = useState({
    // Plaintiff (Client)
    plaintiffName: '',
    plaintiffAddress: '',
    plaintiffPhone: '',
    plaintiffEmail: '',
    plaintiffId: '',
    
    // Defendant
    defendantName: '',
    defendantAddress: '',
    defendantType: 'Company',
    defendantCR: '',
    
    // Case Details
    caseType: '',
    subCategory: '',
    court: 'المحكمة العمالية',
    claimAmount: '',
    description: '',
    
    // Lawyer
    lawyerId: lawyerId || '',
    
    // Service Type
    serviceType: 'CONSULTATION'
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.isClient) {
      router.push('/');
      return;
    }

    // Pre-fill client info
    if (session.user.clientId) {
      fetchClientInfo();
    }
    
    // Fetch available lawyers
    fetchLawyers();
  }, [session, status]);

  async function fetchClientInfo() {
    try {
      const res = await fetch(`/api/clients/${session.user.clientId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          plaintiffName: data.client.fullName,
          plaintiffPhone: data.client.phone,
          plaintiffEmail: data.client.email,
          plaintiffId: data.client.nationalId
        }));
      }
    } catch (err) {
      console.error('Failed to fetch client info:', err);
    }
  }

  async function fetchLawyers() {
    setLoadingLawyers(true);
    try {
      const res = await fetch('/api/lawyers?acceptingCases=true&limit=100');
      if (res.ok) {
        const data = await res.json();
        setLawyers(data.lawyers || []);
      }
    } catch (err) {
      console.error('Failed to fetch lawyers:', err);
    } finally {
      setLoadingLawyers(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset subCategory when caseType changes
    if (name === 'caseType') {
      setFormData(prev => ({
        ...prev,
        subCategory: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.plaintiffName || !formData.defendantName || !formData.caseType || !formData.description) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في إنشاء القضية');
      }

      const data = await res.json();
      
      // Redirect to the new case
      router.push(`/cases/${data.case.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '60px', direction: 'rtl' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>جاري التحميل...</p>
      </div>
    );
  }

  const availableSubCategories = formData.caseType ? CASE_TOPICS[formData.caseType]?.subs || [] : [];

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f5f5f5' }}>
      <ResponsiveHeader session={session} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>➕ قضية جديدة</h2>
          <p style={{ color: '#666' }}>املأ النموذج أدناه لبدء قضية جديدة</p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            color: '#721c24',
            marginBottom: '24px'
          }}>
            <strong>خطأ:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Plaintiff Section */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#28a745' }}>
              👤 معلومات المدعي (أنت)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  الاسم الكامل <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="plaintiffName"
                  value={formData.plaintiffName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  رقم الهوية الوطنية
                </label>
                <input
                  type="text"
                  name="plaintiffId"
                  value={formData.plaintiffId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="plaintiffPhone"
                  value={formData.plaintiffPhone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="plaintiffEmail"
                  value={formData.plaintiffEmail}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  العنوان
                </label>
                <input
                  type="text"
                  name="plaintiffAddress"
                  value={formData.plaintiffAddress}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Defendant Section */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#dc3545' }}>
              🏢 معلومات المدعى عليه
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  اسم المدعى عليه <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="defendantName"
                  value={formData.defendantName}
                  onChange={handleChange}
                  required
                  placeholder="اسم الشركة أو الشخص"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  نوع المدعى عليه
                </label>
                <select
                  name="defendantType"
                  value={formData.defendantType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Company">شركة</option>
                  <option value="Individual">فرد</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  السجل التجاري
                </label>
                <input
                  type="text"
                  name="defendantCR"
                  value={formData.defendantCR}
                  onChange={handleChange}
                  placeholder="للشركات فقط"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  عنوان المدعى عليه
                </label>
                <input
                  type="text"
                  name="defendantAddress"
                  value={formData.defendantAddress}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Case Details Section */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#007bff' }}>
              ⚖️ تفاصيل القضية
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  نوع القضية <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">اختر نوع القضية</option>
                  {Object.keys(CASE_TOPICS).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  الموضوع الفرعي
                </label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  disabled={!formData.caseType}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: !formData.caseType ? '#f0f0f0' : 'white'
                  }}
                >
                  <option value="">اختر الموضوع الفرعي</option>
                  {availableSubCategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  المحكمة
                </label>
                <input
                  type="text"
                  name="court"
                  value={formData.court}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  قيمة المطالبة (ريال)
                </label>
                <input
                  type="number"
                  name="claimAmount"
                  value={formData.claimAmount}
                  onChange={handleChange}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  وصف القضية <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="اشرح تفاصيل القضية بالكامل..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Lawyer & Service Section */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#6f42c1' }}>
              👨‍⚖️ المحامي والخدمة
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  اختر محامي
                </label>
                <select
                  name="lawyerId"
                  value={formData.lawyerId}
                  onChange={handleChange}
                  disabled={loadingLawyers}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">اختياري - سيتم التعيين لاحقاً</option>
                  {lawyers.map(lawyer => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.name} - {lawyer.specializations?.[0] || 'محامي'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  نوع الخدمة
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="CONSULTATION">استشارة قانونية فقط</option>
                  <option value="LAWSUIT_WRITING">كتابة صحيفة دعوى</option>
                  <option value="DEFENSE_WRITING">كتابة مذكرة دفاع</option>
                  <option value="FULL_REPRESENTATION">توكيل كامل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px 24px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(17, 153, 142, 0.3)'
              }}
            >
              {loading ? '⏳ جاري الإنشاء...' : '✓ إنشاء القضية'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
