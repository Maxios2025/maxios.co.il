
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../App';
import { RefreshCcw, Wrench, Package, ShieldCheck, HelpCircle } from 'lucide-react';

interface SupportSectionProps {
  lang: Language;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ lang }) => {
  const t = {
    en: {
      title: "TECHNICAL ECOSYSTEM",
      sub: "Resolve hardware anomalies, track logistics, or request technical intervention.",
      aiTitle: "AI PROTOCOL: FIRST RESPONSE",
      aiSub: "Engage our neural support node for instantaneous diagnostics.",
      categories: [
        { id: 'refund', icon: RefreshCcw, title: "REFUND PROTOCOL", desc: "Initiate return and credit logic." },
        { id: 'tech', icon: Wrench, title: "HARDWARE ISSUES", desc: "Diagnose suction or battery drift." },
        { id: 'items', icon: Package, title: "ITEM INQUIRY", desc: "Specifications and parts compatibility." },
        { id: 'warranty', icon: ShieldCheck, title: "WARRANTY CLAIM", desc: "Elite coverage activation." },
        { id: 'other', icon: HelpCircle, title: "GENERAL VOID", desc: "All other non-specified anomalies." }
      ]
    },
    ar: {
      title: "النظام البيئي التقني",
      sub: "حل الأعطال المادية، تتبع الخدمات اللوجستية، أو طلب تدخل تقني.",
      aiTitle: "بروتوكول الذكاء الاصطناعي: الاستجابة الأولى",
      aiSub: "تواصل مع عقدة الدعم العصبية للتشخيص الفوري.",
      categories: [
        { id: 'refund', icon: RefreshCcw, title: "بروتوكول الاسترداد", desc: "بدء عملية الإرجاع والرصيد." },
        { id: 'tech', icon: Wrench, title: "مشاكل الأجهزة", desc: "تشخيص الشفط أو البطارية." },
        { id: 'items', icon: Package, title: "استفسار عن العناصر", desc: "المواصفات وتوافق الأجزاء." },
        { id: 'warranty', icon: ShieldCheck, title: "مطالبة بالضمان", desc: "تفعيل التغطية النخبوية." },
        { id: 'other', icon: HelpCircle, title: "عام", desc: "جميع الشذوذات الأخرى غير المحددة." }
      ]
    },
    he: {
      title: "מערכת אקולוגית טכנית",
      sub: "פתור אנומליות חומרה, עקוב אחר לוגיסטיקה, או בקש התערבות טכנית.",
      aiTitle: "פרוטוקול AI: תגובה ראשונה",
      aiSub: "צור קשר עם צומת התמיכה העצבית לאבחון מיידי.",
      categories: [
        { id: 'refund', icon: RefreshCcw, title: "פרוטוקול החזר", desc: "הפעל לוגיקה של החזרה וזיכוי." },
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
        <h2 className="text-white/20 text-xs tracking-[1em] uppercase">{lang === 'en' ? 'COMMAND CENTER' : 'مركز القيادة'}</h2>
        <h3 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white">{t.title}</h3>
        <p className="text-xl text-white/40 font-light max-w-2xl mx-auto">{t.sub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {t.categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="group p-10 bg-zinc-950 border border-white/5 hover:border-orange-500/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <cat.icon size={120} />
            </div>
            <cat.icon size={40} className="text-orange-500 mb-8" />
            <h4 className="text-2xl font-black italic tracking-tighter text-white mb-4 uppercase">{cat.title}</h4>
            <p className="text-white/40 text-sm leading-relaxed">{cat.desc}</p>
            <button className="mt-8 text-orange-500 font-black tracking-widest text-[10px] uppercase group-hover:translate-x-2 transition-transform">
              {lang === 'en' ? 'OPEN TICKET' : lang === 'ar' ? 'افتح تذكرة' : 'פתח כרטיס'} →
            </button>
          </motion.div>
        ))}
      </div>

      <div className="p-12 md:p-24 bg-orange-600/5 border border-orange-600/20 relative overflow-hidden text-center space-y-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        <h4 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">{t.aiTitle}</h4>
        <p className="text-lg text-white/60 max-w-xl mx-auto">{t.aiSub}</p>
        <button 
           onClick={() => {
             const chatBtn = document.querySelector('#support-chat-trigger') as HTMLButtonElement;
             chatBtn?.click();
           }}
           className="px-16 py-6 bg-white text-black font-black uppercase tracking-tighter hover:bg-orange-600 hover:text-white transition-all text-sm"
        >
          {lang === 'en' ? 'ENGAGE CHATBOT' : 'تفعيل الروبوت'}
        </button>
      </div>
    </section>
  );
};
