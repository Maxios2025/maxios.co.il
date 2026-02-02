import React from 'react';
import { Shield, Clock, CheckCircle, XCircle, Wrench, FileText, Phone, Mail, Package, AlertTriangle } from 'lucide-react';
import { Language } from '../App';

interface WarrantyProps {
  lang: Language;
}

export const Warranty: React.FC<WarrantyProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Warranty Policy",
      subtitle: "Your Investment, Protected",
      lastUpdated: "Effective: January 2026",
      intro: "At MAXIOS, we stand behind the quality and durability of every product we manufacture. Our comprehensive warranty program reflects our commitment to engineering excellence and customer satisfaction. When you purchase a MAXIOS product, you're not just buying a vacuum system – you're investing in years of reliable performance backed by our industry-leading warranty coverage.",

      coverage: {
        title: "Warranty Coverage",
        items: [
          {
            product: "Vacuum Systems",
            period: "2 Years",
            description: "Full coverage on all main vacuum units including motor, housing, and electronic components"
          },
          {
            product: "Batteries",
            period: "18 Months",
            description: "Coverage for battery capacity retention above 80% of original capacity"
          },
          {
            product: "Accessories",
            period: "1 Year",
            description: "All included accessories such as nozzles, brushes, and charging docks"
          },
          {
            product: "Filters",
            period: "6 Months",
            description: "HEPA and standard filters against manufacturing defects"
          }
        ]
      },

      covered: {
        title: "What's Covered",
        icon: CheckCircle,
        items: [
          "Manufacturing defects in materials and workmanship",
          "Motor failure under normal operating conditions",
          "Electronic component malfunctions",
          "Structural defects in housing and body",
          "Battery cells that fail to hold charge (within warranty period)",
          "Defective switches, buttons, and controls",
          "Faulty LED displays and indicators",
          "Suction loss due to internal component failure"
        ]
      },

      notCovered: {
        title: "What's Not Covered",
        icon: XCircle,
        items: [
          "Damage from misuse, abuse, or negligence",
          "Normal wear and tear (brushes, filters, belts)",
          "Cosmetic damage (scratches, dents, discoloration)",
          "Damage from unauthorized repairs or modifications",
          "Damage from use with non-MAXIOS accessories",
          "Water damage or exposure to excessive moisture",
          "Damage from power surges or improper voltage",
          "Commercial or industrial use (residential warranty only)",
          "Products purchased from unauthorized retailers",
          "Damage during shipping (file claim with carrier)"
        ]
      },

      howToClaim: {
        title: "How to Claim Warranty",
        steps: [
          {
            step: "1",
            title: "Contact Support",
            description: "Reach out to our customer service team via email or phone with your order number and description of the issue."
          },
          {
            step: "2",
            title: "Provide Documentation",
            description: "Submit proof of purchase (receipt or order confirmation) and photos/videos demonstrating the defect."
          },
          {
            step: "3",
            title: "Receive Authorization",
            description: "Our team will review your claim and issue a Return Merchandise Authorization (RMA) number if approved."
          },
          {
            step: "4",
            title: "Ship Product",
            description: "Carefully package the product and ship to our service center using the provided shipping label."
          },
          {
            step: "5",
            title: "Resolution",
            description: "We will repair, replace, or refund your product within 14 business days of receiving it."
          }
        ]
      },

      extendedWarranty: {
        title: "Extended Warranty Program",
        description: "Extend your peace of mind with MAXIOS Extended Protection. Available for purchase within 30 days of your original product purchase.",
        plans: [
          { duration: "+1 Year", price: "₪149", description: "Extends total coverage to 3 years" },
          { duration: "+2 Years", price: "₪249", description: "Extends total coverage to 4 years" },
          { duration: "+3 Years", price: "₪349", description: "Extends total coverage to 5 years" }
        ],
        benefits: [
          "No deductibles or hidden fees",
          "Covers accidental damage (drops, spills)",
          "Priority customer support",
          "Free shipping on warranty repairs",
          "Transferable to new owner if you sell the product"
        ]
      },

      important: {
        title: "Important Information",
        items: [
          "Register your product within 30 days of purchase to activate warranty",
          "Keep your original receipt or proof of purchase",
          "Warranty is valid only in the country of original purchase",
          "Replacement products carry the remainder of the original warranty",
          "MAXIOS reserves the right to use refurbished parts for repairs",
          "Data stored on smart devices may be lost during service"
        ]
      },

      contact: {
        title: "Warranty Support",
        description: "Our dedicated warranty team is here to help you with any issues.",
        email: "service@maxios.co.il",
        phone: "Available Sunday - Thursday, 9:00 - 18:00",
        response: "Response within 24 business hours"
      }
    },
    he: {
      title: "מדיניות אחריות",
      subtitle: "ההשקעה שלך, מוגנת",
      lastUpdated: "בתוקף: ינואר 2026",
      intro: "ב-MAXIOS, אנו עומדים מאחורי האיכות והעמידות של כל מוצר שאנו מייצרים. תוכנית האחריות המקיפה שלנו משקפת את המחויבות שלנו למצוינות הנדסית ושביעות רצון הלקוחות. כאשר אתה רוכש מוצר MAXIOS, אתה לא רק קונה מערכת שאיבה – אתה משקיע בשנים של ביצועים אמינים המגובים בכיסוי האחריות המוביל בתעשייה שלנו.",

      coverage: {
        title: "כיסוי אחריות",
        items: [
          {
            product: "מערכות שאיבה",
            period: "שנתיים",
            description: "כיסוי מלא על כל יחידות השאיבה העיקריות כולל מנוע, מארז ורכיבים אלקטרוניים"
          },
          {
            product: "סוללות",
            period: "18 חודשים",
            description: "כיסוי לשימור קיבולת סוללה מעל 80% מהקיבולת המקורית"
          },
          {
            product: "אביזרים",
            period: "שנה אחת",
            description: "כל האביזרים הכלולים כגון פיות, מברשות ותחנות טעינה"
          },
          {
            product: "פילטרים",
            period: "6 חודשים",
            description: "פילטרים HEPA ופילטרים רגילים כנגד פגמי ייצור"
          }
        ]
      },

      covered: {
        title: "מה מכוסה",
        icon: CheckCircle,
        items: [
          "פגמי ייצור בחומרים ובעבודה",
          "תקלת מנוע בתנאי הפעלה רגילים",
          "תקלות ברכיבים אלקטרוניים",
          "פגמים מבניים במארז ובגוף",
          "תאי סוללה שלא מחזיקים מטען (בתקופת האחריות)",
          "מתגים, כפתורים ובקרים פגומים",
          "תצוגות LED ומחוונים פגומים",
          "איבוד שאיבה עקב תקלת רכיב פנימי"
        ]
      },

      notCovered: {
        title: "מה לא מכוסה",
        icon: XCircle,
        items: [
          "נזק משימוש לא נכון, התעללות או רשלנות",
          "בלאי רגיל (מברשות, פילטרים, רצועות)",
          "נזק קוסמטי (שריטות, מכות, שינוי צבע)",
          "נזק מתיקונים או שינויים לא מורשים",
          "נזק משימוש באביזרים שאינם של MAXIOS",
          "נזקי מים או חשיפה ללחות מופרזת",
          "נזק מזרמי יתר או מתח לא תקין",
          "שימוש מסחרי או תעשייתי (אחריות למגורים בלבד)",
          "מוצרים שנרכשו ממשווקים לא מורשים",
          "נזק במשלוח (יש להגיש תביעה לחברת המשלוחים)"
        ]
      },

      howToClaim: {
        title: "כיצד לתבוע אחריות",
        steps: [
          {
            step: "1",
            title: "צור קשר עם התמיכה",
            description: "פנה לצוות שירות הלקוחות שלנו באימייל או בטלפון עם מספר ההזמנה ותיאור הבעיה."
          },
          {
            step: "2",
            title: "ספק תיעוד",
            description: "שלח הוכחת רכישה (קבלה או אישור הזמנה) ותמונות/סרטונים המדגימים את הפגם."
          },
          {
            step: "3",
            title: "קבל אישור",
            description: "הצוות שלנו יבדוק את התביעה שלך ויפיק מספר RMA אם התביעה תאושר."
          },
          {
            step: "4",
            title: "שלח את המוצר",
            description: "ארוז את המוצר בזהירות ושלח למרכז השירות שלנו באמצעות תווית המשלוח שסופקה."
          },
          {
            step: "5",
            title: "פתרון",
            description: "נתקן, נחליף או נחזיר את המוצר תוך 14 ימי עסקים מקבלתו."
          }
        ]
      },

      extendedWarranty: {
        title: "תוכנית אחריות מורחבת",
        description: "הרחב את השקט הנפשי שלך עם הגנה מורחבת של MAXIOS. זמין לרכישה תוך 30 יום מרכישת המוצר המקורי.",
        plans: [
          { duration: "+שנה אחת", price: "₪149", description: "מרחיב את הכיסוי הכולל ל-3 שנים" },
          { duration: "+שנתיים", price: "₪249", description: "מרחיב את הכיסוי הכולל ל-4 שנים" },
          { duration: "+3 שנים", price: "₪349", description: "מרחיב את הכיסוי הכולל ל-5 שנים" }
        ],
        benefits: [
          "ללא השתתפות עצמית או עמלות נסתרות",
          "מכסה נזק תאונתי (נפילות, שפיכות)",
          "תמיכת לקוחות בעדיפות",
          "משלוח חינם על תיקוני אחריות",
          "ניתן להעברה לבעלים חדש אם תמכור את המוצר"
        ]
      },

      important: {
        title: "מידע חשוב",
        items: [
          "רשום את המוצר תוך 30 יום מהרכישה להפעלת האחריות",
          "שמור את הקבלה המקורית או הוכחת הרכישה",
          "האחריות תקפה רק במדינת הרכישה המקורית",
          "מוצרים חלופיים נושאים את יתרת האחריות המקורית",
          "MAXIOS שומרת לעצמה את הזכות להשתמש בחלקים מחודשים לתיקונים",
          "נתונים המאוחסנים במכשירים חכמים עלולים להיאבד במהלך השירות"
        ]
      },

      contact: {
        title: "תמיכת אחריות",
        description: "צוות האחריות המסור שלנו כאן לעזור לך בכל בעיה.",
        email: "service@maxios.co.il",
        phone: "זמין ראשון - חמישי, 9:00 - 18:00",
        response: "מענה תוך 24 שעות עסקים"
      }
    },
    ar: {
      title: "سياسة الضمان",
      subtitle: "استثمارك، محمي",
      lastUpdated: "ساري المفعول: يناير 2026",
      intro: "في MAXIOS، نقف وراء جودة ومتانة كل منتج نصنعه. يعكس برنامج الضمان الشامل لدينا التزامنا بالتميز الهندسي ورضا العملاء. عندما تشتري منتج MAXIOS، فأنت لا تشتري مجرد نظام مكنسة كهربائية - أنت تستثمر في سنوات من الأداء الموثوق المدعوم بتغطية الضمان الرائدة في الصناعة.",

      coverage: {
        title: "تغطية الضمان",
        items: [
          {
            product: "أنظمة المكانس الكهربائية",
            period: "سنتان",
            description: "تغطية كاملة على جميع وحدات المكانس الرئيسية بما في ذلك المحرك والهيكل والمكونات الإلكترونية"
          },
          {
            product: "البطاريات",
            period: "18 شهرًا",
            description: "تغطية للاحتفاظ بسعة البطارية فوق 80% من السعة الأصلية"
          },
          {
            product: "الملحقات",
            period: "سنة واحدة",
            description: "جميع الملحقات المضمنة مثل الفوهات والفرش ومحطات الشحن"
          },
          {
            product: "الفلاتر",
            period: "6 أشهر",
            description: "فلاتر HEPA والفلاتر القياسية ضد عيوب التصنيع"
          }
        ]
      },

      covered: {
        title: "ما يغطيه الضمان",
        icon: CheckCircle,
        items: [
          "عيوب التصنيع في المواد والصنعة",
          "تعطل المحرك في ظل ظروف التشغيل العادية",
          "أعطال المكونات الإلكترونية",
          "العيوب الهيكلية في الهيكل والجسم",
          "خلايا البطارية التي لا تحتفظ بالشحن (خلال فترة الضمان)",
          "المفاتيح والأزرار وأدوات التحكم المعيبة",
          "شاشات LED والمؤشرات المعيبة",
          "فقدان الشفط بسبب تعطل المكونات الداخلية"
        ]
      },

      notCovered: {
        title: "ما لا يغطيه الضمان",
        icon: XCircle,
        items: [
          "الأضرار الناتجة عن سوء الاستخدام أو الإهمال",
          "البلى العادي (الفرش، الفلاتر، الأحزمة)",
          "الأضرار التجميلية (الخدوش، الانبعاجات، تغير اللون)",
          "الأضرار الناتجة عن الإصلاحات أو التعديلات غير المصرح بها",
          "الأضرار الناتجة عن استخدام ملحقات غير MAXIOS",
          "أضرار المياه أو التعرض للرطوبة المفرطة",
          "الأضرار الناتجة عن ارتفاع التيار أو الجهد غير الصحيح",
          "الاستخدام التجاري أو الصناعي (ضمان سكني فقط)",
          "المنتجات المشتراة من تجار التجزئة غير المعتمدين",
          "الأضرار أثناء الشحن (قدم مطالبة لشركة الشحن)"
        ]
      },

      howToClaim: {
        title: "كيفية المطالبة بالضمان",
        steps: [
          {
            step: "1",
            title: "اتصل بالدعم",
            description: "تواصل مع فريق خدمة العملاء لدينا عبر البريد الإلكتروني أو الهاتف مع رقم طلبك ووصف المشكلة."
          },
          {
            step: "2",
            title: "قدم الوثائق",
            description: "أرسل إثبات الشراء (الإيصال أو تأكيد الطلب) والصور/مقاطع الفيديو التي توضح العيب."
          },
          {
            step: "3",
            title: "احصل على التفويض",
            description: "سيراجع فريقنا مطالبتك ويصدر رقم RMA إذا تمت الموافقة."
          },
          {
            step: "4",
            title: "شحن المنتج",
            description: "قم بتغليف المنتج بعناية وشحنه إلى مركز الخدمة لدينا باستخدام ملصق الشحن المقدم."
          },
          {
            step: "5",
            title: "الحل",
            description: "سنقوم بإصلاح أو استبدال أو استرداد منتجك في غضون 14 يوم عمل من استلامه."
          }
        ]
      },

      extendedWarranty: {
        title: "برنامج الضمان الممتد",
        description: "وسّع راحة بالك مع حماية MAXIOS الممتدة. متاح للشراء في غضون 30 يومًا من شراء المنتج الأصلي.",
        plans: [
          { duration: "+سنة واحدة", price: "₪149", description: "يمتد إجمالي التغطية إلى 3 سنوات" },
          { duration: "+سنتان", price: "₪249", description: "يمتد إجمالي التغطية إلى 4 سنوات" },
          { duration: "+3 سنوات", price: "₪349", description: "يمتد إجمالي التغطية إلى 5 سنوات" }
        ],
        benefits: [
          "لا توجد مبالغ قابلة للخصم أو رسوم مخفية",
          "يغطي الأضرار العرضية (السقوط، الانسكاب)",
          "دعم عملاء ذو أولوية",
          "شحن مجاني على إصلاحات الضمان",
          "قابل للتحويل إلى مالك جديد إذا قمت ببيع المنتج"
        ]
      },

      important: {
        title: "معلومات مهمة",
        items: [
          "سجل منتجك في غضون 30 يومًا من الشراء لتفعيل الضمان",
          "احتفظ بالإيصال الأصلي أو إثبات الشراء",
          "الضمان صالح فقط في بلد الشراء الأصلي",
          "المنتجات البديلة تحمل ما تبقى من الضمان الأصلي",
          "تحتفظ MAXIOS بالحق في استخدام قطع مجددة للإصلاحات",
          "قد تُفقد البيانات المخزنة على الأجهزة الذكية أثناء الخدمة"
        ]
      },

      contact: {
        title: "دعم الضمان",
        description: "فريق الضمان المخصص لدينا هنا لمساعدتك في أي مشاكل.",
        email: "service@maxios.co.il",
        phone: "متاح الأحد - الخميس، 9:00 - 18:00",
        response: "الرد خلال 24 ساعة عمل"
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
          <span className="text-orange-500 font-black text-xs uppercase tracking-widest">Product Protection</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-4">
          {t.title}
        </h1>
        <p className="text-xl md:text-2xl text-orange-500 font-bold uppercase tracking-wider mb-4">
          {t.subtitle}
        </p>
        <p className="text-white/40 text-sm uppercase tracking-widest">{t.lastUpdated}</p>
      </div>

      {/* Introduction */}
      <div className="bg-white/5 border border-white/10 p-8 mb-12">
        <p className="text-white/70 leading-relaxed">{t.intro}</p>
      </div>

      {/* Warranty Coverage Table */}
      <div className="mb-12">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
          <Clock className="text-orange-500" size={28} />
          {t.coverage.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.coverage.items.map((item, i) => (
            <div key={i} className="bg-black/40 border border-white/10 p-6 hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-bold">{item.product}</h3>
                <span className="px-3 py-1 bg-orange-500 text-black font-black text-xs">{item.period}</span>
              </div>
              <p className="text-white/50 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What's Covered / Not Covered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Covered */}
        <div className="bg-green-500/5 border border-green-500/20 p-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            {t.covered.title}
          </h2>
          <ul className="space-y-3">
            {t.covered.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-white/60 text-sm">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not Covered */}
        <div className="bg-red-500/5 border border-red-500/20 p-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
            <XCircle className="text-red-500" size={24} />
            {t.notCovered.title}
          </h2>
          <ul className="space-y-3">
            {t.notCovered.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-white/60 text-sm">
                <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* How to Claim */}
      <div className="mb-12">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
          <Wrench className="text-orange-500" size={28} />
          {t.howToClaim.title}
        </h2>
        <div className="space-y-4">
          {t.howToClaim.steps.map((step, i) => (
            <div key={i} className="flex gap-6 p-6 bg-black/40 border border-white/10 hover:border-orange-500/30 transition-all">
              <div className="w-12 h-12 bg-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-black font-black text-xl">{step.step}</span>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extended Warranty */}
      <div className="mb-12 bg-orange-500/10 border border-orange-500/30 p-8">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4 flex items-center gap-4">
          <Package className="text-orange-500" size={28} />
          {t.extendedWarranty.title}
        </h2>
        <p className="text-white/60 mb-8">{t.extendedWarranty.description}</p>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {t.extendedWarranty.plans.map((plan, i) => (
            <div key={i} className="bg-black/40 border border-white/10 p-6 text-center hover:border-orange-500/50 transition-all">
              <div className="text-orange-500 font-black text-2xl mb-2">{plan.duration}</div>
              <div className="text-white font-black text-3xl mb-2">{plan.price}</div>
              <p className="text-white/50 text-sm">{plan.description}</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <h3 className="text-white font-bold mb-4">Extended Warranty Benefits:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.extendedWarranty.benefits.map((benefit, i) => (
            <div key={i} className="flex gap-3 text-white/60 text-sm">
              <CheckCircle className="text-orange-500 flex-shrink-0" size={16} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important Information */}
      <div className="mb-12 bg-yellow-500/5 border border-yellow-500/20 p-8">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
          <AlertTriangle className="text-yellow-500" size={24} />
          {t.important.title}
        </h2>
        <ul className="space-y-3">
          {t.important.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-white/60 text-sm">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="bg-black/40 border border-white/10 p-8">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-4">
          {t.contact.title}
        </h2>
        <p className="text-white/60 mb-6">{t.contact.description}</p>
        <div className="space-y-4">
          <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 text-orange-500 hover:text-white transition-colors">
            <Mail size={20} />
            <span className="font-bold">{t.contact.email}</span>
          </a>
          <div className="flex items-center gap-3 text-white/60">
            <Phone size={20} />
            <span>{t.contact.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <Clock size={20} />
            <span>{t.contact.response}</span>
          </div>
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
