import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, Volume2, CheckCircle, AlertCircle, MessageCircle, Info, FileText, ChevronLeft, VolumeX, PlayCircle, StopCircle, User, Calendar, BookOpen, Sun, Moon } from 'lucide-react';

type Language = 'qu' | 'es' | null;
type View = 'splash' | 'login' | 'home' | 'chat' | 'messages' | 'attendance' | 'tasks';

const STUDENT_DATA = {
  name: "Alex Quispe Condori",
  school: "I.E. Coronel Francisco Bolognesi",
  nextEvent: "Reunión de Padres - 25 Abril",
};

const MESSAGES = [
  { id: 1, date: '23 Abril', es: 'No hay clases mañana por desinfección del colegio.', qu: 'Manam paqarin yachaywasi kanqachu, pichanqaku chaymi.' },
  { id: 2, date: '21 Abril', es: 'Reunión de padres este viernes a las 4pm.', qu: 'Tayta mamakuna huñunakuy kanqa kay diviernes tawa aspiyta.' }
];

const TASKS = [
  { id: 1, subject: 'Matemáticas', es: 'Hacer páginas 12 y 13 del libro.', qu: 'Yupay yachay rapikunata 12, 13 ruwana.', due: '25 Abril' },
  { id: 2, subject: 'Comunicación', es: 'Traer un cuento corto familiar.', qu: 'Willakuyta apamuna.', due: '26 Abril' }
];

const ATTENDANCE = [
  { date: '24 Abril', status: 'present', es: 'Asistió', qu: 'Hamurqan' },
  { date: '23 Abril', status: 'present', es: 'Asistió', qu: 'Hamurqan' },
  { date: '22 Abril', status: 'absent', es: 'Faltó', qu: 'Mana hamurqanchu' }
];

// Colors
const COLORS = {
  bg: '#F7F3EE', // crema cálido
  text: '#8B5E3C', // marrón andino
  terracotta: '#C97B63', // terracota suave
  green: '#6B8F71', // verde natural
  blue: '#A7C7E7', // azul cielo suave
  white: '#FFFFFF',
};

