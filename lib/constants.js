// Shared constants across the application

export const CASE_TOPICS = {
  'أجر': {
    main: 'SALARY',
    subs: [
      'أجر فعلي',
      'أجر إجازات',
      'أجور متأخرة',
      'أجر إجازات سنوية'
    ]
  },
  'مكافأة': {
    main: 'BONUS',
    subs: [
      'مكافأة نهاية الخدمة'
    ]
  },
  'التعويض': {
    main: 'COMPENSATION',
    subs: [
      'تعويض عن إنهاء عقد',
      'التعويض عن الإنهاء الغير مشروع'
    ]
  },
  'إثبات': {
    main: 'PROOF',
    subs: [
      'إثبات سبب الإنهاء الصحيح'
    ]
  }
};

export const COURT_TYPES = [
  { value: 'LABOR', label: 'المحكمة العمالية' },
  { value: 'COMMERCIAL', label: 'المحكمة التجارية' },
  { value: 'APPEAL', label: 'محكمة الاستئناف' },
  { value: 'SUPREME', label: 'المحكمة العليا' },
  { value: 'FRIENDLY_SETTLEMENT', label: 'التسوية الودية' }
];

export const CASE_STATUSES = [
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'ACTIVE', label: 'نشطة' },
  { value: 'SETTLED', label: 'تسوية ودية' },
  { value: 'JUDGMENT', label: 'صدر حكم' },
  { value: 'APPEAL', label: 'استئناف' },
  { value: 'CLOSED', label: 'منتهية' }
];

export const CASE_STAGES = [
  { value: 'INTAKE', label: 'استقبال القضية' },
  { value: 'PREPARING', label: 'إعداد المستندات' },
  { value: 'FILED', label: 'تم رفع الدعوى' },
  { value: 'SETTLEMENT_NEGOTIATION', label: 'التفاوض على التسوية' },
  { value: 'SETTLED', label: 'تسوية ودية' },
  { value: 'FIRST_HEARING', label: 'جلسة أولى' },
  { value: 'IN_PROGRESS', label: 'قيد النظر' },
  { value: 'JUDGMENT', label: 'صدر حكم' },
  { value: 'APPEAL', label: 'استئناف' },
  { value: 'CLOSED', label: 'منتهية' }
];

export const SERVICE_TYPES = [
  { value: 'CONSULTATION', label: 'استشارة قانونية فقط' },
  { value: 'LAWSUIT_WRITING', label: 'كتابة صحيفة دعوى' },
  { value: 'DEFENSE_WRITING', label: 'كتابة مذكرة دفاع' },
  { value: 'FULL_REPRESENTATION', label: 'توكيل كامل' }
];

export const AI_DOCUMENT_TYPES = [
  { value: 'LAWSUIT_PETITION', label: 'صحيفة دعوى' },
  { value: 'DEFENSE_MEMO', label: 'مذكرة دفاع' },
  { value: 'APPEAL', label: 'استئناف' },
  { value: 'LEGAL_MEMO', label: 'مذكرة قانونية' }
];

export const SETTLEMENT_STATUSES = [
  { value: 'FRIENDLY_SETTLEMENT', label: 'تسوية ودية' },
  { value: 'IN_COURT', label: 'في المحكمة' },
  { value: 'NEGOTIATING', label: 'تفاوض' }
];

export const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 
  'الخبر', 'الظهران', 'الطائف', 'تبوك', 'بريدة', 'خميس مشيط',
  'حائل', 'نجران', 'جازان', 'ينبع', 'الأحساء', 'القطيف', 
  'الجبيل', 'أبها', 'عرعر', 'سكاكا', 'القريات'
];

export const SPECIALIZATIONS = [
  'قضايا عمالية',
  'قضايا تجارية',
  'قضايا أحوال شخصية',
  'قضايا جنائية',
  'قضايا إدارية',
  'قضايا عقارية',
  'التحكيم التجاري',
  'الملكية الفكرية',
  'قضايا الشركات',
  'قضايا التأمين'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENTS = 30;
export const ITEMS_PER_PAGE = 10;
