// lib/helpers.js - Shared helper functions for the entire application

export function getCaseTypeArabic(type) {
  const types = {
    'SALARY': 'أجر',
    'BONUS': 'مكافأة',
    'COMPENSATION': 'تعويض',
    'PROOF': 'إثبات',
    'OTHER': 'أخرى'
  };
  return types[type] || type;
}

export function getStatusArabic(status) {
  const statuses = {
    'PENDING': 'قيد الانتظار',
    'ACTIVE': 'نشطة',
    'UNDER_REVIEW': 'قيد المراجعة',
    'HEARING': 'في الجلسة',
    'JUDGMENT': 'صدر حكم',
    'SETTLED': 'تم التسوية',
    'CLOSED': 'مغلقة',
    'APPEALED': 'مستأنفة'
  };
  return statuses[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    'PENDING': '#ffc107',
    'ACTIVE': '#17a2b8',
    'UNDER_REVIEW': '#6c757d',
    'HEARING': '#007bff',
    'JUDGMENT': '#28a745',
    'SETTLED': '#28a745',
    'CLOSED': '#6c757d',
    'APPEALED': '#dc3545'
  };
  return colors[status] || '#6c757d';
}

export function getCourtTypeArabic(courtType) {
  const types = {
    'LABOR': 'محكمة عمالية',
    'COMMERCIAL': 'محكمة تجارية',
    'CIVIL': 'محكمة مدنية',
    'ADMINISTRATIVE': 'محكمة إدارية',
    'CRIMINAL': 'محكمة جنائية',
    'FAMILY': 'محكمة أحوال شخصية'
  };
  return types[courtType] || courtType;
}

export function getAIDocTypeArabic(docType) {
  const types = {
    'LAWSUIT_PETITION': 'صحيفة دعوى',
    'DEFENSE_MEMO': 'مذكرة دفاع',
    'APPEAL': 'استئناف',
    'CONTRACT': 'عقد',
    'LEGAL_OPINION': 'رأي قانوني'
  };
  return types[docType] || docType;
}
