
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../App';
import { Wrench, Package, ShieldCheck, HelpCircle, MessageCircle } from 'lucide-react';

interface SupportSectionProps {
  lang: Language;
  onGoToContact: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ lang, onGoToContact }) => {
  const isRTL = lang === 'he' || lang === 'ar';

  const t = {
    en: {
      title: "TECHNICAL ECOSYSTEM",
      sub: "Resolve hardware anomalies, track logistics, or request technical intervention.",
      aiTitle: "AI PROTOCOL: FIRST RESPONSE",
      aiSub: "Engage our neural support node for instantaneous diagnostics.",
      categories: [
        { id: 'tech', icon: Wrench, title: "HARDWARE ISSUES", desc: "Diagnose suction or battery drift." },
        { id: 'items', icon: Package, title: "ITEM INQUIRY", desc: "Specifications and parts compatibility." },
        { id: 'warranty', icon: ShieldCheck, title: "WARRANTY CLAIM", desc: "Elite coverage activation." },
        { id: 'other', icon: HelpCircle, title: "GENERAL VOID", desc: "All other non-specified anomalies." }
      ]
    },
    ar: {
      title: "مركز الدعم الفني",
      sub: "حل المشاكل التقنية، تتبع الشحنات، أو طلب المساعدة.",
      aiTitle: "المساعد الذكي: الدعم الفوري",
      aiSub: "تواصل مع فريق الدعم للمساعدة الفورية.",
      categories: [
        { id: 'tech', icon: Wrench, title: "مشاكل تقنية", desc: "مشاكل الشفط أو البطارية." },
        { id: 'items', icon: Package, title: "استفسار عن المنتجات", desc: "المواصفات وقطع الغيار." },
        { id: 'warranty', icon: ShieldCheck, title: "طلب الضمان", desc: "تفعيل ضمان المنتج." },
        { id: 'other', icon: HelpCircle, title: "استفسارات أخرى", desc: "أي أسئلة أو استفسارات أخرى." }
      ]
    },
    he: {
      title: "מערכת אקולוגית טכנית",
      sub: "פתור אנומליות חומרה, עקוב אחר לוגיסטיקה, או בקש התערבות טכנית.",
      aiTitle: "פרוטוקול AI: תגובה ראשונה",
      aiSub: "צור קשר עם צומת התמיכה העצבית לאבחון מיידי.",
      categories: [
        { id: 'tech', icon: Wrench, title: "בעיות חומרה", desc: "אבחן ירידה בשאיבה או בסוללה." },
        { id: 'items', icon: Package, title: "שאילתת פריטים", desc: "מפרטים ותאימות חלקים." },
        { id: 'warranty', icon: ShieldCheck, title: "תביעת אחריות", desc: "הפעלת כיסוי עילית." },
        { id: 'other', icon: HelpCircle, title: "כללי", desc: "כל שאר האנומליות הלא מוגדרות." }
      ]
    }
  }[lang];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 space-y-24">
      <div className="space-y-6 text-center">
        <h2 className={`text-white/20 text-xs tracking-[1em] uppercase ${lang === 'he' ? 'font-hebrew' : lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'en' ? 'COMMAND CENTER' : lang === 'he' ? 'מרכז פיקוד' : 'مركز القيادة'}
        </h2>
        <h3 className={`text-6xl md:text-9xl font-black tracking-tighter text-white ${
          lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic italic' : 'italic'
        }`}>{t.title}</h3>
        <p className={`text-xl text-white/40 font-light max-w-2xl mx-auto ${lang === 'he' ? 'font-hebrew' : lang === 'ar' ? 'font-arabic' : ''}`}>{t.sub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {t.categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="group p-8 bg-zinc-950 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer"
            onClick={onGoToContact}
          >
            <div className={`flex items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 shrink-0">
                <cat.icon size={28} className="text-orange-500" />
              </div>
              <div className={`flex-1 ${lang === 'he' ? 'font-hebrew' : lang === 'ar' ? 'font-arabic' : ''}`}>
                <h4 className={`text-xl md:text-2xl font-bold text-white ${lang === 'he' ? 'font-hero-hebrew' : ''}`}>{cat.title}</h4>
                <p className="text-white/50 text-base md:text-lg mt-2 leading-relaxed">{cat.desc}</p>
              </div>
            </div>
            <div
              className={`mt-4 text-orange-500 font-bold tracking-wide text-sm uppercase transition-transform flex items-center gap-2 ${isRTL ? 'flex-row-reverse mr-auto group-hover:-translate-x-2' : 'ml-auto group-hover:translate-x-2'}`}
            >
              <MessageCircle size={20} /> {isRTL ? '←' : '→'}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
