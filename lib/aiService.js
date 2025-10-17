// AI Service for document generation using Claude API
import Anthropic from '@anthropic-ai/sdk';

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function generateLawsuit(caseData) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `أنت محامٍ سعودي متخصص في القضايا العمالية. اكتب صحيفة دعوى احترافية بناءً على المعلومات التالية:

**معلومات القضية:**
- نوع القضية: ${caseData.caseType}
- الموضوع: ${caseData.subCategory}
- المدعي: ${caseData.plaintiffName}
- المدعى عليه: ${caseData.defendantName}
- قيمة المطالبة: ${caseData.claimAmount} ريال سعودي

**الوقائع:**
${caseData.description}

**يجب أن تتضمن الصحيفة الأقسام التالية:**

1. **الديباجة**
   - المحكمة المختصة
   - بيانات المدعي كاملة
   - بيانات المدعى عليه كاملة

2. **أطراف الدعوى**
   - تفاصيل المدعي
   - تفاصيل المدعى عليه

3. **الوقائع**
   - سرد تفصيلي للوقائع بترتيب زمني
   - العلاقة التعاقدية
   - الإخلال بالالتزامات

4. **الأسانيد القانونية**
   - المواد القانونية من نظام العمل السعودي
   - السوابق القضائية ذات الصلة
   - الأحكام والقرارات المؤيدة للمطالبة

5. **الطلبات**
   - الطلبات الرئيسية
   - الطلبات الاحتياطية
   - مصاريف التقاضي وأتعاب المحاماة

**ملاحظات مهمة:**
- استخدم لغة قانونية رسمية وواضحة
- أشر إلى المواد القانونية بدقة من نظام العمل السعودي
- اجعل الصيغة متوافقة مع متطلبات المحاكم العمالية السعودية
- اذكر الاختصاص المكاني والنوعي للمحكمة

اكتب الصحيفة بشكل كامل واحترافي:`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('فشل في إنشاء المستند بواسطة الذكاء الاصطناعي');
  }
}

export async function generateDefenseMemo(caseData) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `أنت محامٍ سعودي متخصص في القضايا العمالية. اكتب مذكرة دفاع احترافية بناءً على المعلومات التالية:

**معلومات القضية:**
- نوع القضية: ${caseData.caseType}
- الموضوع: ${caseData.subCategory}
- المدعي: ${caseData.plaintiffName}
- المدعى عليه (موكلي): ${caseData.defendantName}
- قيمة المطالبة: ${caseData.claimAmount} ريال سعودي

**دفوع الموكل:**
${caseData.description}

**يجب أن تتضمن المذكرة الأقسام التالية:**

1. **المقدمة**
   - بيانات القضية
   - تمهيد للدفوع

2. **الدفوع الشكلية** (إن وجدت)
   - عدم الاختصاص
   - عدم قبول الدعوى
   - سقوط الحق بالتقادم

3. **الدفوع الموضوعية**
   - دحض ادعاءات المدعي
   - إثبات الوفاء بالالتزامات
   - عدم صحة المطالبات

4. **الأسانيد القانونية**
   - المواد القانونية المؤيدة للدفاع
   - السوابق القضائية
   - الأحكام المؤيدة

5. **الطلبات**
   - رفض الدعوى
   - إلزام المدعي بالمصاريف

**ملاحظات مهمة:**
- استخدم لغة قانونية قوية ومقنعة
- فند كل ادعاءات المدعي بالتفصيل
- اذكر المواد القانونية الداعمة للدفاع
- ركز على نقاط الضعف في دعوى المدعي

اكتب المذكرة بشكل كامل واحترافي:`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('فشل في إنشاء المستند بواسطة الذكاء الاصطناعي');
  }
}

export async function analyzeCaseStrength(caseData) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const prompt = `أنت محامٍ خبير في القضايا العمالية السعودية. قم بتحليل قوة هذه القضية:

**معلومات القضية:**
- نوع القضية: ${caseData.caseType}
- الموضوع: ${caseData.subCategory}
- المدعي: ${caseData.plaintiffName}
- المدعى عليه: ${caseData.defendantName}
- قيمة المطالبة: ${caseData.claimAmount} ريال
- الوقائع: ${caseData.description}

قدم تحليلاً شاملاً يتضمن:

1. **تقييم قوة القضية** (من 10)
2. **نقاط القوة**
3. **نقاط الضعف**
4. **المخاطر القانونية**
5. **فرص النجاح المتوقعة**
6. **التوصيات الاستراتيجية**
7. **المستندات المطلوبة**
8. **الأحكام والسوابق المشابهة**

كن موضوعياً ودقيقاً في تحليلك:`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('فشل في تحليل القضية');
  }
}

export async function findSimilarCases(caseData, judgments) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const judgmentsSummary = judgments.map(j => 
    `- ${j.mainTitle}: ${j.subTitle} (${j.judgmentFor})`
  ).join('\n');

  const prompt = `أنت محامٍ خبير. لديك القضية التالية:

**القضية الحالية:**
- النوع: ${caseData.caseType}
- الموضوع: ${caseData.subCategory}
- الوصف: ${caseData.description}

**الأحكام القضائية المتاحة:**
${judgmentsSummary}

حدد أكثر 5 أحكام قضائية مشابهة وذات صلة بهذه القضية. لكل حكم:
1. اذكر العنوان
2. وضح أوجه الشبه
3. اشرح كيف يمكن الاستفادة منه
4. قيّم مدى الصلة (من 10)

رتب الأحكام حسب الأهمية والصلة:`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error('AI similar cases error:', error);
    throw new Error('فشل في البحث عن قضايا مشابهة');
  }
}