export default function App() {
  const [language, setLanguage] = useState<Language>(null);
  const [activeView, setActiveView] = useState<View>('splash');
  const [dni, setDni] = useState('');
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const t = (es: string, qu: string) => language === 'es' ? es : qu;

  const speakText = useCallback((textEs: string, textQu?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = language === 'qu' && textQu ? textQu : textEs;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language === 'es' ? 'es-PE' : 'es-ES';
      utterance.rate = 0.85;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setActiveView('login');
    if (lang === 'es') {
      speakText('Has elegido español. Por favor, ingresa tu número de DNI para continuar.');
    } else {
      speakText('Españolta akllarunki. DNI yupayniykita qillqakuy.', 'Runasimita akllarunki. DNI yupayniykita qillqakuy haykunaykipaq.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.length >= 8) {
      setActiveView('home');
      speakText('Bienvenido. Aquí puedes ver cómo le va a tu hijo.', 'Allin hamusqa kachkay. Kaypi wawaykiq yachayninmanta yachanki.');
    }
  };

  const [chatMessages, setChatMessages] = useState<{id: string, sender: 'user'|'ai', text: string}[]>([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState(false);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<any>(null);

  const getLocalResponse = (text: string): { es: string, qu: string } => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('asisti') || lowerText.includes('fue') || lowerText.includes('clases') || lowerText.includes('colegio')) {
      return {
        es: "Sí 😊, su hijo asistió correctamente hoy.",
        qu: "Arí 😊, wawaykiqa kunan p'unchaw yachaywasiman rirqanmi."
      };
    }
    
    if (lowerText.includes('tarea') || lowerText.includes('deber') || lowerText.includes('trabajo')) {
      return {
        es: "Sí, tiene una tarea pendiente de matemáticas.",
        qu: "Arí, yupay yachaymanta ruranan kachkan."
      };
    }
    
    if (lowerText.includes('reunión') || lowerText.includes('reunion') || lowerText.includes('tutor') || lowerText.includes('padres')) {
      return {
        es: "Mañana habrá reunión de padres a las 8 de la mañana.",
        qu: "Paqarinmi tayta mamakuna huñunakuy kanqa 8 paqarinmanta."
      };
    }
  
    if (lowerText.includes('hola') || lowerText.includes('buenos') || lowerText.includes('tardes') || lowerText.includes('dias')) {
      return {
         es: "¡Hola! Soy Rimay. ¿En qué te puedo ayudar hoy con Alex?",
         qu: "¡Allinllachu! Rimaymi kani. ¿Imapim yanapaykiman Alexmanta kunan p'unchaw?"
      };
    }
  
    if (lowerText.includes('nota') || lowerText.includes('calificacion')) {
      return {
        es: "Las notas de Alex están muy bien. Ha mejorado mucho.",
        qu: "Alexpa notasninqa allinmi kachkan. Aswan allinta rurachkan."
      };
    }
  
    // Default
    return {
      es: "Entiendo. Sin embargo, no tengo esa información. ¿Hay algo más que te gustaría saber?",
      qu: "Entiendenim. Ichaqa manam chay willakuyta hap'inichu. ¿Ima huknatataq yachayta munanki?"
    };
  };

  const processTextInputValue = (text: string) => {
    setIsProcessingVoice(true);
    setChatMessages(prev => [...prev, { id: 'temp', sender: 'user', text }]);
    
    setTimeout(() => {
      const response = getLocalResponse(text);
      setChatMessages(prev => prev.filter(m => m.id !== 'temp').concat([
        { id: Date.now().toString(), sender: 'ai', text: language === 'es' ? response.es : response.qu }
      ]));
      speakText(response.es, response.qu);
      setIsProcessingVoice(false);
    }, 1000);
  };

  const processTextInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const text = textInput;
    setTextInput('');
    processTextInputValue(text);
  };

  const startRecording = () => {
    stopSpeaking();
    setMicError(false);
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'es' ? 'es-PE' : 'es-PE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        processTextInputValue(text);
      };

      recognition.onerror = (event: any) => {
        setMicError(true);
        setIsRecording(false);
        speakText('No pude escucharte bien. Prueba escribiendo.', 'Manam allintachu uyarini. Qillqay uraypi.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
       setMicError(true);
       speakText('Tu navegador no soporta micrófono. Escribe abajo.', 'Manam atinichu. Qillqay uraypi.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reusable Audio Button
  const AudioButton = ({ textEs, textQu, className = "" }: { textEs: string, textQu?: string, className?: string }) => (
    <button
      onClick={(e) => { e.stopPropagation(); isSpeaking ? stopSpeaking() : speakText(textEs, textQu); }}
      className={`p-4 rounded-full shrink-0 shadow-sm transition-transform active:scale-90 ${isSpeaking ? 'bg-[#C97B63] text-white' : 'bg-white text-[#C97B63]'} ${className}`}
    >
      {isSpeaking ? <StopCircle size={28} /> : <Volume2 size={28} />}
    </button>
  );

  const Header = ({ titleEs, titleQu, onBack }: { titleEs: string, titleQu: string, onBack: () => void }) => (
    <div className="flex items-center gap-4 mb-8 pt-4">
      <button 
        onClick={() => { onBack(); stopSpeaking(); }}
        className="p-4 bg-white/60 hover:bg-white rounded-3xl active:scale-95 transition-all text-[#8B5E3C]"
      >
        <ChevronLeft size={36} />
      </button>
      <h2 className="text-3xl font-extrabold text-[#8B5E3C] flex-1 truncate">{t(titleEs, titleQu)}</h2>
      <AudioButton textEs={titleEs} textQu={titleQu} />
    </div>
  );

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      
      {/* Background Subtle Andean Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23E8E2D2' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M20,0 L40,0 L40,10 L50,10 L50,20 L60,20 L60,40 L50,40 L50,50 L40,50 L40,60 L20,60 L20,50 L10,50 L10,40 L0,40 L0,20 L10,20 L10,10 L20,10 Z M25,25 L35,25 L35,35 L25,35 Z' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative px-6 py-6 pb-32 max-w-2xl mx-auto h-full min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* 1. SPLASH SCREEN: LANGUAGE SELECTION */}
          {activeView === 'splash' && (
            <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center justify-center gap-12">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-[#C97B63] rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-[#C97B63]/20">
                  <MessageCircle size={48} color={COLORS.white} />
                </div>
                <h1 className="text-4xl font-extrabold text-[#8B5E3C] leading-tight">
                  La escuela también<br/>habla tu idioma.
                </h1>
                <p className="text-xl text-[#8B5E3C]/70">Yachaywasiqa qallariyniykipim rimapun.</p>
              </div>

              <div className="w-full space-y-6 mt-8">
                <button 
                  onClick={() => handleLanguageSelect('qu')}
                  className="w-full bg-white border-4 border-[#A7C7E7]/30 hover:border-[#A7C7E7] p-8 rounded-[32px] shadow-sm flex items-center justify-between transition-all active:scale-95 group"
                >
                  <span className="text-3xl font-bold text-[#8B5E3C]">Rimana Runasimipi</span>
                  <div className="w-16 h-16 rounded-full bg-[#A7C7E7]/20 flex items-center justify-center group-hover:bg-[#A7C7E7]/40">
                    <Volume2 size={32} color={COLORS.blue} />
                  </div>
                </button>

                <button 
                  onClick={() => handleLanguageSelect('es')}
                  className="w-full bg-white border-4 border-[#C97B63]/20 hover:border-[#C97B63] p-8 rounded-[32px] shadow-sm flex items-center justify-between transition-all active:scale-95 group"
                >
                  <span className="text-3xl font-bold text-[#8B5E3C]">Hablar en Español</span>
                  <div className="w-16 h-16 rounded-full bg-[#C97B63]/10 flex items-center justify-center group-hover:bg-[#C97B63]/30">
                    <Volume2 size={32} color={COLORS.terracotta} />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. LOGIN SCREEN */}
          {activeView === 'login' && language && (
            <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center">
              <Header titleEs="Ingresar" titleQu="Haykuy" onBack={() => setActiveView('splash')} />
              
              <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-[#8B5E3C]/5 border-4 border-[#F7F3EE]">
                <div className="mb-8">
                  <label className="text-2xl font-bold mb-4 flex items-center justify-between text-[#8B5E3C]">
                    <span>{t('Tu número de DNI', 'DNI yupayniyki')}</span>
                    <AudioButton textEs="Por favor, ingresa los 8 números de tu DNI." textQu="DNI yupayniykita qillqakuy uraypi." />
                  </label>
                  <input
                    type="tel"
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                    placeholder="7654..."
                    className="w-full text-center text-4xl p-8 rounded-[24px] bg-[#F7F3EE]/50 border-4 border-transparent focus:border-[#C97B63] focus:bg-white focus:outline-none transition-all text-[#8B5E3C] font-bold"
                  />
                </div>
                
                <button 
                  onClick={handleLogin}
                  disabled={dni.length < 8}
                  className="w-full bg-[#6B8F71] disabled:bg-[#6B8F71]/30 text-white text-3xl font-bold py-8 rounded-[28px] shadow-[0_8px_0_#4e6b52] active:shadow-none active:translate-y-2 transition-all disabled:transform-none disabled:shadow-none flex items-center justify-center gap-4"
                >
                  {t('Entrar a la escuela', 'Yachaywasiman haykuy')}
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. HOME DASHBOARD */}
          {activeView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between pt-4 pb-2">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#C97B63] rounded-full flex items-center justify-center shadow-md">
                     <User size={32} color={COLORS.white} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#8B5E3C]">{STUDENT_DATA.name}</h2>
                    <p className="text-lg text-[#8B5E3C]/70">{STUDENT_DATA.school}</p>
                  </div>
                </div>
                <AudioButton textEs="Estás viendo la información de Alex. Todo marcha bien." textQu="Alexpa yachakuynintam qawachkanki. Allinmi kachkan." />
              </div>

              {/* Daily Summary Card */}
              <div className="bg-[#A7C7E7]/20 border-4 border-[#A7C7E7]/30 p-8 rounded-[40px] flex gap-6 items-center">
                <button 
                  onClick={() => isSpeaking ? stopSpeaking() : speakText('Resumen de hoy: Alex asistió a clases. Hay una reunión el 25 de abril.', 'Kunan p\'unchaw: Alexqa hamurqanmi yachaywasiman. Tayta mamakuna huñunakuy 25 p\'unchawta.')}
                  className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isSpeaking ? 'bg-[#C97B63] text-white scale-105' : 'bg-white text-[#A7C7E7]'}`}
                >
                  {isSpeaking ? <StopCircle size={40} /> : <PlayCircle size={40} />}
                </button>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#8B5E3C]">
                    {t('Resumen para ti', 'Kunan p\'unchawmanta')}
                  </h3>
                  <p className="text-[#8B5E3C]/80 font-medium leading-tight text-lg">
                    {t('Toca el botón para escuchar cómo le fue a Alex hoy.', 'Ñit\'iy uyarinaykipaq imayna Alex kachkan chayta.')}
                  </p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveView('chat')}
                  className="col-span-2 bg-[#C97B63] text-white p-8 rounded-[40px] shadow-[0_8px_0_#a8624d] active:translate-y-2 active:shadow-none transition-all flex items-center gap-6"
                >
                  <div className="bg-white/20 p-5 rounded-[24px]">
                    <MessageCircle size={48} />
                  </div>
                  <div className="text-left">
                    <span className="block text-3xl font-black">{t('Hablar con Rimay', 'Rimaywan parlapay')}</span>
                    <span className="block text-lg font-medium text-white/80 mt-1">{t('Asistente familiar', 'Yanapaqnikim')}</span>
                  </div>
                </button>

                <button onClick={() => setActiveView('messages')} className="bg-white p-6 rounded-[32px] border-4 border-[#F7F3EE] shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-transform text-[#8B5E3C]">
                  <div className="w-20 h-20 bg-[#A7C7E7]/20 rounded-full flex items-center justify-center text-[#5c8db9]">
                    <Info size={40} />
                  </div>
                  <span className="text-2xl font-bold text-center">{t('Avisos', 'Willakuykuna')}</span>
                </button>

                <button onClick={() => setActiveView('attendance')} className="bg-white p-6 rounded-[32px] border-4 border-[#F7F3EE] shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-transform text-[#8B5E3C]">
                  <div className="w-20 h-20 bg-[#6B8F71]/20 rounded-full flex items-center justify-center text-[#4e6b52]">
                    <CheckCircle size={40} />
                  </div>
                  <span className="text-2xl font-bold text-center">{t('Asistencia', 'Hamuy')}</span>
                </button>

                <button onClick={() => setActiveView('tasks')} className="col-span-2 bg-white p-8 rounded-[32px] border-4 border-[#F7F3EE] shadow-sm flex items-center gap-6 active:scale-95 transition-transform">
                  <div className="w-20 h-20 bg-[#C97B63]/10 rounded-[24px] flex items-center justify-center text-[#C97B63] shrink-0">
                    <BookOpen size={40} />
                  </div>
                  <div className="text-left flex-1">
                     <span className="block text-2xl font-bold text-[#8B5E3C]">{t('Tareas', 'Ruranakuna')}</span>
                     <span className="block text-lg text-[#8B5E3C]/60 font-medium">2 {t('pendientes', 'rurana kachkan')}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. MESSAGES / AVISOS */}
          {activeView === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Header titleEs="Avisos importantes" titleQu="Willakuykuna" onBack={() => setActiveView('home')} />
              <div className="space-y-4">
                {MESSAGES.map(msg => (
                  <div key={msg.id} className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-[#F7F3EE] flex gap-5 items-start">
                    <AudioButton textEs={msg.es} textQu={msg.qu} className="mt-1" />
                    <div>
                      <span className="text-[#C97B63] font-bold text-sm uppercase tracking-widest">{msg.date}</span>
                      <p className="text-[#8B5E3C] text-xl font-medium mt-2 leading-snug">{t(msg.es, msg.qu)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 5. ATTENDANCE */}
          {activeView === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Header titleEs="Asistencia" titleQu="Hamuykuna" onBack={() => setActiveView('home')} />
              <div className="space-y-4">
                {ATTENDANCE.map((rec, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-[#F7F3EE] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className={`p-4 rounded-full ${rec.status==='present' ? 'bg-[#6B8F71]/20 text-[#4e6b52]' : 'bg-[#C97B63]/20 text-[#a8624d]'}`}>
                         {rec.status==='present' ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
                       </div>
                       <div>
                         <p className="text-xl font-extrabold text-[#8B5E3C]">{t(rec.es, rec.qu)}</p>
                         <p className="text-lg text-[#8B5E3C]/60 font-medium">{rec.date}</p>
                       </div>
                    </div>
                    <AudioButton textEs={`El ${rec.date}, el alumno ${rec.es}`} textQu={`${rec.date} p'unchawta, ruraqmi ${rec.qu}`} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 6. TASKS */}
          {activeView === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Header titleEs="Tareas" titleQu="Ruranakuna" onBack={() => setActiveView('home')} />
              <div className="space-y-4">
                {TASKS.map(task => (
                  <div key={task.id} className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-[#F7F3EE]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-[#A7C7E7]/30 text-[#4f789e] text-sm font-bold px-4 py-2 rounded-xl">{task.subject}</span>
                      <span className="text-lg font-bold text-[#C97B63]">{t('Para el', 'Yaku')} {task.due}</span>
                    </div>
                    <div className="flex gap-5 items-start">
                      <AudioButton textEs={task.es} textQu={task.qu} />
                      <p className="text-[#8B5E3C] text-xl font-medium leading-snug mt-1">{t(task.es, task.qu)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 7. AI ASSISTANT CHAT */}
          {activeView === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-[#F7F3EE] flex flex-col">
              <div className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-[#8B5E3C]/5">
                <button onClick={() => { setActiveView('home'); stopRecording(); stopSpeaking(); }} className="p-4 bg-white hover:bg-gray-50 rounded-3xl active:scale-95 border-2 border-[#F7F3EE] text-[#8B5E3C]">
                  <ChevronLeft size={36} />
                </button>
                <div className="flex flex-col items-center">
                  <h3 className="text-3xl font-extrabold text-[#C97B63]">Rimay</h3>
                  <span className="text-sm font-medium text-[#8B5E3C]/60">{t('En línea', 'Llamk\'achkan')}</span>
                </div>
                <div className="w-16"></div> {/* Spacer balance */}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-end gap-3 max-w-[90%]">
                  <div className="w-12 h-12 rounded-full bg-[#C97B63] flex items-center justify-center shrink-0 shadow-md">
                    <MessageCircle size={24} color={COLORS.white} />
                  </div>
                  <div className="bg-white p-6 rounded-[32px] rounded-bl-lg border-2 border-[#F7F3EE] shadow-sm relative">
                    <p className="text-xl font-medium text-[#8B5E3C]">{t('Hola. Toca el botón de abajo para preguntarme algo sobre Alex.', 'Allinllachu. Ñit\'iy botonta Alexmanta tapuwanaykipaq.')}</p>
                    <div className="absolute -right-2 -bottom-2">
                       <AudioButton textEs="Hola. Toca el gran botón de abajo para preguntarme algo sobre Alex." textQu="Allinllachu. Ñit\'iy botonta Alexmanta tapuwanaykipaq." className="w-12 h-12 p-2" />
                    </div>
                  </div>
                </div>

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex items-end gap-3 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-14 h-14 rounded-full bg-[#C97B63] shrink-0 flex items-center justify-center shadow-md">
                         <MessageCircle size={28} color={COLORS.white} />
                      </div>
                    )}
                    <div className={`p-6 rounded-[32px] ${msg.sender === 'user' ? 'bg-[#8B5E3C] text-[#F7F3EE] rounded-br-lg' : 'bg-white text-[#8B5E3C] border-2 border-[#F7F3EE] rounded-bl-lg'} shadow-sm relative`}>
                      <p className="text-xl font-medium leading-snug">
                        {msg.text}
                        {msg.id === 'temp' && <Loader2 className="inline ml-3 animate-spin" size={24} />}
                      </p>
                      {msg.sender === 'ai' && msg.id !== 'temp' && (
                         <div className="absolute -right-2 -bottom-2">
                            <AudioButton textEs={msg.text} className="w-12 h-12 p-2 shadow-md" />
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Big Voice Button Area or Text Fallback */}
              <div className="p-8 bg-white border-t-2 border-[#F7F3EE] flex flex-col items-center justify-center pb-12 rounded-t-[40px] shadow-[0_-10px_40px_rgba(139,94,60,0.05)]">
                {micError ? (
                  <div className="w-full">
                    <p className="text-center text-[#C97B63] font-bold mb-4">{t('No pudimos detectar tu micrófono. Por favor, escribe tu consulta.', 'Micrófono mana allinchu. Qillqay uraypi.')}</p>
                    <form onSubmit={processTextInput} className="flex gap-3">
                      <input 
                        type="text" 
                        value={textInput} 
                        onChange={e => setTextInput(e.target.value)} 
                        placeholder={t('Escribe tu mensaje...', 'Qillqay...')}
                        className="flex-1 bg-[#F7F3EE] text-[#8B5E3C] p-6 rounded-[24px] border-2 border-transparent focus:border-[#C97B63] focus:outline-none text-xl"
                      />
                      <button 
                        type="submit" 
                        disabled={!textInput.trim() || isProcessingVoice}
                        className="bg-[#C97B63] disabled:bg-[#C97B63]/50 text-white p-6 rounded-[24px] shadow-[0_6px_0_#a8624d] active:shadow-none active:translate-y-1 transition-all"
                      >
                        <MessageCircle size={32} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <button
                    onPointerDown={startRecording}
                    onPointerUp={stopRecording}
                    onPointerLeave={stopRecording}
                    className={`w-36 h-36 rounded-[40px] flex flex-col items-center justify-center gap-3 transition-all transform active:scale-95 select-none touch-none ${
                        isRecording 
                        ? 'bg-[#C97B63] scale-110 shadow-[0_0_40px_rgba(201,123,99,0.4)]' 
                        : 'bg-[#C97B63] shadow-[0_12px_0_#a8624d]'
                    } text-white`}
                  >
                    {isRecording ? <Square size={56} fill="currentColor" /> : <Mic size={56} />}
                    <span className="text-lg font-bold uppercase tracking-widest">{isRecording ? t('Escuchando', 'Uyarispa') : t('Mantener', 'Ñitiy')}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
