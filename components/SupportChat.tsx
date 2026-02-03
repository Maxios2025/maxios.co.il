
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, Send, X, Loader2, UserRound, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Language, ViewState } from '../App';

interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

interface SupportChatProps {
  lang: Language;
  setActiveView: (v: ViewState) => void;
  isAdmin?: boolean;
}

// Official MAXIOS T18 Knowledge Base - User Manual
const MAXIOS_KNOWLEDGE_BASE = `
## MAXIOS T18 - OFFICIAL KNOWLEDGE BASE

### 1. PRODUCT OVERVIEW

Model: MAXIOS T18 Cordless Vacuum Cleaner
Battery: Rechargeable lithium-ion
Runtime: Up to 60 minutes (varies by cleaning mode)
Filtration: HEPA-grade filter
Cleaning Modes:
- Dry suction (dust, hair, debris)
- Integrated wet mopping system
Charging: Via original adapter (24V / 1.5A output only)
Display: Shows battery level, clog alerts, and error codes

---

### 2. ASSEMBLY & BASIC OPERATION

**Assembly:**
- Attach desired tool (floor brush, crevice nozzle, etc.) to extension tube
- Ensure dustbin lid is fully locked

**Power On:**
- Press power button once → Normal mode
- Press twice → Max power mode
- IMPORTANT: Device cannot operate while charging

**Charging:**
- Use only the original charger
- Do not charge if ambient temperature > 50°C (122°F)

**LED Indicators:**
- Solid blue = Fully charged
- Blinking blue = Charging in progress

---

### 3. MAINTENANCE GUIDE

**Dustbin:**
- Empty after every use
- Press release button for automatic ejection

**HEPA Filter:**
- Clean once per month with cold water (no soap)
- Replace every 6 months
- Must be completely dry before reinserting (24 hours)

**Floor Brush:**
- Remove hair/thread weekly
- Use included cleaning tool or small scissors

WARNING: Never operate if filter or brush is wet.

---

### 4. ERROR CODES - FULL REFERENCE TABLE

**E2 - Short Circuit in Floor Brush Motor**
- Cause: Water ingress or drop impact
- Solution: Repair or replace floor brush or main head

**E3 - High Charging Temperature**
- Cause: Temperature >50°C for 3+ hours
- Solution: Let device cool down before reuse

**E4 - Main Motor Failure**
- Cause: Wire disconnection or internal fault
- Solution: Repair or replace main head unit

**E5 - Battery Overheating During Use**
- Cause: Battery temperature >70°C
- Solution: Let device cool before restarting

**E6 - Non-Original Charger (Current)**
- Cause: Abnormal current output detected
- Solution: Use only original MAXIOS charger

**E8 - Non-Original Charger (Voltage)**
- Cause: Abnormal voltage output detected
- Solution: Use only original MAXIOS charger

**E9 - Battery Cell Malfunction**
- Cause: One or more battery cells failed
- Solution: Repair or replace battery pack

NOTE: Device automatically shuts down when any error code appears for safety.

---

### 5. FREQUENTLY ASKED QUESTIONS (FAQ)

**Q: The device won't turn on!**
A:
1. Check for blockages in the floor brush
2. Let it cool down (may be in thermal protection mode)
3. If issue persists, contact support

**Q: Weak suction power!**
A:
1. Empty the dustbin
2. Clean or replace the HEPA filter
3. Check for clogs in the tube or brush
4. Ensure full battery charge

**Q: Runtime is very short!**
A:
1. Charge fully (3-4 hours)
2. Battery may be degraded - consider replacement
3. Check for brush blockage (increases motor load)

**Q: Charging LED doesn't light up!**
A:
1. Try a different original charger
2. If still no light, battery may be faulty - contact support

**Q: Can I wash the filter?**
A: Yes, rinse under cold water WITHOUT soap. Must dry completely for 24 hours before reinstalling.

**Q: Can I use the vacuum while charging?**
A: No, for safety reasons the vacuum cannot operate while connected to charger.

**Q: How do I clean the floor brush?**
A: Remove hair and thread weekly using the included cleaning tool or small scissors.

---

### 6. CUSTOMER SUPPORT

Email: support@aidtipstech.com
Response Time: Within 12 hours

**What to Include in Support Request:**
- Your name
- Order number (if available)
- Issue description
- Photo/video if possible

**When to Escalate to Human Agent:**
- Hardware defects requiring repair
- Warranty claims
- Parts replacement needed
- Refund/return requests
- Issues not resolved by troubleshooting

Support Hours: Sunday-Thursday 8:00-20:00, Friday 8:00-14:00
`;

