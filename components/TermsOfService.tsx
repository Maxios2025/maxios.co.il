import React from 'react';
import { FileText, Scale, ShoppingBag, Truck, RefreshCw, Shield, AlertTriangle, Gavel, Globe, Mail } from 'lucide-react';
import { Language } from '../App';

interface TermsOfServiceProps {
  lang: Language;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ lang }) => {
  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "Last Updated: January 2026",
      intro: "Welcome to MAXIOS. These Terms of Service (\"Terms\") govern your access to and use of the MAXIOS website, products, and services. By accessing our website or purchasing our products, you agree to be bound by these Terms. Please read them carefully before proceeding.",

      sections: [
        {
          icon: Scale,
          title: "1. Acceptance of Terms",
          content: [
            "By accessing or using our website, creating an account, or purchasing products, you acknowledge that you have read, understood, and agree to be bound by these Terms.",
            "If you do not agree to these Terms, you must not access or use our services.",
            "We reserve the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the modified Terms.",
            "You must be at least 18 years old or have parental consent to use our services and make purchases."
          ]
        },
        {
          icon: ShoppingBag,
          title: "2. Products and Purchases",
          content: [
            "All product descriptions, specifications, and pricing are subject to change without notice.",
            "We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion.",
            "Prices displayed are in Israeli New Shekels (₪) and include applicable taxes unless otherwise stated.",
            "Payment must be received in full before products are shipped. We accept major credit cards and approved payment methods.",
            "Order confirmation does not guarantee product availability. We will notify you if any items are unavailable."
          ]
        },
        {
          icon: Truck,
          title: "3. Shipping and Delivery",
          content: [
            "Shipping times are estimates only and are not guaranteed. MAXIOS is not liable for delays caused by carriers or circumstances beyond our control.",
            "Risk of loss and title for products pass to you upon delivery to the carrier.",
            "You are responsible for providing accurate shipping information. Additional charges may apply for address corrections or redelivery.",
            "International shipments may be subject to import duties and taxes, which are the buyer's responsibility.",
            "Delivery is subject to product availability and verification of your order and payment information."
          ]
        },
        {
          icon: RefreshCw,
          title: "4. Returns and Refunds",
          content: [
            "Products may be returned within 14 days of delivery in original, unopened packaging for a full refund.",
            "Opened products may be returned within 14 days if defective or not as described. A restocking fee may apply.",
            "To initiate a return, contact our customer service team with your order number and reason for return.",
            "Refunds will be processed within 14 business days of receiving the returned product.",
            "Shipping costs for returns are the customer's responsibility unless the return is due to our error or product defect.",
            "Custom or personalized orders cannot be returned unless defective."
          ]
        },
        {
          icon: Shield,
          title: "5. Warranty",
          content: [
            "MAXIOS products are covered by a limited manufacturer's warranty against defects in materials and workmanship.",
            "Warranty period: 2 years from the date of original purchase for all vacuum systems; 1 year for accessories.",
            "Warranty does not cover damage from misuse, accidents, unauthorized modifications, or normal wear and tear.",
            "To claim warranty service, you must provide proof of purchase and contact our support team.",
            "At our discretion, we will repair, replace, or refund the product. This is your sole remedy under warranty.",
            "Warranty is non-transferable and applies only to the original purchaser."
          ]
        },
        {
          icon: FileText,
          title: "6. Intellectual Property",
          content: [
            "All content on this website, including text, graphics, logos, images, and software, is the property of MAXIOS Technologies Ltd.",
            "MAXIOS, our logo, and product names are registered trademarks. Unauthorized use is strictly prohibited.",
            "You may not copy, reproduce, distribute, or create derivative works from our content without express written permission.",
            "Any feedback or suggestions you provide may be used by MAXIOS without obligation or compensation to you."
          ]
        },
        {
          icon: AlertTriangle,
          title: "7. Limitation of Liability",
          content: [
            "TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAXIOS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.",
            "Our total liability for any claim arising from these Terms or your use of our products shall not exceed the amount you paid for the specific product giving rise to the claim.",
            "We do not warrant that our website will be uninterrupted, secure, or error-free.",
            "Some jurisdictions do not allow limitations on implied warranties or liability, so some limitations may not apply to you."
          ]
        },
        {
          icon: Gavel,
          title: "8. Dispute Resolution",
          content: [
            "These Terms shall be governed by and construed in accordance with the laws of the State of Israel.",
            "Any disputes arising from these Terms or your use of our services shall be resolved through binding arbitration in Israel.",
            "You agree to waive any right to participate in class action lawsuits against MAXIOS.",
            "Notwithstanding the above, MAXIOS may seek injunctive relief in any court of competent jurisdiction."
          ]
        },
        {
          icon: Globe,
          title: "9. International Users",
          content: [
            "Our services are operated from Israel. If you access our services from outside Israel, you do so at your own risk.",
            "You are responsible for compliance with local laws regarding online purchases and product imports.",
            "We make no representation that our products or services are appropriate or available for use in all locations.",
            "Export of certain products may be restricted. You agree not to export our products in violation of applicable laws."
          ]
        }
      ],

      userConduct: {
        title: "10. User Conduct",
        content: "When using our website and services, you agree not to:",
        items: [
          "Violate any applicable laws or regulations",
          "Infringe upon the rights of others",
          "Submit false or misleading information",
          "Attempt to gain unauthorized access to our systems",
          "Use automated systems to access our website without permission",
          "Interfere with the proper functioning of our services",
          "Engage in fraudulent activities or chargebacks"
        ]
      },

      termination: {
        title: "11. Termination",
        content: "We reserve the right to terminate or suspend your access to our services immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use our services will cease immediately. Provisions that by their nature should survive termination shall survive."
      },

      severability: {
        title: "12. Severability",
        content: "If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect."
      },

      entireAgreement: {
        title: "13. Entire Agreement",
        content: "These Terms, together with our Privacy Policy and any other legal notices published on our website, constitute the entire agreement between you and MAXIOS regarding your use of our services. These Terms supersede any prior agreements or communications."
      },

      contact: {
        title: "Contact Information",
        content: "For questions about these Terms of Service, please contact us:",
        company: "MAXIOS Technologies Ltd.",
        email: "service@maxios.co.il",
        location: "Israel"
      }
    },
    he: {
      title: "תנאי שימוש",
      lastUpdated: "עדכון אחרון: ינואר 2026",
      intro: "ברוכים הבאים ל-MAXIOS. תנאי שימוש אלה (\"התנאים\") מסדירים את הגישה והשימוש שלך באתר, במוצרים ובשירותים של MAXIOS. בגישה לאתר שלנו או ברכישת המוצרים שלנו, אתה מסכים להיות מחויב לתנאים אלה. אנא קרא אותם בעיון לפני שתמשיך.",

      sections: [
        {
          icon: Scale,
          title: "1. קבלת התנאים",
          content: [
            "בגישה או בשימוש באתר שלנו, ביצירת חשבון או ברכישת מוצרים, אתה מאשר שקראת, הבנת ומסכים להיות מחויב לתנאים אלה.",
            "אם אינך מסכים לתנאים אלה, אינך רשאי לגשת או להשתמש בשירותים שלנו.",
            "אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. המשך השימוש בשירותים שלנו לאחר שינויים מהווה הסכמה לתנאים המעודכנים.",
            "עליך להיות בן 18 לפחות או לקבל הסכמת הורים כדי להשתמש בשירותים שלנו ולבצע רכישות."
          ]
        },
        {
          icon: ShoppingBag,
          title: "2. מוצרים ורכישות",
          content: [
            "כל תיאורי המוצרים, המפרטים והמחירים כפופים לשינויים ללא הודעה מוקדמת.",
            "אנו שומרים לעצמנו את הזכות להגביל כמויות, לסרב להזמנות או לבטל הזמנות לפי שיקול דעתנו.",
            "המחירים המוצגים הם בשקלים חדשים (₪) וכוללים מיסים רלוונטיים אלא אם צוין אחרת.",
            "יש לקבל תשלום מלא לפני משלוח המוצרים. אנו מקבלים כרטיסי אשראי עיקריים ואמצעי תשלום מאושרים.",
            "אישור הזמנה אינו מבטיח זמינות מוצר. נודיע לך אם פריטים כלשהם אינם זמינים."
          ]
        },
        {
          icon: Truck,
          title: "3. משלוח ואספקה",
          content: [
            "זמני משלוח הם הערכות בלבד ואינם מובטחים. MAXIOS אינה אחראית לעיכובים שנגרמו על ידי חברות שליחויות או נסיבות שמחוץ לשליטתנו.",
            "הסיכון לאובדן והבעלות על המוצרים עוברים אליך עם המסירה לשליח.",
            "אתה אחראי לספק מידע משלוח מדויק. חיובים נוספים עשויים לחול על תיקוני כתובות או משלוח חוזר.",
            "משלוחים בינלאומיים עשויים להיות כפופים למכס ומיסים, שהם באחריות הקונה.",
            "האספקה כפופה לזמינות המוצר ולאימות ההזמנה ופרטי התשלום שלך."
          ]
        },
        {
          icon: RefreshCw,
          title: "4. החזרות והחזרים",
          content: [
            "ניתן להחזיר מוצרים תוך 14 יום מהמסירה באריזה מקורית וסגורה להחזר מלא.",
            "ניתן להחזיר מוצרים פתוחים תוך 14 יום אם הם פגומים או לא כמתואר. עמלת אחסון עשויה לחול.",
            "ליזום החזרה, צור קשר עם צוות שירות הלקוחות שלנו עם מספר ההזמנה וסיבת ההחזרה.",
            "החזרים יעובדו תוך 14 ימי עסקים מקבלת המוצר המוחזר.",
            "עלויות משלוח להחזרות הן באחריות הלקוח אלא אם ההחזרה נובעת מטעות שלנו או פגם במוצר.",
            "הזמנות מותאמות אישית אינן ניתנות להחזרה אלא אם הן פגומות."
          ]
        },
        {
          icon: Shield,
          title: "5. אחריות",
          content: [
            "מוצרי MAXIOS מכוסים באחריות יצרן מוגבלת כנגד פגמים בחומרים ובייצור.",
            "תקופת אחריות: שנתיים מתאריך הרכישה המקורי לכל מערכות השאיבה; שנה אחת לאביזרים.",
            "האחריות אינה מכסה נזק משימוש לא נכון, תאונות, שינויים לא מורשים או בלאי רגיל.",
            "לתביעת שירות אחריות, עליך לספק הוכחת רכישה וליצור קשר עם צוות התמיכה שלנו.",
            "לפי שיקול דעתנו, נתקן, נחליף או נחזיר את המוצר. זו התרופה היחידה שלך במסגרת האחריות.",
            "האחריות אינה ניתנת להעברה וחלה רק על הרוכש המקורי."
          ]
        },
        {
          icon: FileText,
          title: "6. קניין רוחני",
          content: [
            "כל התוכן באתר זה, כולל טקסט, גרפיקה, לוגואים, תמונות ותוכנה, הוא רכושה של MAXIOS Technologies Ltd.",
            "MAXIOS, הלוגו שלנו ושמות המוצרים הם סימנים מסחריים רשומים. שימוש לא מורשה אסור בהחלט.",
            "אינך רשאי להעתיק, לשכפל, להפיץ או ליצור יצירות נגזרות מהתוכן שלנו ללא אישור מפורש בכתב.",
            "כל משוב או הצעות שתספק עשויים לשמש את MAXIOS ללא התחייבות או פיצוי לך."
          ]
        },
        {
          icon: AlertTriangle,
          title: "7. הגבלת אחריות",
          content: [
            "במידה המרבית המותרת על פי חוק, MAXIOS לא תהיה אחראית לכל נזק עקיף, מקרי, מיוחד, תוצאתי או עונשי.",
            "האחריות הכוללת שלנו לכל תביעה הנובעת מתנאים אלה או משימושך במוצרים שלנו לא תעלה על הסכום ששילמת עבור המוצר הספציפי.",
            "אנו לא מתחייבים שהאתר שלנו יהיה רציף, מאובטח או נטול שגיאות.",
            "חלק מתחומי השיפוט אינם מאפשרים הגבלות על אחריות משתמעת, ולכן חלק מההגבלות עשויות שלא לחול עליך."
          ]
        },
        {
          icon: Gavel,
          title: "8. יישוב סכסוכים",
          content: [
            "תנאים אלה יחולו ויפורשו בהתאם לחוקי מדינת ישראל.",
            "כל סכסוך הנובע מתנאים אלה או משימושך בשירותים שלנו ייושב באמצעות בוררות מחייבת בישראל.",
            "אתה מסכים לוותר על כל זכות להשתתף בתובענות ייצוגיות נגד MAXIOS.",
            "על אף האמור לעיל, MAXIOS רשאית לבקש צו מניעה בכל בית משפט בעל סמכות שיפוט."
          ]
        },
        {
          icon: Globe,
          title: "9. משתמשים בינלאומיים",
          content: [
            "השירותים שלנו מופעלים מישראל. אם אתה ניגש לשירותים שלנו מחוץ לישראל, אתה עושה זאת על אחריותך.",
            "אתה אחראי לציות לחוקים המקומיים בנוגע לרכישות מקוונות ויבוא מוצרים.",
            "אנו לא מצהירים שהמוצרים או השירותים שלנו מתאימים או זמינים לשימוש בכל המקומות.",
            "יצוא של מוצרים מסוימים עשוי להיות מוגבל. אתה מסכים שלא לייצא את המוצרים שלנו בניגוד לחוקים החלים."
          ]
        }
      ],

      userConduct: {
        title: "10. התנהגות משתמש",
        content: "בעת השימוש באתר ובשירותים שלנו, אתה מסכים שלא:",
        items: [
          "להפר חוקים או תקנות רלוונטיים",
          "לפגוע בזכויות של אחרים",
          "להגיש מידע שקרי או מטעה",
          "לנסות לקבל גישה לא מורשית למערכות שלנו",
          "להשתמש במערכות אוטומטיות לגישה לאתר שלנו ללא אישור",
          "להפריע לתפקוד התקין של השירותים שלנו",
          "לעסוק בפעילויות הונאה או ביטולי עסקאות"
        ]
      },

      termination: {
        title: "11. סיום",
        content: "אנו שומרים לעצמנו את הזכות לסיים או להשעות את הגישה שלך לשירותים שלנו באופן מיידי, ללא הודעה מוקדמת, מכל סיבה שהיא, כולל הפרה של תנאים אלה. עם הסיום, זכותך להשתמש בשירותים שלנו תיפסק מיד. הוראות שמטבען צריכות לשרוד את הסיום ישרדו."
      },

      severability: {
        title: "12. הפרדה",
        content: "אם הוראה כלשהי בתנאים אלה תימצא בלתי ניתנת לאכיפה או בלתי תקפה, הוראה זו תוגבל או תבוטל במידה המינימלית הנדרשת, וההוראות הנותרות יישארו בתוקף מלא."
      },

      entireAgreement: {
        title: "13. הסכם מלא",
        content: "תנאים אלה, יחד עם מדיניות הפרטיות שלנו וכל הודעות משפטיות אחרות שפורסמו באתר שלנו, מהווים את ההסכם המלא בינך לבין MAXIOS בנוגע לשימושך בשירותים שלנו. תנאים אלה מחליפים כל הסכמים או תקשורת קודמים."
      },

      contact: {
        title: "פרטי התקשרות",
        content: "לשאלות בנוגע לתנאי שימוש אלה, אנא צור איתנו קשר:",
        company: "MAXIOS Technologies Ltd.",
        email: "service@maxios.co.il",
        location: "ישראל"
      }
    },
    ar: {
      title: "شروط الخدمة",
      lastUpdated: "آخر تحديث: يناير 2026",
      intro: "مرحبًا بك في MAXIOS. تحكم شروط الخدمة هذه (\"الشروط\") وصولك إلى موقع MAXIOS ومنتجاته وخدماته واستخدامك لها. من خلال الوصول إلى موقعنا الإلكتروني أو شراء منتجاتنا، فإنك توافق على الالتزام بهذه الشروط. يرجى قراءتها بعناية قبل المتابعة.",

      sections: [
        {
          icon: Scale,
          title: "1. قبول الشروط",
          content: [
            "من خلال الوصول إلى موقعنا أو استخدامه أو إنشاء حساب أو شراء المنتجات، فإنك تقر بأنك قرأت هذه الشروط وفهمتها ووافقت على الالتزام بها.",
            "إذا كنت لا توافق على هذه الشروط، يجب عليك عدم الوصول إلى خدماتنا أو استخدامها.",
            "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يشكل استمرار استخدام خدماتنا بعد التغييرات قبولاً للشروط المعدلة.",
            "يجب أن يكون عمرك 18 عامًا على الأقل أو أن تحصل على موافقة الوالدين لاستخدام خدماتنا وإجراء عمليات الشراء."
          ]
        },
        {
          icon: ShoppingBag,
          title: "2. المنتجات والمشتريات",
          content: [
            "جميع أوصاف المنتجات والمواصفات والأسعار قابلة للتغيير دون إشعار.",
            "نحتفظ بالحق في تحديد الكميات أو رفض الطلبات أو إلغاء الطلبات وفقًا لتقديرنا.",
            "الأسعار المعروضة بالشيكل الإسرائيلي الجديد (₪) وتشمل الضرائب المطبقة ما لم يُذكر خلاف ذلك.",
            "يجب استلام الدفعة كاملة قبل شحن المنتجات. نقبل بطاقات الائتمان الرئيسية وطرق الدفع المعتمدة.",
            "تأكيد الطلب لا يضمن توفر المنتج. سنخطرك إذا كانت أي عناصر غير متوفرة."
          ]
        },
        {
          icon: Truck,
          title: "3. الشحن والتوصيل",
          content: [
            "أوقات الشحن هي تقديرات فقط وغير مضمونة. MAXIOS غير مسؤولة عن التأخيرات الناتجة عن شركات الشحن أو الظروف الخارجة عن سيطرتنا.",
            "ينتقل خطر الخسارة وملكية المنتجات إليك عند التسليم إلى شركة الشحن.",
            "أنت مسؤول عن تقديم معلومات شحن دقيقة. قد تنطبق رسوم إضافية على تصحيحات العنوان أو إعادة التسليم.",
            "قد تخضع الشحنات الدولية لرسوم الاستيراد والضرائب، والتي تقع على عاتق المشتري.",
            "يخضع التسليم لتوفر المنتج والتحقق من معلومات طلبك ودفعك."
          ]
        },
        {
          icon: RefreshCw,
          title: "4. الإرجاع والاسترداد",
          content: [
            "يمكن إرجاع المنتجات خلال 14 يومًا من التسليم في عبوتها الأصلية غير المفتوحة لاسترداد كامل المبلغ.",
            "يمكن إرجاع المنتجات المفتوحة خلال 14 يومًا إذا كانت معيبة أو غير موصوفة. قد تنطبق رسوم إعادة التخزين.",
            "لبدء الإرجاع، اتصل بفريق خدمة العملاء لدينا مع رقم طلبك وسبب الإرجاع.",
            "ستتم معالجة المبالغ المستردة خلال 14 يوم عمل من استلام المنتج المرتجع.",
            "تكاليف الشحن للإرجاع هي مسؤولية العميل ما لم يكن الإرجاع بسبب خطأنا أو عيب في المنتج.",
            "لا يمكن إرجاع الطلبات المخصصة أو الشخصية إلا إذا كانت معيبة."
          ]
        },
        {
          icon: Shield,
          title: "5. الضمان",
          content: [
            "منتجات MAXIOS مغطاة بضمان محدود من الشركة المصنعة ضد عيوب المواد والصنعة.",
            "فترة الضمان: سنتان من تاريخ الشراء الأصلي لجميع أنظمة المكانس الكهربائية؛ سنة واحدة للملحقات.",
            "لا يغطي الضمان الأضرار الناتجة عن سوء الاستخدام أو الحوادث أو التعديلات غير المصرح بها أو البلى العادي.",
            "للمطالبة بخدمة الضمان، يجب تقديم إثبات الشراء والاتصال بفريق الدعم لدينا.",
            "وفقًا لتقديرنا، سنقوم بإصلاح المنتج أو استبداله أو استرداد ثمنه. هذا هو علاجك الوحيد بموجب الضمان.",
            "الضمان غير قابل للتحويل وينطبق فقط على المشتري الأصلي."
          ]
        },
        {
          icon: FileText,
          title: "6. الملكية الفكرية",
          content: [
            "جميع المحتوى على هذا الموقع، بما في ذلك النصوص والرسومات والشعارات والصور والبرامج، هي ملك لشركة MAXIOS Technologies Ltd.",
            "MAXIOS وشعارنا وأسماء المنتجات هي علامات تجارية مسجلة. الاستخدام غير المصرح به محظور تمامًا.",
            "لا يجوز لك نسخ أو إعادة إنتاج أو توزيع أو إنشاء أعمال مشتقة من محتوانا دون إذن كتابي صريح.",
            "قد تستخدم MAXIOS أي ملاحظات أو اقتراحات تقدمها دون التزام أو تعويض لك."
          ]
        },
        {
          icon: AlertTriangle,
          title: "7. حدود المسؤولية",
          content: [
            "إلى أقصى حد يسمح به القانون، لن تكون MAXIOS مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية.",
            "لن تتجاوز مسؤوليتنا الإجمالية عن أي مطالبة ناشئة عن هذه الشروط أو استخدامك لمنتجاتنا المبلغ الذي دفعته مقابل المنتج المحدد.",
            "نحن لا نضمن أن موقعنا سيكون متواصلاً أو آمنًا أو خاليًا من الأخطاء.",
            "بعض الولايات القضائية لا تسمح بقيود على الضمانات الضمنية أو المسؤولية، لذلك قد لا تنطبق بعض القيود عليك."
          ]
        },
        {
          icon: Gavel,
          title: "8. حل النزاعات",
          content: [
            "تخضع هذه الشروط وتفسر وفقًا لقوانين دولة إسرائيل.",
            "يتم حل أي نزاعات ناشئة عن هذه الشروط أو استخدامك لخدماتنا من خلال التحكيم الملزم في إسرائيل.",
            "أنت توافق على التنازل عن أي حق في المشاركة في الدعاوى الجماعية ضد MAXIOS.",
            "بصرف النظر عما سبق، يجوز لـ MAXIOS طلب أمر قضائي في أي محكمة ذات اختصاص قضائي."
          ]
        },
        {
          icon: Globe,
          title: "9. المستخدمون الدوليون",
          content: [
            "يتم تشغيل خدماتنا من إسرائيل. إذا قمت بالوصول إلى خدماتنا من خارج إسرائيل، فإنك تفعل ذلك على مسؤوليتك الخاصة.",
            "أنت مسؤول عن الامتثال للقوانين المحلية المتعلقة بالمشتريات عبر الإنترنت واستيراد المنتجات.",
            "نحن لا نقدم أي تعهد بأن منتجاتنا أو خدماتنا مناسبة أو متاحة للاستخدام في جميع المواقع.",
            "قد يكون تصدير بعض المنتجات مقيدًا. أنت توافق على عدم تصدير منتجاتنا في انتهاك للقوانين المعمول بها."
          ]
        }
      ],

      userConduct: {
        title: "10. سلوك المستخدم",
        content: "عند استخدام موقعنا وخدماتنا، فإنك توافق على عدم:",
        items: [
          "انتهاك أي قوانين أو لوائح سارية",
          "التعدي على حقوق الآخرين",
          "تقديم معلومات كاذبة أو مضللة",
          "محاولة الوصول غير المصرح به إلى أنظمتنا",
          "استخدام أنظمة آلية للوصول إلى موقعنا دون إذن",
          "التدخل في الأداء السليم لخدماتنا",
          "الانخراط في أنشطة احتيالية أو رد المبالغ المدفوعة"
        ]
      },

      termination: {
        title: "11. الإنهاء",
        content: "نحتفظ بالحق في إنهاء أو تعليق وصولك إلى خدماتنا فورًا، دون إشعار مسبق، لأي سبب، بما في ذلك انتهاك هذه الشروط. عند الإنهاء، سينتهي حقك في استخدام خدماتنا فورًا. الأحكام التي يجب أن تظل سارية بطبيعتها بعد الإنهاء ستظل سارية."
      },

      severability: {
        title: "12. قابلية الفصل",
        content: "إذا تبين أن أي حكم من هذه الشروط غير قابل للتنفيذ أو غير صالح، فسيتم تقييد هذا الحكم أو إلغاؤه إلى الحد الأدنى الضروري، وستظل الأحكام المتبقية سارية المفعول بالكامل."
      },

      entireAgreement: {
        title: "13. الاتفاقية الكاملة",
        content: "تشكل هذه الشروط، جنبًا إلى جنب مع سياسة الخصوصية الخاصة بنا وأي إشعارات قانونية أخرى منشورة على موقعنا، الاتفاقية الكاملة بينك وبين MAXIOS فيما يتعلق باستخدامك لخدماتنا. تحل هذه الشروط محل أي اتفاقيات أو اتصالات سابقة."
      },

      contact: {
        title: "معلومات الاتصال",
        content: "لأي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا:",
        company: "MAXIOS Technologies Ltd.",
        email: "service@maxios.co.il",
        location: "إسرائيل"
      }
    }
  };

  const t = content[lang];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 min-h-screen">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 mb-8">
          <Gavel className="text-orange-500" size={24} />
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
              <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight">{section.title}</h2>
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

        {/* User Conduct */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.userConduct.title}</h2>
          <p className="text-white/60 text-sm mb-4">{t.userConduct.content}</p>
          <ul className="space-y-2">
            {t.userConduct.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-white/60 text-sm">
                <span className="text-red-500">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Termination */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.termination.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{t.termination.content}</p>
        </div>

        {/* Severability */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.severability.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{t.severability.content}</p>
        </div>

        {/* Entire Agreement */}
        <div className="bg-black/40 border border-white/10 p-8">
          <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.entireAgreement.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{t.entireAgreement.content}</p>
        </div>

        {/* Contact */}
        <div className="bg-orange-500/10 border border-orange-500/30 p-8">
          <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.contact.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">{t.contact.content}</p>
          <div className="space-y-2">
            <p className="text-white font-bold">{t.contact.company}</p>
            <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 text-orange-500 hover:text-white transition-colors">
              <Mail size={18} />
              <span>{t.contact.email}</span>
            </a>
            <p className="text-white/50">{t.contact.location}</p>
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
