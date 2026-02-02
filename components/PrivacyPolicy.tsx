import React from 'react';
import { Shield, Lock, Eye, Database, Globe, Mail, Clock, FileText } from 'lucide-react';
import { Language } from '../App';

interface PrivacyPolicyProps {
  lang: Language;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 2026",
      intro: "At MAXIOS, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make purchases, or interact with our services.",
      sections: [
        {
          icon: Database,
          title: "Information We Collect",
          content: [
            "Personal Information: Name, email address, phone number, shipping and billing addresses, and payment information when you make a purchase or create an account.",
            "Device Information: IP address, browser type, operating system, device identifiers, and browsing patterns on our website.",
            "Transaction Data: Purchase history, product preferences, warranty registrations, and customer service interactions.",
            "Communication Data: Records of correspondence when you contact our support team, participate in surveys, or subscribe to our newsletters.",
            "Usage Analytics: How you interact with our website, including pages visited, time spent, click patterns, and navigation paths."
          ]
        },
        {
          icon: Eye,
          title: "How We Use Your Information",
          content: [
            "Order Processing: To process and fulfill your orders, manage payments, and arrange delivery of our premium vacuum systems.",
            "Customer Support: To provide technical assistance, warranty services, and respond to your inquiries efficiently.",
            "Product Improvement: To analyze usage patterns and feedback to continuously enhance our product offerings and user experience.",
            "Marketing Communications: To send promotional offers, product updates, and company news (with your consent).",
            "Legal Compliance: To comply with applicable laws, regulations, and legal processes.",
            "Fraud Prevention: To detect, prevent, and address fraudulent activities and security threats."
          ]
        },
        {
          icon: Shield,
          title: "Data Protection & Security",
          content: [
            "We implement industry-leading security measures including SSL/TLS encryption, secure payment gateways, and regular security audits.",
            "Access to personal data is restricted to authorized personnel who require it for legitimate business purposes.",
            "We maintain comprehensive data backup systems and disaster recovery protocols to ensure data integrity.",
            "Regular penetration testing and vulnerability assessments are conducted by third-party security experts.",
            "All employees undergo mandatory data protection training and are bound by strict confidentiality agreements."
          ]
        },
        {
          icon: Globe,
          title: "International Data Transfers",
          content: [
            "MAXIOS operates globally, and your information may be transferred to and processed in countries other than your country of residence.",
            "We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses approved by relevant authorities.",
            "Our data centers are located in secure facilities that comply with international security standards (ISO 27001, SOC 2).",
            "We only partner with service providers who demonstrate equivalent levels of data protection."
          ]
        },
        {
          icon: Lock,
          title: "Your Rights & Choices",
          content: [
            "Access: You have the right to request a copy of the personal information we hold about you.",
            "Correction: You may request correction of inaccurate or incomplete personal data.",
            "Deletion: You can request deletion of your personal data, subject to legal retention requirements.",
            "Portability: You have the right to receive your data in a structured, commonly used format.",
            "Opt-Out: You may opt out of marketing communications at any time by clicking 'unsubscribe' or contacting us.",
            "Restriction: You can request restriction of processing in certain circumstances."
          ]
        },
        {
          icon: Clock,
          title: "Data Retention",
          content: [
            "We retain personal information for as long as necessary to fulfill the purposes outlined in this policy.",
            "Transaction records are kept for 7 years to comply with tax and accounting regulations.",
            "Marketing preferences are retained until you withdraw consent or request deletion.",
            "Warranty-related information is maintained for the duration of the product warranty plus 2 years.",
            "Upon request for deletion, we will remove your data within 30 days, except where retention is legally required."
          ]
        },
        {
          icon: FileText,
          title: "Cookies & Tracking Technologies",
          content: [
            "Essential Cookies: Required for website functionality, security, and authentication.",
            "Analytics Cookies: Help us understand how visitors interact with our website to improve user experience.",
            "Marketing Cookies: Used to deliver relevant advertisements and measure campaign effectiveness.",
            "You can manage cookie preferences through your browser settings or our cookie consent tool.",
            "Disabling certain cookies may affect website functionality."
          ]
        }
      ],
      thirdParty: {
        title: "Third-Party Services",
        content: "We may share information with trusted third-party service providers who assist us in operating our business, including payment processors, shipping partners, analytics providers, and marketing platforms. These partners are contractually obligated to protect your information and use it only for specified purposes."
      },
      children: {
        title: "Children's Privacy",
        content: "Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected data from a child, we will take immediate steps to delete such information."
      },
      changes: {
        title: "Policy Updates",
        content: "We may update this Privacy Policy periodically to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on our website with a new 'Last Updated' date. We encourage you to review this policy regularly."
      },
      contact: {
        title: "Contact Us",
        content: "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer:",
        email: "service@maxios.co.il",
        address: "MAXIOS Technologies Ltd.\nData Protection Office\nIsrael"
      }
    },
    he: {
      title: "מדיניות פרטיות",
      lastUpdated: "עדכון אחרון: ינואר 2026",
      intro: "ב-MAXIOS, אנו מחויבים להגן על פרטיותך ולהבטיח את אבטחת המידע האישי שלך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, חושפים ומגנים על המידע שלך כאשר אתה מבקר באתר שלנו, מבצע רכישות או מתקשר עם השירותים שלנו.",
      sections: [
        {
          icon: Database,
          title: "מידע שאנו אוספים",
          content: [
            "מידע אישי: שם, כתובת דוא\"ל, מספר טלפון, כתובות משלוח וחיוב, ופרטי תשלום כאשר אתה מבצע רכישה או יוצר חשבון.",
            "מידע על המכשיר: כתובת IP, סוג דפדפן, מערכת הפעלה, מזהי מכשיר ודפוסי גלישה באתר שלנו.",
            "נתוני עסקאות: היסטוריית רכישות, העדפות מוצרים, רישומי אחריות ואינטראקציות עם שירות לקוחות.",
            "נתוני תקשורת: רישומי התכתבות כאשר אתה פונה לצוות התמיכה שלנו, משתתף בסקרים או נרשם לניוזלטרים שלנו.",
            "אנליטיקת שימוש: כיצד אתה מתקשר עם האתר שלנו, כולל דפים שנצפו, זמן שהייה, דפוסי לחיצות ונתיבי ניווט."
          ]
        },
        {
          icon: Eye,
          title: "כיצד אנו משתמשים במידע שלך",
          content: [
            "עיבוד הזמנות: לעבד ולמלא את ההזמנות שלך, לנהל תשלומים ולארגן משלוח של מערכות השאיבה הפרימיום שלנו.",
            "תמיכת לקוחות: לספק סיוע טכני, שירותי אחריות ולהגיב לפניות שלך ביעילות.",
            "שיפור מוצרים: לנתח דפוסי שימוש ומשוב כדי לשפר באופן מתמיד את הצעות המוצרים וחוויית המשתמש.",
            "תקשורת שיווקית: לשלוח הצעות קידום מכירות, עדכוני מוצרים וחדשות החברה (בהסכמתך).",
            "ציות לחוק: לציית לחוקים, תקנות והליכים משפטיים החלים.",
            "מניעת הונאה: לזהות, למנוע ולטפל בפעילויות הונאה ואיומי אבטחה."
          ]
        },
        {
          icon: Shield,
          title: "הגנת מידע ואבטחה",
          content: [
            "אנו מיישמים אמצעי אבטחה מובילים בתעשייה כולל הצפנת SSL/TLS, שערי תשלום מאובטחים וביקורות אבטחה קבועות.",
            "הגישה למידע אישי מוגבלת לאנשי צוות מורשים הזקוקים לו למטרות עסקיות לגיטימיות.",
            "אנו מתחזקים מערכות גיבוי נתונים מקיפות ופרוטוקולי התאוששות מאסון כדי להבטיח שלמות נתונים.",
            "בדיקות חדירה והערכות פגיעות מבוצעות באופן קבוע על ידי מומחי אבטחה צד שלישי.",
            "כל העובדים עוברים הכשרת הגנת מידע חובה ומחויבים להסכמי סודיות מחמירים."
          ]
        },
        {
          icon: Globe,
          title: "העברות מידע בינלאומיות",
          content: [
            "MAXIOS פועלת בקנה מידה עולמי, והמידע שלך עשוי להיות מועבר ומעובד במדינות שאינן מדינת מגוריך.",
            "אנו מבטיחים שאמצעי הגנה מתאימים קיימים להעברות בינלאומיות, כולל סעיפים חוזיים סטנדרטיים שאושרו על ידי רשויות רלוונטיות.",
            "מרכזי הנתונים שלנו ממוקמים במתקנים מאובטחים העומדים בתקני אבטחה בינלאומיים (ISO 27001, SOC 2).",
            "אנו משתפים פעולה רק עם ספקי שירות המפגינים רמות שוות ערך של הגנת מידע."
          ]
        },
        {
          icon: Lock,
          title: "הזכויות והבחירות שלך",
          content: [
            "גישה: יש לך זכות לבקש עותק של המידע האישי שאנו מחזיקים עליך.",
            "תיקון: אתה יכול לבקש תיקון של נתונים אישיים לא מדויקים או לא שלמים.",
            "מחיקה: אתה יכול לבקש מחיקת המידע האישי שלך, בכפוף לדרישות שמירה חוקיות.",
            "ניידות: יש לך זכות לקבל את הנתונים שלך בפורמט מובנה ונפוץ.",
            "ביטול הסכמה: אתה יכול לבטל הסכמה לתקשורת שיווקית בכל עת על ידי לחיצה על 'בטל מנוי' או יצירת קשר איתנו.",
            "הגבלה: אתה יכול לבקש הגבלת עיבוד בנסיבות מסוימות."
          ]
        },
        {
          icon: Clock,
          title: "שמירת מידע",
          content: [
            "אנו שומרים מידע אישי כל עוד נדרש למילוי המטרות המתוארות במדיניות זו.",
            "רשומות עסקאות נשמרות למשך 7 שנים כדי לציית לתקנות מס וחשבונאות.",
            "העדפות שיווק נשמרות עד שתבטל הסכמה או תבקש מחיקה.",
            "מידע הקשור לאחריות נשמר למשך תקופת אחריות המוצר בתוספת שנתיים.",
            "לפי בקשה למחיקה, נסיר את הנתונים שלך תוך 30 יום, למעט במקרים בהם שמירה נדרשת על פי חוק."
          ]
        },
        {
          icon: FileText,
          title: "עוגיות וטכנולוגיות מעקב",
          content: [
            "עוגיות חיוניות: נדרשות לפונקציונליות האתר, אבטחה ואימות.",
            "עוגיות אנליטיקה: עוזרות לנו להבין כיצד מבקרים מתקשרים עם האתר שלנו כדי לשפר את חוויית המשתמש.",
            "עוגיות שיווק: משמשות להעברת פרסומות רלוונטיות ומדידת יעילות קמפיינים.",
            "אתה יכול לנהל העדפות עוגיות דרך הגדרות הדפדפן שלך או כלי הסכמת העוגיות שלנו.",
            "השבתת עוגיות מסוימות עשויה להשפיע על פונקציונליות האתר."
          ]
        }
      ],
      thirdParty: {
        title: "שירותי צד שלישי",
        content: "אנו עשויים לשתף מידע עם ספקי שירות צד שלישי מהימנים המסייעים לנו בהפעלת העסק שלנו, כולל מעבדי תשלומים, שותפי משלוח, ספקי אנליטיקה ופלטפורמות שיווק. שותפים אלה מחויבים חוזית להגן על המידע שלך ולהשתמש בו רק למטרות מוגדרות."
      },
      children: {
        title: "פרטיות ילדים",
        content: "השירותים שלנו אינם מיועדים לאנשים מתחת לגיל 16. אנו לא אוספים ביודעין מידע אישי מילדים. אם נודע לנו שאספנו בטעות נתונים מילד, ננקוט צעדים מיידיים למחיקת מידע זה."
      },
      changes: {
        title: "עדכוני מדיניות",
        content: "אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת כדי לשקף שינויים בפרקטיקות שלנו, טכנולוגיות, דרישות חוקיות או גורמים אחרים. נודיע לך על שינויים מהותיים על ידי פרסום המדיניות המעודכנת באתר שלנו עם תאריך 'עדכון אחרון' חדש. אנו ממליצים לעיין במדיניות זו באופן קבוע."
      },
      contact: {
        title: "צור קשר",
        content: "אם יש לך שאלות, חששות או בקשות בנוגע למדיניות פרטיות זו או לפרקטיקות הנתונים שלנו, אנא פנה לממונה על הגנת המידע שלנו:",
        email: "service@maxios.co.il",
        address: "MAXIOS Technologies Ltd.\nמשרד הגנת המידע\nישראל"
      }
    },
    ar: {
      title: "سياسة الخصوصية",
      lastUpdated: "آخر تحديث: يناير 2026",
      intro: "في MAXIOS، نحن ملتزمون بحماية خصوصيتك وضمان أمان معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام والكشف عن معلوماتك وحمايتها عند زيارة موقعنا الإلكتروني أو إجراء عمليات شراء أو التفاعل مع خدماتنا.",
      sections: [
        {
          icon: Database,
          title: "المعلومات التي نجمعها",
          content: [
            "المعلومات الشخصية: الاسم وعنوان البريد الإلكتروني ورقم الهاتف وعناوين الشحن والفوترة ومعلومات الدفع عند إجراء عملية شراء أو إنشاء حساب.",
            "معلومات الجهاز: عنوان IP ونوع المتصفح ونظام التشغيل ومعرفات الجهاز وأنماط التصفح على موقعنا.",
            "بيانات المعاملات: سجل الشراء وتفضيلات المنتج وتسجيلات الضمان وتفاعلات خدمة العملاء.",
            "بيانات الاتصال: سجلات المراسلات عند الاتصال بفريق الدعم لدينا أو المشاركة في الاستطلاعات أو الاشتراك في النشرات الإخبارية.",
            "تحليلات الاستخدام: كيفية تفاعلك مع موقعنا، بما في ذلك الصفحات التي تمت زيارتها والوقت المستغرق وأنماط النقر ومسارات التنقل."
          ]
        },
        {
          icon: Eye,
          title: "كيف نستخدم معلوماتك",
          content: [
            "معالجة الطلبات: لمعالجة وتنفيذ طلباتك وإدارة المدفوعات وترتيب تسليم أنظمة التنظيف المتميزة لدينا.",
            "دعم العملاء: لتقديم المساعدة الفنية وخدمات الضمان والرد على استفساراتك بكفاءة.",
            "تحسين المنتج: لتحليل أنماط الاستخدام والتعليقات لتحسين عروض منتجاتنا وتجربة المستخدم باستمرار.",
            "الاتصالات التسويقية: لإرسال العروض الترويجية وتحديثات المنتجات وأخبار الشركة (بموافقتك).",
            "الامتثال القانوني: للامتثال للقوانين واللوائح والإجراءات القانونية المعمول بها.",
            "منع الاحتيال: لاكتشاف ومنع ومعالجة الأنشطة الاحتيالية والتهديدات الأمنية."
          ]
        },
        {
          icon: Shield,
          title: "حماية البيانات والأمان",
          content: [
            "نحن ننفذ تدابير أمنية رائدة في الصناعة بما في ذلك تشفير SSL/TLS وبوابات الدفع الآمنة وعمليات التدقيق الأمني المنتظمة.",
            "يقتصر الوصول إلى البيانات الشخصية على الموظفين المصرح لهم الذين يحتاجون إليها لأغراض تجارية مشروعة.",
            "نحن نحتفظ بأنظمة نسخ احتياطي شاملة للبيانات وإجراءات استعادة البيانات لضمان سلامتها.",
            "يتم إجراء اختبارات الاختراق وتقييمات الضعف بانتظام من قبل خبراء أمن من جهات خارجية.",
            "يخضع جميع الموظفين لتدريب إلزامي على حماية البيانات ويلتزمون باتفاقيات سرية صارمة."
          ]
        },
        {
          icon: Globe,
          title: "نقل البيانات الدولي",
          content: [
            "تعمل MAXIOS على مستوى عالمي، وقد يتم نقل معلوماتك ومعالجتها في بلدان أخرى غير بلد إقامتك.",
            "نحن نضمن وجود ضمانات مناسبة لعمليات النقل الدولية، بما في ذلك البنود التعاقدية القياسية المعتمدة من السلطات ذات الصلة.",
            "تقع مراكز البيانات لدينا في مرافق آمنة تتوافق مع معايير الأمان الدولية (ISO 27001، SOC 2).",
            "نحن نتشارك فقط مع مقدمي الخدمات الذين يظهرون مستويات مكافئة من حماية البيانات."
          ]
        },
        {
          icon: Lock,
          title: "حقوقك وخياراتك",
          content: [
            "الوصول: لديك الحق في طلب نسخة من المعلومات الشخصية التي نحتفظ بها عنك.",
            "التصحيح: يمكنك طلب تصحيح البيانات الشخصية غير الدقيقة أو غير المكتملة.",
            "الحذف: يمكنك طلب حذف بياناتك الشخصية، مع مراعاة متطلبات الاحتفاظ القانونية.",
            "قابلية النقل: لديك الحق في تلقي بياناتك بتنسيق منظم وشائع الاستخدام.",
            "إلغاء الاشتراك: يمكنك إلغاء الاشتراك في الاتصالات التسويقية في أي وقت بالنقر على 'إلغاء الاشتراك' أو الاتصال بنا.",
            "التقييد: يمكنك طلب تقييد المعالجة في ظروف معينة."
          ]
        },
        {
          icon: Clock,
          title: "الاحتفاظ بالبيانات",
          content: [
            "نحتفظ بالمعلومات الشخصية طالما كان ذلك ضروريًا لتحقيق الأغراض الموضحة في هذه السياسة.",
            "يتم الاحتفاظ بسجلات المعاملات لمدة 7 سنوات للامتثال للوائح الضريبية والمحاسبية.",
            "يتم الاحتفاظ بتفضيلات التسويق حتى تسحب موافقتك أو تطلب الحذف.",
            "يتم الاحتفاظ بالمعلومات المتعلقة بالضمان طوال مدة ضمان المنتج بالإضافة إلى عامين.",
            "عند طلب الحذف، سنزيل بياناتك في غضون 30 يومًا، باستثناء الحالات التي يكون فيها الاحتفاظ مطلوبًا قانونيًا."
          ]
        },
        {
          icon: FileText,
          title: "ملفات تعريف الارتباط وتقنيات التتبع",
          content: [
            "ملفات تعريف الارتباط الأساسية: مطلوبة لوظائف الموقع والأمان والمصادقة.",
            "ملفات تعريف الارتباط التحليلية: تساعدنا في فهم كيفية تفاعل الزوار مع موقعنا لتحسين تجربة المستخدم.",
            "ملفات تعريف الارتباط التسويقية: تُستخدم لتقديم إعلانات ذات صلة وقياس فعالية الحملة.",
            "يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح أو أداة الموافقة على ملفات تعريف الارتباط الخاصة بنا.",
            "قد يؤثر تعطيل بعض ملفات تعريف الارتباط على وظائف الموقع."
          ]
        }
      ],
      thirdParty: {
        title: "خدمات الطرف الثالث",
        content: "قد نشارك المعلومات مع مقدمي خدمات طرف ثالث موثوقين يساعدوننا في تشغيل أعمالنا، بما في ذلك معالجي الدفع وشركاء الشحن ومقدمي التحليلات ومنصات التسويق. هؤلاء الشركاء ملزمون تعاقديًا بحماية معلوماتك واستخدامها فقط لأغراض محددة."
      },
      children: {
        title: "خصوصية الأطفال",
        content: "خدماتنا غير موجهة للأفراد الذين تقل أعمارهم عن 16 عامًا. نحن لا نجمع عن قصد معلومات شخصية من الأطفال. إذا علمنا أننا جمعنا بيانات من طفل عن غير قصد، فسنتخذ خطوات فورية لحذف هذه المعلومات."
      },
      changes: {
        title: "تحديثات السياسة",
        content: "قد نقوم بتحديث سياسة الخصوصية هذه بشكل دوري لتعكس التغييرات في ممارساتنا أو التقنيات أو المتطلبات القانونية أو عوامل أخرى. سنخطرك بالتغييرات الجوهرية عن طريق نشر السياسة المحدثة على موقعنا بتاريخ 'آخر تحديث' جديد. نشجعك على مراجعة هذه السياسة بانتظام."
      },
      contact: {
        title: "اتصل بنا",
        content: "إذا كانت لديك أسئلة أو مخاوف أو طلبات بخصوص سياسة الخصوصية هذه أو ممارسات البيانات لدينا، يرجى الاتصال بمسؤول حماية البيانات لدينا:",
        email: "service@maxios.co.il",
        address: "MAXIOS Technologies Ltd.\nمكتب حماية البيانات\nإسرائيل"
      }
    }
  };

  const t = content[lang];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 min-h-screen">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 mb-8">
          <Shield className="text-orange-500" size={24} />
          <span className="text-orange-500 font-black text-xs uppercase tracking-widest">Legal Document</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-4">
          {t.title}
        </h1>
        <p className="text-white/40 text-sm uppercase tracking-widest">{t.lastUpdated}</p>
      </div>

      {/* Introduction */}
      <div className="bg-white/5 border border-white/10 p-8 mb-12">
        <p className="text-white/70 leading-relaxed">{t.intro}</p>
      </div>

      {/* Main Sections */}
      <div className="space-y-8">
        {t.sections.map((section, index) => (
          <div key={index} className="bg-black/40 border border-white/10 p-8 hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <section.icon className="text-orange-500" size={24} />
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">{section.title}</h2>
            </div>
            <ul className="space-y-4">
              {section.content.map((item, i) => (
                <li key={i} className="flex gap-3 text-white/60 text-sm leading-relaxed">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Third Party */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.thirdParty.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{t.thirdParty.content}</p>
        </div>

        {/* Children's Privacy */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.children.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{t.children.content}</p>
        </div>

        {/* Policy Updates */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.changes.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{t.changes.content}</p>
        </div>

        {/* Contact */}
        <div className="bg-orange-500/10 border border-orange-500/30 p-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.contact.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">{t.contact.content}</p>
          <div className="flex flex-col md:flex-row gap-6">
            <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 text-orange-500 hover:text-white transition-colors">
              <Mail size={20} />
              <span className="font-bold">{t.contact.email}</span>
            </a>
          </div>
          <p className="text-white/40 text-sm mt-4 whitespace-pre-line">{t.contact.address}</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-16 text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} MAXIOS Technologies Ltd. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};