const ESCALATION_TRIGGERS = [
  'refund', 'return', 'money back', 'warranty claim', 'broken', 'defective',
  'not working at all', 'speak to human', 'real person', 'agent', 'manager',
  'complaint', 'lawsuit', 'lawyer', 'terrible', 'worst', 'scam', 'fraud',
  'dangerous', 'fire', 'smoke', 'spark', 'electric shock', 'injury'
];

export const SupportChat: React.FC<SupportChatProps> = ({ lang, setActiveView, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: lang === 'en'
      ? "Welcome to MAXIOS Technical Support. I'm your AI assistant with full product knowledge. Ask me about error codes, maintenance, specifications, or any technical questions!"
      : lang === 'ar'
      ? "مرحباً بك في الدعم الفني لماكسيوس. أنا مساعدك الذكي مع معرفة كاملة بالمنتجات. اسألني عن رموز الأخطاء أو الصيانة أو المواصفات!"
      : "ברוכים הבאים לתמיכה הטכנית של MAXIOS. אני העוזר החכם שלך עם ידע מלא על המוצרים. שאל אותי על קודי שגיאה, תחזוקה, מפרטים או כל שאלה טכנית!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

    // Save history for admin
    if (messages.length > 1) {
      const logs = JSON.parse(localStorage.getItem('maxios_support_logs') || '[]');
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role !== 'system') {
        logs.push({ ...lastMsg, timestamp: new Date().toISOString() });
        localStorage.setItem('maxios_support_logs', JSON.stringify(logs.slice(-100)));
      }
    }
  }, [messages]);

  // Check if escalation is needed
  const shouldEscalate = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return ESCALATION_TRIGGERS.some(trigger => lowerText.includes(trigger));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Check for escalation triggers
    if (shouldEscalate(userMsg)) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: lang === 'en'
            ? "I understand this requires personal attention. Let me connect you with a human agent who can better assist you with this matter. Please click 'ESCALATE TO AGENT' below."
            : lang === 'ar'
            ? "أفهم أن هذا يتطلب اهتماماً شخصياً. دعني أوصلك بوكيل بشري يمكنه مساعدتك بشكل أفضل. يرجى النقر على 'التصعيد إلى وكيل' أدناه."
            : "אני מבין שזה דורש תשומת לב אישית. תן לי לחבר אותך לנציג אנושי שיוכל לסייע לך טוב יותר. אנא לחץ על 'העבר לנציג' למטה."
        }]);
      }, 500);
      return;
    }

    if (isAgentMode) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: lang === 'en'
            ? "Your message has been forwarded to Agent K-742. Expected response time: 2-4 hours during business hours (Sun-Thu 8:00-20:00)."
            : lang === 'ar'
            ? "تم إرسال رسالتك إلى الوكيل K-742. وقت الاستجابة المتوقع: 2-4 ساعات خلال ساعات العمل."
            : "ההודעה שלך הועברה לנציג K-742. זמן תגובה משוער: 2-4 שעות בשעות הפעילות (א-ה 8:00-20:00)."
        }]);
      }, 1000);
      return;
    }

    setLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      setApiKeyMissing(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: lang === 'en'
          ? "AI service is currently being configured. Please try again later or click 'ESCALATE TO AGENT' for immediate human assistance."
          : lang === 'ar'
          ? "خدمة الذكاء الاصطناعي قيد التكوين حالياً. يرجى المحاولة لاحقاً أو النقر على 'التصعيد إلى وكيل' للمساعدة البشرية الفورية."
          : "שירות ה-AI נמצא כרגע בהגדרה. נסה שוב מאוחר יותר או לחץ על 'העבר לנציג' לקבלת סיוע אנושי מיידי."
      }]);
      setLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Build conversation context
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMsg }
      ];

      const langName = lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'Hebrew';

      const systemPrompt = `You are MAXIOS AI Support - a technical support agent for MAXIOS T18 vacuum cleaner.

IMPORTANT: Always respond in ${langName} language only.

KNOWLEDGE BASE:
${MAXIOS_KNOWLEDGE_BASE}

RULES:
1. Answer ONLY using the knowledge base above
2. For error codes (E2, E3, E4, E5, E6, E8, E9), give the exact cause and solution
3. If you don't know, say: "I don't have that information. Please click ESCALATE TO AGENT."
4. Be concise: 2-4 sentences for simple questions
5. For repairs/refunds/warranty - recommend escalating to human agent
6. Always mention to use ONLY the original MAXIOS charger when relevant`;

      // Build the full prompt with conversation context
      const fullPrompt = `${systemPrompt}

Previous conversation:
${updatedHistory.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}

User question: ${userMsg}

Respond helpfully in ${langName}:`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: fullPrompt,
      });

      // Extract text from response
      let assistantResponse = '';
      if (response && response.text) {
        assistantResponse = response.text;
      } else if (response && response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
        assistantResponse = response.candidates[0].content.parts[0].text;
      }

      // Fallback if no response
      if (!assistantResponse || assistantResponse.trim() === '') {
        assistantResponse = lang === 'en'
          ? "I couldn't process that request. Please try again or escalate to an agent."
          : lang === 'ar'
          ? "لم أتمكن من معالجة الطلب. يرجى المحاولة مرة أخرى أو التصعيد إلى وكيل."
          : "לא הצלחתי לעבד את הבקשה. נסה שוב או העבר לנציג.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: assistantResponse }]);
      setConversationHistory([...updatedHistory, { role: 'assistant', content: assistantResponse }]);

    } catch (e: any) {
      console.error('Gemini API Error:', e);
      const errorMsg = lang === 'en'
        ? "Connection error. Please try again or click ESCALATE TO AGENT for help."
        : lang === 'ar'
        ? "خطأ في الاتصال. يرجى المحاولة مرة أخرى أو النقر على التصعيد إلى وكيل."
        : "שגיאת חיבור. נסה שוב או לחץ על העבר לנציג לקבלת עזרה.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    setIsAgentMode(true);
    setMessages(prev => [...prev, {
      role: 'system',
      text: lang === 'en'
        ? "--- Connected to Human Support Queue ---"
        : lang === 'ar'
        ? "--- متصل بقائمة الدعم البشري ---"
        : "--- מחובר לתור התמיכה האנושית ---"
    }]);
  };

  return (
    <div id="support-chat" className={`fixed bottom-8 ${lang === 'en' ? 'right-8' : 'left-8'} z-[110]`}>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-orange-600 text-black rounded-none flex items-center justify-center shadow-2xl hover:bg-white transition-colors border-2 border-orange-600 animate-pulse">
          <MessageCircle size={28} strokeWidth={3} />
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] md:w-[450px] h-[600px] bg-zinc-950 border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isAgentMode ? 'bg-blue-500' : apiKeyMissing ? 'bg-yellow-500' : 'bg-orange-500'} animate-pulse`} />
              <h3 className="font-black italic text-white uppercase tracking-tighter">
                {isAgentMode
                  ? "Agent K-742"
                  : lang === 'en' ? "MAXIOS AI NODE" : lang === 'ar' ? "عقدة ماكسيوس AI" : "צומת MAXIOS AI"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {apiKeyMissing && <AlertTriangle size={16} className="text-yellow-500" />}
              {isAdmin && <ShieldAlert size={16} className="text-orange-500" />}
              <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white"><X size={24} /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-black/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-orange-600 text-black font-bold'
                    : m.role === 'system'
                    ? 'bg-zinc-800 text-white/40 italic w-full text-center py-2 text-[10px]'
                    : 'bg-white/5 text-white/90 border border-white/10'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-orange-500" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    {lang === 'en' ? 'Processing...' : lang === 'ar' ? 'جاري المعالجة...' : 'מעבד...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isAgentMode && (
            <div className="px-6 py-2 border-t border-white/5 bg-zinc-900/50">
              <button
                onClick={handleEscalate}
                className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-orange-500 uppercase tracking-widest transition-colors"
              >
                <UserRound size={12} />
                {lang === 'en' ? 'ESCALATE TO AGENT' : lang === 'ar' ? 'التصعيد إلى وكيل' : 'העבר לנציג'}
              </button>
            </div>
          )}

          <div className="p-6 border-t border-white/5 bg-black">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={lang === 'en' ? "Ask about errors, specs, maintenance..." : lang === 'ar' ? "اسأل عن الأخطاء والمواصفات والصيانة..." : "שאל על שגיאות, מפרטים, תחזוקה..."}
                className="w-full bg-white/5 border border-white/10 py-4 px-6 text-white text-[11px] font-bold focus:border-orange-500/50 outline-none placeholder:text-white/20"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className={`absolute ${lang === 'en' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-orange-500 hover:text-white disabled:opacity-50 transition-colors`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
