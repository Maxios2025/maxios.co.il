import React from 'react';
import { Building2, Users, Globe, Award, Factory, Cpu, Target, Zap, MapPin, Mail, Phone } from 'lucide-react';
import { Language } from '../App';

interface AboutUsProps {
  lang: Language;
}

export const AboutUs: React.FC<AboutUsProps> = ({ lang }) => {
  const content = {
    en: {
      title: "About MAXIOS",
      subtitle: "Engineering Excellence Since Day One",
      intro: "MAXIOS Technologies Ltd. is a pioneering Israeli company at the forefront of premium vacuum technology innovation. Founded with a vision to revolutionize home cleaning solutions, we combine cutting-edge engineering with uncompromising quality standards to deliver products that exceed expectations.",

      story: {
        title: "Our Story",
        content: "What began as a bold vision has evolved into a global enterprise. MAXIOS was founded by a dedicated team of engineers and entrepreneurs with a passion for engineering excellence and a commitment to bringing world-class technology to every home. Today, MAXIOS stands as a testament to Israeli innovation, with state-of-the-art manufacturing facilities and a team of dedicated engineers pushing the boundaries of what's possible."
      },

      founder: {
        title: "Leadership",
        name: "MAXIOS Team",
        role: "Leadership",
        bio: "The MAXIOS team founded this company with a singular mission: to engineer the most advanced, reliable, and powerful vacuum systems in the world. Our leadership philosophy combines relentless innovation with a deep commitment to customer satisfaction. Under this guidance, MAXIOS has grown from a startup to an industry leader, setting new benchmarks for performance and quality."
      },

      stats: [
        { value: "50+", label: "Engineers & Specialists" },
        { value: "15+", label: "Patents Filed" },
        { value: "100K+", label: "Units Sold" }
      ],

      manufacturing: {
        title: "Global Manufacturing",
        subtitle: "Israeli Innovation, World-Class Production",
        content: "Our headquarters and R&D center are proudly located in Israel, where our team of over 50 engineers and specialists design and develop next-generation vacuum technology. Our advanced manufacturing facility in China spans over 50,000 square meters, equipped with cutting-edge automation and rigorous quality control systems. This strategic combination allows us to maintain Israeli engineering standards while achieving global production scale.",
        points: [
          "ISO 9001:2015 Certified Manufacturing",
          "Automated Production Lines with AI Quality Control",
          "Sustainable Manufacturing Practices",
          "24/7 Quality Monitoring Systems"
        ]
      },

      values: {
        title: "Our Values",
        items: [
          {
            icon: Cpu,
            title: "Engineering First",
            desc: "Every product begins with our engineering team's commitment to innovation and precision."
          },
          {
            icon: Award,
            title: "Uncompromising Quality",
            desc: "We never cut corners. Every unit undergoes 47 quality checks before leaving our facility."
          },
          {
            icon: Target,
            title: "Customer Focus",
            desc: "Our customers drive our innovation. Their feedback shapes every product decision."
          },
          {
            icon: Zap,
            title: "Performance Obsessed",
            desc: "We're never satisfied. We continuously push for more power, efficiency, and reliability."
          }
        ]
      },

      team: {
        title: "Our Team",
        content: "MAXIOS employs a diverse team of mechanical engineers, electrical engineers, industrial designers, and quality assurance specialists. Our R&D department works tirelessly to develop proprietary technologies that set us apart from competitors. From motor design to aerodynamics, every component is engineered in-house by our expert team.",
        members: [
          { name: "Obaida Khamaisi", role: "Head of E-commerce", dept: "R&D", initials: "OK" },
          { name: "Diaa Oweida", role: "Head of Operations", dept: "Operations", initials: "DO" },
          { name: "Ibrahim Khamaisi", role: "Head of Design", dept: "Design", initials: "IK" },
          { name: "Jalal Khamaisi", role: "Head of Accounts", dept: "Accounts", initials: "JK" },
          { name: "Imad Oweida", role: "Head of Import", dept: "Import", initials: "IO" },
          { name: "Hussam Oweida", role: "Head of Marketing", dept: "Marketing", initials: "HO" }
        ]
      },

      contact: {
        title: "Corporate Headquarters",
        location: "Israel",
        email: "service@maxios.co.il",
        hours: "Sunday - Thursday: 9:00 - 18:00"
      }
    },
    he: {
      title: "אודות MAXIOS",
      subtitle: "מצוינות הנדסית מהיום הראשון",
      intro: "MAXIOS Technologies Ltd. היא חברה ישראלית חלוצית בחזית חדשנות טכנולוגיית השאיבה הפרימיום. נוסדה עם חזון לחולל מהפכה בפתרונות הניקיון הביתי, אנו משלבים הנדסה חדשנית עם תקני איכות ללא פשרות כדי לספק מוצרים שעולים על הציפיות.",

      story: {
        title: "הסיפור שלנו",
        content: "מה שהתחיל כחזון נועז התפתח לארגון גלובלי. MAXIOS נוסדה על ידי צוות מסור של מהנדסים ויזמים עם תשוקה למצוינות הנדסית ומחויבות להביא טכנולוגיה ברמה עולמית לכל בית. כיום, MAXIOS עומדת כעדות לחדשנות ישראלית, עם מתקני ייצור מתקדמים וצוות מהנדסים מסורים שדוחפים את גבולות האפשר."
      },

      founder: {
        title: "הנהגה",
        name: "צוות MAXIOS",
        role: "הנהגה",
        bio: "צוות MAXIOS ייסד את החברה עם משימה אחת: להנדס את מערכות השאיבה המתקדמות, האמינות והעוצמתיות ביותר בעולם. פילוסופיית ההנהגה שלנו משלבת חדשנות בלתי פוסקת עם מחויבות עמוקה לשביעות רצון הלקוח. בהנחייתנו, MAXIOS צמחה מסטארטאפ למובילת תעשייה, וקבעה אמות מידה חדשות לביצועים ואיכות."
      },

      stats: [
        { value: "50+", label: "מהנדסים ומומחים" },
        { value: "15+", label: "פטנטים רשומים" },
        { value: "100K+", label: "יחידות נמכרו" }
      ],

      manufacturing: {
        title: "ייצור גלובלי",
        subtitle: "חדשנות ישראלית, ייצור ברמה עולמית",
        content: "המטה ומרכז המו\"פ שלנו ממוקמים בגאווה בישראל, שם צוות של למעלה מ-50 מהנדסים ומומחים מתכננים ומפתחים טכנולוגיית שאיבה מהדור הבא. מתקן הייצור המתקדם שלנו בסין משתרע על פני יותר מ-50,000 מ\"ר, מצויד באוטומציה חדשנית ומערכות בקרת איכות קפדניות. שילוב אסטרטגי זה מאפשר לנו לשמור על תקני הנדסה ישראליים תוך השגת היקף ייצור גלובלי.",
        points: [
          "ייצור בתקן ISO 9001:2015",
          "קווי ייצור אוטומטיים עם בקרת איכות AI",
          "שיטות ייצור בר-קיימא",
          "מערכות ניטור איכות 24/7"
        ]
      },

      values: {
        title: "הערכים שלנו",
        items: [
          {
            icon: Cpu,
            title: "הנדסה קודם",
            desc: "כל מוצר מתחיל במחויבות צוות ההנדסה שלנו לחדשנות ודיוק."
          },
          {
            icon: Award,
            title: "איכות ללא פשרות",
            desc: "אנחנו אף פעם לא מקצרים. כל יחידה עוברת 47 בדיקות איכות לפני שעוזבת את המפעל."
          },
          {
            icon: Target,
            title: "מיקוד בלקוח",
            desc: "הלקוחות שלנו מניעים את החדשנות שלנו. המשוב שלהם מעצב כל החלטת מוצר."
          },
          {
            icon: Zap,
            title: "אובססיה לביצועים",
            desc: "אנחנו אף פעם לא מרוצים. אנו דוחפים ללא הרף לעוד עוצמה, יעילות ואמינות."
          }
        ]
      },

      team: {
        title: "הצוות שלנו",
        content: "MAXIOS מעסיקה צוות מגוון של מהנדסי מכונות, מהנדסי חשמל, מעצבים תעשייתיים ומומחי אבטחת איכות. מחלקת המו\"פ שלנו עובדת ללא לאות לפיתוח טכנולוגיות קנייניות שמבדילות אותנו מהמתחרים. מתכנון מנועים ועד אווירודינמיקה, כל רכיב מהונדס בבית על ידי צוות המומחים שלנו.",
        members: [
          { name: "עובידה ח'מאיסי", role: "ראש מחלקת מסחר אלקטרוני", dept: "מו\"פ", initials: "עח" },
          { name: "דיאא עווידה", role: "ראש מחלקת תפעול", dept: "תפעול", initials: "דע" },
          { name: "איברהים ח'מאיסי", role: "ראש מחלקת עיצוב", dept: "עיצוב", initials: "אח" },
          { name: "ג'לאל ח'מאיסי", role: "ראש מחלקת חשבונות", dept: "חשבונות", initials: "גח" },
          { name: "עימאד עווידה", role: "ראש מחלקת יבוא", dept: "יבוא", initials: "עע" },
          { name: "חוסאם עווידה", role: "ראש מחלקת שיווק", dept: "שיווק", initials: "חע" }
        ]
      },

      contact: {
        title: "מטה החברה",
        location: "ישראל",
        email: "service@maxios.co.il",
        hours: "ראשון - חמישי: 9:00 - 18:00"
      }
    },
    ar: {
      title: "عن MAXIOS",
      subtitle: "التميز الهندسي منذ اليوم الأول",
      intro: "MAXIOS Technologies Ltd. هي شركة إسرائيلية رائدة في طليعة ابتكار تقنية المكانس الكهربائية المتميزة. تأسست برؤية لإحداث ثورة في حلول التنظيف المنزلي، نحن نجمع بين الهندسة المتطورة ومعايير الجودة الصارمة لتقديم منتجات تفوق التوقعات.",

      story: {
        title: "قصتنا",
        content: "ما بدأ كرؤية جريئة تطور إلى مؤسسة عالمية. تأسست MAXIOS على يد فريق متفان من المهندسين ورواد الأعمال الشغوفين بالتميز الهندسي والملتزمين بتقديم تقنية عالمية المستوى لكل منزل. اليوم، تقف MAXIOS كشاهد على الابتكار الإسرائيلي، مع مرافق تصنيع حديثة وفريق من المهندسين المتفانين الذين يدفعون حدود الممكن."
      },

      founder: {
        title: "القيادة",
        name: "فريق MAXIOS",
        role: "القيادة",
        bio: "أسس فريق MAXIOS الشركة بمهمة واحدة: تصميم أكثر أنظمة المكانس الكهربائية تقدمًا وموثوقية وقوة في العالم. تجمع فلسفتنا القيادية بين الابتكار المستمر والالتزام العميق برضا العملاء. تحت قيادتنا، نمت MAXIOS من شركة ناشئة إلى رائدة في الصناعة، ووضعت معايير جديدة للأداء والجودة."
      },

      stats: [
        { value: "50+", label: "مهندسون ومتخصصون" },
        { value: "15+", label: "براءات اختراع مسجلة" },
        { value: "100K+", label: "وحدة مباعة" }
      ],

      manufacturing: {
        title: "التصنيع العالمي",
        subtitle: "ابتكار إسرائيلي، إنتاج عالمي المستوى",
        content: "يقع مقرنا الرئيسي ومركز البحث والتطوير بفخر في إسرائيل، حيث يقوم فريقنا المكون من أكثر من 50 مهندسًا ومتخصصًا بتصميم وتطوير تقنية المكانس الكهربائية من الجيل التالي. يمتد مرفق التصنيع المتقدم لدينا في الصين على مساحة تزيد عن 50,000 متر مربع، مجهز بأتمتة متطورة وأنظمة مراقبة جودة صارمة. يتيح لنا هذا المزيج الاستراتيجي الحفاظ على معايير الهندسة الإسرائيلية مع تحقيق نطاق إنتاج عالمي.",
        points: [
          "تصنيع معتمد ISO 9001:2015",
          "خطوط إنتاج آلية مع مراقبة جودة بالذكاء الاصطناعي",
          "ممارسات تصنيع مستدامة",
          "أنظمة مراقبة الجودة على مدار الساعة"
        ]
      },

      values: {
        title: "قيمنا",
        items: [
          {
            icon: Cpu,
            title: "الهندسة أولاً",
            desc: "يبدأ كل منتج بالتزام فريقنا الهندسي بالابتكار والدقة."
          },
          {
            icon: Award,
            title: "جودة بلا تنازل",
            desc: "لا نختصر أبدًا. كل وحدة تخضع لـ 47 فحص جودة قبل مغادرة منشأتنا."
          },
          {
            icon: Target,
            title: "التركيز على العميل",
            desc: "عملاؤنا يقودون ابتكاراتنا. ملاحظاتهم تشكل كل قرار منتج."
          },
          {
            icon: Zap,
            title: "هوس الأداء",
            desc: "لا نرضى أبدًا. نسعى باستمرار لمزيد من القوة والكفاءة والموثوقية."
          }
        ]
      },

      team: {
        title: "فريقنا",
        content: "توظف MAXIOS فريقًا متنوعًا من المهندسين الميكانيكيين والكهربائيين والمصممين الصناعيين ومتخصصي ضمان الجودة. يعمل قسم البحث والتطوير لدينا بلا كلل لتطوير تقنيات خاصة تميزنا عن المنافسين. من تصميم المحركات إلى الديناميكا الهوائية، يتم تصميم كل مكون داخليًا بواسطة فريق خبرائنا.",
        members: [
          { name: "عبيده خمايسي", role: "رئيس قسم التجارة الالكترونية", dept: "البحث والتطوير", initials: "عخ" },
          { name: "ضياء عويضه", role: "رئيس قسم العمليات", dept: "العمليات", initials: "ضع" },
          { name: "ابراهيم خمايسي", role: "رئيس قسم التصميم", dept: "التصميم", initials: "اخ" },
          { name: "جلال خمايسي", role: "رئيس قسم الحسابات", dept: "الحسابات", initials: "جخ" },
          { name: "عماد عويضه", role: "رئيس قسم الاستراد", dept: "الاستراد", initials: "عع" },
          { name: "حسام عويضه", role: "رئيس قسم التسويق", dept: "التسويق", initials: "حع" }
        ]
      },

      contact: {
        title: "المقر الرئيسي",
        location: "إسرائيل",
        email: "service@maxios.co.il",
        hours: "الأحد - الخميس: 9:00 - 18:00"
      }
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 mb-8">
            <Building2 className="text-orange-500" size={24} />
            <span className="text-orange-500 font-black text-xs uppercase tracking-widest">Corporate</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-6">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-orange-500 font-bold uppercase tracking-wider mb-8">
            {t.subtitle}
          </p>
          <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto">
            {t.intro}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
          {t.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">{stat.value}</div>
              <div className="text-white/50 text-sm uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-8">
            {t.story.title}
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            {t.story.content}
          </p>
        </div>
      </div>

      {/* Founder Section */}
      <div className="py-20 px-6 bg-orange-500/5 border-y border-orange-500/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-12">
            {t.founder.title}
          </h2>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-48 h-48 bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0 p-6">
              <img src="/logo.svg" alt="MAXIOS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-white mb-2">{t.founder.name}</h3>
              <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-6">{t.founder.role}</p>
              <p className="text-white/60 leading-relaxed">{t.founder.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manufacturing Section */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Factory className="text-orange-500" size={32} />
            <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              {t.manufacturing.title}
            </h2>
          </div>
          <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-8">
            {t.manufacturing.subtitle}
          </p>
          <p className="text-white/60 text-lg leading-relaxed mb-12">
            {t.manufacturing.content}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.manufacturing.points.map((point, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-orange-500" />
                <span className="text-white/80">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-12 text-center">
            {t.values.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.values.items.map((item, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all">
                <item.icon className="text-orange-500 mb-4" size={32} />
                <h3 className="text-xl font-black text-white uppercase mb-3">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Users className="text-orange-500" size={32} />
            <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              {t.team.title}
            </h2>
          </div>
          <p className="text-white/60 text-lg leading-relaxed mb-12">
            {t.team.content}
          </p>

          {/* Team Members Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {t.team.members && t.team.members.map((member: { name: string; role: string; dept: string; initials: string }, i: number) => (
              <div key={i} className="group text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-white/10 group-hover:border-orange-500/50 flex items-center justify-center transition-all duration-300">
                  <span className="text-2xl font-black text-orange-500">{member.initials}</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{member.name}</h4>
                <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">{member.role}</p>
                <p className="text-white/30 text-xs uppercase tracking-widest">{member.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 px-6 bg-orange-500/10 border-t border-orange-500/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-12">
            {t.contact.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <MapPin className="text-orange-500" size={24} />
              <span className="text-white/80">{t.contact.location}</span>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="text-orange-500" size={24} />
              <a href={`mailto:${t.contact.email}`} className="text-orange-500 hover:text-white transition-colors">
                {t.contact.email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Globe className="text-orange-500" size={24} />
              <span className="text-white/80">{t.contact.hours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} MAXIOS Technologies Ltd. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};
