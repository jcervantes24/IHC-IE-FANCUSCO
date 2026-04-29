import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, History, Info, ChevronLeft, ChevronRight, Globe, Zap, Clock, GraduationCap, Wallet, BookOpen, User, Bell, Home, LayoutDashboard, HelpCircle, CheckCircle2, AlertCircle, Clock4, X, Send, Sun, Moon, Calendar, Camera, Mail, Phone, MapPin, Edit2, Menu } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Initialization helper
let genAI: GoogleGenAI | null = null;
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  translation?: string;
  timestamp: string;
}

type View = 'dashboard' | 'grades' | 'attendance' | 'payments' | 'assistant' | 'profile';
type Language = 'qu' | 'es';

const SchoolLogo = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" className={className}>
    <path d="M 5,10 Q 50,5 95,10 L 95,70 C 95,100 50,115 50,115 C 50,115 5,100 5,70 Z" fill="#1b2c66" stroke="#fdeb22" strokeWidth="3" />
    <path d="M 6.5,11.5 L 35,10 L 35,38 L 6.5,38 Z" fill="#e31837" />
    <path d="M 35,10 L 65,10 L 65,38 L 35,38 Z" fill="#ffffff" />
    <path d="M 65,10 L 93.5,11.5 L 93.5,38 L 65,38 Z" fill="#e31837" />
    <path d="M 5,38 L 95,38" stroke="#fdeb22" strokeWidth="3" />
    
    <text x="22" y="32" fontFamily="serif" fontWeight="900" fontSize="24" fill="#222" textAnchor="middle">I</text>
    <text x="50" y="32" fontFamily="serif" fontWeight="900" fontSize="24" fill="#222" textAnchor="middle">E</text>
    <text x="78" y="32" fontFamily="serif" fontWeight="900" fontSize="24" fill="#222" textAnchor="middle">P</text>

    {/* Sword Element */}
    <path d="M 50,45 L 50,90" stroke="#fdeb22" strokeWidth="3" />
    <path d="M 42,76 L 58,76" stroke="#fdeb22" strokeWidth="3" />
    <circle cx="50" cy="58" r="8" fill="#fdeb22" />
    <path d="M 50,46 L 50,70 M 38,58 L 62,58 M 41,49 L 59,67 M 41,67 L 59,49" stroke="#fdeb22" strokeWidth="1.5" />
    
    {/* Laurel Branches */}
    <path d="M 36,80 C 10,75 25,48 40,43" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
    <path d="M 64,80 C 90,75 75,48 60,43" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
    <path d="M 36,80 L 64,80 M 34,77 L 66,77" stroke="#e31837" strokeWidth="1" />
    
    <path id="text-curve" d="M 12,70 A 42 42 0 0 0 88,70" fill="transparent" />
    <text fontFamily="sans-serif" fontWeight="900" fontSize="8.5" fill="#fdeb22" letterSpacing="0.5">
      <textPath href="#text-curve" startOffset="50%" textAnchor="middle">
        CRL. FCO BOLOGNESI
      </textPath>
    </text>
  </svg>
);

const PENDING_ACTIVITIES = [
  { date: '2026-04-25', title: 'Reunión de Padres' },
  { date: '2026-04-28', title: 'Entrega de Proyectos' },
  { date: '2026-05-02', title: 'Examen de Quechua' },
  { date: '2026-05-10', title: 'Día de la Madre' }
];

const MiniCalendar = ({ t }: { t: (q: string, s: string) => string }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 23)); // Fixed to April 2023 for demo consistency
  
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  
  const monthNames = [
    t('Enero', 'Enero'), t('Febrero', 'Febrero'), t('Marzo', 'Marzo'),
    t('Abril', 'Abril'), t('Mayo', 'Mayo'), t('Junio', 'Junio'),
    t('Julio', 'Julio'), t('Agosto', 'Agosto'), t('Septiembre', 'Septiembre'),
    t('Octubre', 'Octubre'), t('Noviembre', 'Noviembre'), t('Diciembre', 'Diciembre')
  ];

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const totalDays = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const hasActivity = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return PENDING_ACTIVITIES.some(a => a.date === dateStr);
  };

  const daysArr = [];
  for (let i = 0; i < startDay; i++) daysArr.push(null);
  for (let i = 1; i <= totalDays; i++) daysArr.push(i);

  return (
    <div className="p-4 bg-geo-surface border border-geo-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-geo-text">
          {monthNames[month]} {year}
        </h4>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-geo-panel rounded-lg transition-colors text-geo-muted hover:text-geo-primary"><ChevronLeft size={14} /></button>
          <button onClick={nextMonth} className="p-1 hover:bg-geo-panel rounded-lg transition-colors text-geo-muted hover:text-geo-primary"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <span key={i} className="text-[8px] font-sans font-black text-geo-muted-light">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysArr.map((day, i) => (
          <div key={i} className="aspect-square flex flex-col items-center justify-center relative">
            {day && (
              <span className={`text-[10px] font-sans font-bold transition-colors ${day === 23 && month === 3 ? 'text-geo-primary' : 'text-geo-text'}`}>
                {day}
              </span>
            )}
            {day && hasActivity(day) && (
              <div className="absolute bottom-0 w-1 h-1 bg-geo-accent rounded-full"></div>
            )}
            {day === 23 && month === 3 && (
              <div className="absolute inset-0 border border-geo-primary/30 rounded-lg -m-0.5"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [language, setLanguage] = useState<Language>('qu');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const t = (que: string, spa: string) => language === 'qu' ? que : spa;

  const [paymentStatuses, setPaymentStatuses] = useState<Record<number, string>>({
    0: 'Pagado',
    1: 'Pendiente',
    2: 'Vencido'
  });

  const [attendance, setAttendance] = useState([
    { date: '21/04/2026', status: 'Presente', justification: '' },
    { date: '22/04/2026', status: 'Faltó', justification: '' },
    { date: '23/04/2026', status: 'Presente', justification: '' },
  ]);

  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string | null>(null);
  const [justificationText, setJustificationText] = useState('');

  // Mock Data
  const STUDENT_DATA = {
    name: "Alex Quispe Condori",
    grade: t('4to Secundaría - A', '4to Secundaria - A'),
    grades: [
      { subject: t('Rimay Katia (Comunicación)', 'Comunicación'), score: 18, status: t('Allin yupay (Aprobado)', 'Aprobado') },
      { subject: t('Yupay Yachay (Matemáticas)', 'Matemáticas'), score: 14, status: t('Allin yupay (Aprobado)', 'Aprobado') },
      { subject: t('Llaqta Yachay (Ciencias Sociales)', 'Ciencias Sociales'), score: 16, status: t('Allin yupay (Aprobado)', 'Aprobado') },
      { subject: t('Runasimi (Quechua)', 'Quechua'), score: 20, status: t('Lliwpapas aswan allin (Excelente)', 'Excelente') },
    ],
    payments: [
      { id: 0, concept: t('Marzo Killapa Qullqi (Matrícula)', 'Matrícula Marzo'), amount: "S/. 50.00", status: paymentStatuses[0], date: "05/03/2026" },
      { id: 1, concept: t('Abril Killapa Qullqi (Mensualidad)', 'Mensualidad Abril'), amount: "S/. 30.00", status: paymentStatuses[1], date: "30/04/2026" },
      { id: 2, concept: t('Yachana Imakuna (Materiales)', 'Materiales Académicos'), amount: "S/. 25.00", status: paymentStatuses[2], date: "15/04/2026" },
    ],
    attendanceStats: {
      present: attendance.filter(a => a.status === 'Presente').length,
      absent: attendance.filter(a => a.status === 'Faltó').length,
      justified: attendance.filter(a => a.justification !== '').length,
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // Login functionality
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssistantHelp, setShowAssistantHelp] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [parentData, setParentData] = useState({
    name: "José Quispe Huamán",
    email: "jose.quispe@correo.com",
    phone: "+51 987 654 321",
    address: "Zarzuela Alta S/N, Cusco"
  });
  const [tempParentData, setTempParentData] = useState(parentData);
  const [isRecording, setIsRecording] = useState(false);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [inputText, setInputText] = useState('');

  const handleSendText = async () => {
    if (!inputText.trim() || isProcessing) return;
    const textToSend = inputText.trim();
    setInputText('');
    setIsProcessing(true);
    setError(null);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessageId = Date.now().toString();
    
    setMessages(prev => [...prev, { id: newMessageId, type: 'user', text: textToSend, timestamp: now }]);

    try {
      const prompt = `Eres el asistente virtual "Rimay" de la Institución Educativa Coronel Francisco Bolognesi en Cusco.
      Tu objetivo es ayudar a padres a entender la información del colegio.
      Los datos actuales del alumno son: ${JSON.stringify(STUDENT_DATA)}.
      Los datos de asistencia son: ${JSON.stringify(attendance)}.
      Los datos del padre/apoderado son: ${JSON.stringify(parentData)}.
      Las actividades pendientes en el calendario son: ${JSON.stringify(PENDING_ACTIVITIES)}.
      
      El usuario acaba de preguntar por texto lo siguiente: "${textToSend}"
      
      Tu tarea es:
      1. Responder brevemente de forma amable a la pregunta, usando los datos del alumno si se preguntan por notas o pagos.
      2. La respuesta principal ("reply") debe estar en Quechua (variante Cusco).
      3. Proporciona la traducción de tu respuesta al Español ("replyTranslation").
      
      Devuelve JSON:
      {
        "reply": "...",
        "replyTranslation": "..."
      }`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: "gemini-1.5-flash" })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get AI response');
      }

      const resData = await response.json();
      const aiText = resData.text;
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      setMessages(prev => [...prev, 
        { id: (Date.now() + 1).toString(), type: 'ai', text: data.reply, translation: data.replyTranslation, timestamp: now }
      ]);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('API_KEY_INVALID')) {
        setError(t('IA Clave mana allinchu.', 'La clave de IA no es válida.'));
      } else if (err.message?.includes('429')) {
        setError(t('IA nishuta tapukuchkanki. Suyay.', 'Límite de mensajes alcanzado. Espere un momento.'));
      } else {
        setError(t('IA pantaypi kachkan.', 'Error de conexión con la IA. Intente de nuevo.'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    if (dni.length !== 8 || isNaN(Number(dni))) {
      setLoginError(t('DNI nisqaqa 8 yupayyuqmi kanan', 'El DNI debe tener 8 dígitos'));
      return;
    }
    if (password.length < 4) {
      setLoginError(t('Claveykiqa pisi qillqayuqmi', 'La contraseña es muy corta'));
      return;
    }
    setLoginError('');
    setIsAuthenticated(true);
  };

  const handleForgot = () => {
    if (!resetEmail.includes('@')) {
      setResetError(t('Allin correota qillqay', 'Ingrese un correo válido'));
      return;
    }
    setResetError('');
    setResetSent(true);
  };

  const handlePay = (id: number) => {
    setSelectedPaymentId(id);
    setShowPaymentModal(true);
  };

  const handleJustifySubmit = () => {
    if (selectedAttendanceDate) {
      setAttendance(prev => prev.map(a => 
        a.date === selectedAttendanceDate ? { ...a, justification: justificationText } : a
      ));
      setShowJustifyModal(false);
      setSelectedAttendanceDate(null);
      setJustificationText('');
    }
  };

  const confirmPay = () => {
    if (selectedPaymentId !== null) {
      setPaymentStatuses(prev => ({ ...prev, [selectedPaymentId]: 'Pagado' }));
      setShowPaymentModal(false);
      setSelectedPaymentId(null);
    }
  };


  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Audio Visualization
  useEffect(() => {
    if (isRecording && canvasRef.current && analyserRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!isRecording) return;
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / 40);
          let x = 0;

          ctx.fillStyle = '#BC4A3C'; // geo-primary
          for (let i = 0; i < 40; i++) {
            const index = Math.floor(i * bufferLength / 40);
            const barHeight = (dataArray[index] / 255) * canvas.height;
            const barX = x + (barWidth / 2) - 1;
            ctx.beginPath();
            ctx.roundRect(barX, (canvas.height - barHeight) / 2, 2, barHeight, 20);
            ctx.fill();
            x += barWidth;
          }
        }
      };
      draw();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta grabación de audio.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      console.error("Mic error:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No se encontró ningún micrófono conectado.");
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Permiso de micrófono denegado.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError("El micrófono ya está siendo usado por otra aplicación.");
      } else {
        setError(err.message || "Error al acceder al micrófono.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const response = await fetch('/api/ai/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Eres el asistente virtual "Rimay" de la Institución Educativa Coronel Francisco Bolognesi en Cusco.
      Tu objetivo es ayudar a padres quechuahablantes a entender la información del colegio.
      Los datos actuales del alumno son: ${JSON.stringify(STUDENT_DATA)}.
      Los datos de asistencia son: ${JSON.stringify(attendance)}.
      Los datos del padre/apoderado son: ${JSON.stringify(parentData)}.
      Las actividades pendientes en el calendario son: ${JSON.stringify(PENDING_ACTIVITIES)}.
      
      El audio adjunto es un mensaje en Quechua (variante Cusco). 
      Tu tarea es:
      1. Transcribir exactamente lo que se dice en Quechua.
      2. Traducir esa transcripción al Español.
      3. Responder brevemente de forma amable en Quechua y su traducción al Español, usando los datos del alumno si se preguntan por notas, pagos, asistencias, actividades del calendario o sus propios datos.
      
      Devuelve JSON:
      {
        "transcription": "...",
        "translation": "...",
        "reply": "...",
        "replyTranslation": "..."
      }`,
          audioBase64: base64Data,
          model: "gemini-1.5-flash"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process audio');
      }

      const resData = await response.json();
      const aiText = resData.text;
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [...prev, 
        { id: Date.now().toString(), type: 'user', text: data.transcription, translation: data.translation, timestamp: now },
        { id: (Date.now() + 1).toString(), type: 'ai', text: data.reply, translation: data.replyTranslation, timestamp: now }
      ]);
    } catch (err: any) {
      console.error("AI Error:", err);
      if (err.message?.includes('API_KEY_INVALID')) {
        setError(t('IA Clave mana allinchu.', 'La clave de IA no es válida.'));
      } else {
        setError(t('IA Rimaypi pantay kachkan.', 'Hubo un error al procesar el audio con la IA.'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`w-full min-h-screen ${isDarkMode ? 'dark' : ''} bg-geo-bg text-geo-text flex items-center justify-center font-serif p-6 transition-colors duration-300`}>
        {/* Theme Toggle in Login */}
        <div className="absolute top-8 right-44 z-10">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-geo-surface border border-geo-border text-geo-muted hover:text-geo-primary transition-all shadow-sm"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        {/* Language Switcher on Login */}
        <div className="absolute top-8 right-8 flex gap-2">
            <button 
              onClick={() => setLanguage('qu')}
              className={`px-4 py-2 rounded-full text-[10px] font-sans font-black uppercase tracking-widest transition-all ${language === 'qu' ? 'bg-geo-primary text-white shadow-lg shadow-geo-primary/20' : 'bg-geo-surface text-geo-muted border border-geo-border hover:border-geo-primary'}`}
            >
              Runasimi
            </button>
            <button 
              onClick={() => setLanguage('es')}
              className={`px-4 py-2 rounded-full text-[10px] font-sans font-black uppercase tracking-widest transition-all ${language === 'es' ? 'bg-geo-primary text-white shadow-lg shadow-geo-primary/20' : 'bg-geo-surface text-geo-muted border border-geo-border hover:border-geo-primary'}`}
            >
               Español
            </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-geo-surface border border-geo-border rounded-[40px] shadow-2xl p-10 relative overflow-hidden"
        >
          {/* Decorative School Logo / Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-28 flex items-center justify-center mb-6 drop-shadow-2xl">
               <SchoolLogo />
            </div>
            <h1 className="text-2xl font-bold text-geo-primary text-center leading-tight">
              I.E. Coronel <br /> Francisco Bolognesi
            </h1>
            <p className="text-xs font-sans text-geo-accent font-bold uppercase tracking-[0.2em] mt-2">
               {t('Tayta Mamakunapa Intranetnin', 'Intranet de Padres')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showForgotPassword ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-black uppercase text-geo-muted-light tracking-widest pl-1">{t('Yachaqpa DNIn', 'DNI del Estudiante')}</label>
                    <input 
                      type="text" 
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      maxLength={8}
                      placeholder={t('DNInkita qillqay', 'Ingrese DNI')}
                      className="w-full p-4 bg-geo-panel border border-geo-border rounded-2xl focus:border-geo-primary outline-none transition-all font-sans text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-black uppercase text-geo-muted-light tracking-widest pl-1">{t('Claveyki', 'Contraseña')}</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-4 bg-geo-panel border border-geo-border rounded-2xl focus:border-geo-primary outline-none transition-all font-sans text-sm"
                    />
                  </div>
                  {loginError && <p className="text-xs text-red-500 font-sans font-bold pl-1">{loginError}</p>}
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group text-xs text-geo-muted">
                    <input type="checkbox" className="w-4 h-4 rounded border-geo-border text-geo-primary focus:ring-geo-primary" />
                    <span className="group-hover:text-geo-text transition-colors font-sans">{t('Yuyariway (Recordarme)', 'Recordarme')}</span>
                  </label>
                  <button 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-geo-primary font-bold font-sans hover:underline"
                  >
                    {t('¿Quonqaruni? (¿Olvidé mi clave?)', '¿Olvidé mi clave?')}
                  </button>
                </div>

                <button 
                  onClick={handleLogin}
                  className="w-full py-4 bg-geo-primary text-white rounded-2xl font-sans font-black uppercase tracking-widest text-xs hover:bg-geo-primary/90 transition-all shadow-lg shadow-geo-primary/20"
                >
                  {t('Haykuy (Ingresar)', 'Ingresar')}
                </button>
                
                <p className="text-center text-[10px] text-geo-muted-light px-6 leading-relaxed">
                  {t('Sichus manaraq claveykikuna kanchu chayqa, secretaríaman hamuy Zarzuela Alta-pi.', 'Si no tiene sus credenciales, por favor acérquese a la secretaría del colegio en Zarzuela Alta.')}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">{t('Hukmanta clave mañakuy', 'Recuperar Contraseña')}</h3>
                  <p className="text-xs text-geo-muted leading-relaxed font-sans text-balance">
                    {t('Correo electronicoykita qillqay claveyki kutichinaykupaq.', 'Ingrese el correo electrónico asociado a su cuenta para recibir un enlace de recuperación.')}
                  </p>
                </div>

                {!resetSent ? (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-sans font-black uppercase text-geo-muted-light tracking-widest pl-1">{t('Correo Electrónico', 'Correo Electrónico')}</label>
                      <input 
                        type="email" 
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full p-4 bg-geo-panel border border-geo-border rounded-2xl focus:border-geo-primary outline-none transition-all font-sans text-sm"
                      />
                      {resetError && <p className="text-xs text-red-500 font-sans font-bold pl-1 pt-1">{resetError}</p>}
                    </div>
                    <button 
                      onClick={handleForgot}
                      className="w-full py-4 bg-geo-accent text-white rounded-2xl font-sans font-black uppercase tracking-widest text-xs hover:bg-geo-accent-muted transition-all shadow-lg shadow-geo-accent/20"
                    >
                      {t('Kachay (Enviar Enlace)', 'Enviar Enlace')}
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-geo-accent/5 border border-geo-accent/20 rounded-2xl text-center"
                  >
                    <div className="w-12 h-12 bg-geo-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="text-geo-accent" />
                    </div>
                    <p className="text-sm font-bold text-geo-accent mb-1">{t('¡Correoqa kachasqañam!', '¡Correo enviado!')}</p>
                    <p className="text-xs text-geo-accent-muted leading-relaxed font-sans">
                      {t('Qhaway correoykita, chaypim kachkan clavemanta yanapakuy.', 'Revisa tu correo para recuperar tu clave.')}
                    </p>
                  </motion.div>
                )}

                <button 
                  onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
                  className="w-full text-xs text-geo-muted font-bold font-sans hover:text-geo-primary transition-colors mt-4 flex items-center justify-center gap-2"
                >
                  <ChevronRight className="rotate-180 size-3" /> Kutimuy (Volver al login)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen ${isDarkMode ? 'dark' : ''} bg-geo-bg text-geo-text flex flex-col font-serif overflow-hidden transition-colors duration-300`}>
      {/* Header Navigation */}
      <header className="w-full h-20 border-b border-geo-border flex items-center justify-between px-12 bg-geo-surface transition-colors duration-300 z-20 shrink-0">
        <div className="flex items-center gap-4 text-geo-primary">
          <button 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
             <Menu className="size-6" />
          </button>
          <div className="w-12 h-14 flex items-center justify-center drop-shadow-lg hidden sm:flex">
             <SchoolLogo />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              I.E. Coronel <br className="hidden sm:block" /> Francisco Bolognesi
            </h1>
            <p className="text-[10px] font-sans text-geo-accent font-bold uppercase tracking-widest sm:-mt-1">{t('Cusco - Intranet', 'Cusco - Intranet')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-geo-panel transition-all text-geo-muted hover:text-geo-primary border border-transparent hover:border-geo-border"
              title={isDarkMode ? t('Modo Claro', 'Modo Claro') : t('Modo Noche', 'Modo Noche')}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setLanguage(language === 'qu' ? 'es' : 'qu')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-geo-panel rounded-full transition-all text-geo-muted hover:text-geo-primary group border border-transparent hover:border-geo-border"
            >
              <Globe size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-sans font-bold uppercase tracking-widest leading-none pt-0.5">
                {language === 'qu' ? 'ESPAÑOL' : 'QUECHUA'}
              </span>
            </button>
          </div>

          <div className="hidden md:flex gap-4 text-sm font-sans font-bold border-l border-geo-border pl-6">
            <div className="flex flex-col items-end">
              <span className="text-geo-text text-sm">{parentData.name}</span>
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-[10px] text-geo-primary uppercase hover:underline cursor-pointer"
              >
                {t('Lluqsiy', 'Cerrar Sesión')}
              </button>
            </div>
            <div 
               onClick={() => setActiveView('profile')} 
               className="w-10 h-10 bg-geo-panel rounded-full border border-geo-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-geo-primary transition-all"
               title={t('Kawsay Qillqa', 'Ir al Perfil')}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-geo-muted size-5" />
              )}
            </div>
          </div>
          <div className="relative">
            <div 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="relative cursor-pointer"
            >
              <Bell className="size-5 text-geo-muted-light hover:text-geo-primary transition-colors" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-geo-primary rounded-full border-2 border-geo-surface animate-pulse"></span>
            </div>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-6 w-80 bg-geo-surface border border-geo-border rounded-3xl shadow-2xl z-50 p-6"
                >
                  <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-geo-muted mb-4">{t('Willakuykuna', 'Notificaciones')}</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-3 bg-geo-panel rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-geo-accent/10 flex items-center justify-center shrink-0">
                          <Bell className="size-5 text-geo-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-geo-text">{t('Musuq Willaku', 'Nuevo Anuncio')}</p>
                          <p className="text-xs text-geo-muted font-sans leading-tight mt-1">{t('Tayta Mama Huñunakuy paqarin', 'Reunión de Padres mañana')}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-3 bg-geo-panel rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                          <AlertCircle className="size-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-geo-text">{t('Qullqi Pagay', 'Aviso de Pago')}</p>
                          <p className="text-xs text-geo-muted font-sans leading-tight mt-1">{t('Mana pagasqa qullqiki kachkan', 'Tiene un recibo vencido')}</p>
                        </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/50 z-40 md:hidden" 
               onClick={() => setIsMobileMenuOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Sidebar Left: Navigation */}
        <aside className={`fixed inset-y-0 left-0 z-50 h-full bg-geo-panel border-r border-geo-border flex flex-col transition-all duration-300 shrink-0 md:relative ${
          isMobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-20 md:p-3 items-center overflow-x-hidden' : 'md:w-64 p-6'}`}>
          
          <div className="flex justify-end mb-4 border-b border-geo-border/50 pb-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-geo-muted hover:text-geo-primary"><X size={24} /></button>
          </div>

          <nav className="space-y-2 flex-1 w-full">
            <div className="hidden md:flex justify-end mb-6">
               <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-geo-muted hover:text-geo-primary transition-all p-1">
                  {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
               </button>
            </div>
            {[
              { id: 'dashboard', label: t('Qallaariy', 'Inicio'), sub: t('Qallarina', 'Principal'), icon: <Home size={18} className="shrink-0" /> },
              { id: 'grades', label: t('Yachaykuna', 'Informatica'), sub: t('Notas', 'Calificaciones'), icon: <BookOpen size={18} className="shrink-0" /> },
              { id: 'attendance', label: t('Chayamuy', 'Asistencia'), sub: t('Yupay', 'Control'), icon: <Calendar size={18} className="shrink-0" /> },
              { id: 'payments', label: t('Qullqi', 'Pagos'), sub: t('Boletas', 'Recibos'), icon: <Wallet size={18} className="shrink-0" /> },
              { id: 'assistant', label: t('Rimay', 'Rimay'), sub: t('Yanapakuy', 'Asistente'), icon: <Mic size={18} className="shrink-0" /> },
              { id: 'profile', label: t('Kawsay Qillqa', 'Perfil'), sub: t('Taytapa', 'Del Apoderado'), icon: <User size={18} className="shrink-0" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as View); setIsMobileMenuOpen(false); }}
                className={`w-full ${isSidebarCollapsed ? 'px-0 py-3 justify-center' : 'p-3'} rounded-xl flex items-center gap-3 transition-all text-left group overflow-hidden ${
                  activeView === item.id 
                    ? 'bg-geo-primary text-white shadow-lg shadow-geo-primary/20' 
                    : 'hover:bg-geo-surface text-geo-muted hover:text-geo-primary'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className={`flex items-center justify-center shrink-0 ${isSidebarCollapsed ? 'w-full' : ''}`}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col whitespace-nowrap min-w-0">
                    <span className="text-xs font-bold leading-tight truncate">{item.label}</span>
                    <span className={`text-[10px] uppercase font-sans tracking-tighter truncate ${activeView === item.id ? 'text-white/60' : 'text-geo-muted-light'}`}>
                      {item.sub}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </nav>
          
          {!isSidebarCollapsed && (
            <div className="mt-8 mb-6 hidden md:block">
               <MiniCalendar t={t} />
            </div>
          )}
          
          {!isSidebarCollapsed && (
            <div className="mt-auto p-4 bg-geo-accent/10 rounded-2xl border border-geo-accent/20 hidden md:block">
              <div className="flex items-center gap-2 text-geo-accent mb-2">
                <HelpCircle size={14} />
                <span className="text-[10px] font-sans font-black uppercase">{t('Yanapay', 'Ayuda')}</span>
              </div>
              <p className="text-[11px] italic leading-tight text-geo-accent-muted">
                {t('¿Wawaykipaq yanapayta munankichu? Rimay assistant-man tapuy.', '¿Necesita ayuda con su hijo? Pregunte al asistente Rimay.')}
              </p>
            </div>
          )}
        </aside>

        {/* Center: Dynamic Content Area */}
        <section className="flex-1 bg-geo-surface flex flex-col overflow-hidden w-full relative">
          
          <div className="flex-1 overflow-y-auto minimal-scrollbar p-8 md:p-12 relative">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <div className="w-64 h-64 border-8 border-geo-primary rounded-full rotate-45 transform translate-x-20 -translate-y-20"></div>
            </div>

            <AnimatePresence mode="wait">
              {activeView === 'dashboard' && (
                <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl">
                  <h2 className="text-3xl font-light italic mb-8">{t('Allin hamusqayki,', 'Bienvenido/a,')} <span className="text-geo-primary font-bold not-italic">Alex</span></h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Academic Stats */}
                    <div className="p-6 bg-geo-surface border border-geo-border rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <GraduationCap className="size-12 text-geo-primary" />
                      </div>
                      <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase mb-2">{t('Allallin Yachaykuna', 'Información Aprobada')}</p>
                      <h4 className="text-4xl font-sans font-black text-geo-primary mb-1">
                        {STUDENT_DATA.grades.filter(g => g.score >= 11).length} / {STUDENT_DATA.grades.length}
                      </h4>
                      <p className="text-xs text-geo-muted font-medium italic">{t('Yachaykunam qillqasqa kachkan', 'Materias aprobadas este bimestre')}</p>
                    </div>

                    <div className="p-6 bg-geo-surface border border-geo-border rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap className="size-12 text-geo-accent" />
                      </div>
                      <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase mb-1">{t('Kuskay Kallpachakuy', 'Promedio General')}</p>
                      <h4 className="text-4xl font-sans font-black text-geo-accent mb-1">
                        {(STUDENT_DATA.grades.reduce((acc, curr) => acc + curr.score, 0) / STUDENT_DATA.grades.length).toFixed(1)}
                      </h4>
                      <p className="text-xs text-geo-muted font-medium italic">{t('Allallin yupayniyki', 'Rendimiento académico actual')}</p>
                    </div>

                    <div className="p-6 bg-geo-surface border border-geo-border rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock className="size-12 text-geo-muted" />
                      </div>
                      <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase mb-2">{t('Pasay Atiykuna', 'Asistencia')}</p>
                      <h4 className="text-4xl font-sans font-black text-geo-text mb-1">
                        {Math.round((STUDENT_DATA.attendanceStats.present / attendance.length) * 100)}%
                      </h4>
                      <p className="text-xs text-geo-muted font-medium italic">
                        {t('Mana pantaq kasqan', 'Puntualidad ejemplar')} ({STUDENT_DATA.attendanceStats.absent} {t('falta', 'faltas')})
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-geo-surface border border-geo-border rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-geo-text">{t('Yachaykuna Rikuchiy', 'Resumen Académico')}</h3>
                        <p className="text-sm text-geo-muted font-sans mt-1">{t('Kunan killa yupaykuna', 'Calificaciones del bimestre actual')}</p>
                      </div>
                      <div className="p-2 bg-geo-primary/10 rounded-xl">
                        <BookOpen className="size-6 text-geo-primary" />
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={STUDENT_DATA.grades} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis 
                            dataKey="subject" 
                            tickFormatter={(val) => {
                              // Extract short name from parenthesis if available
                              const match = val.match(/\((.*?)\)/);
                              return match ? match[1] : val;
                            }}
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: '#888888', fontWeight: 600 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: '#888888', fontWeight: 600 }} 
                            domain={[0, 20]} 
                            ticks={[0, 10, 15, 20]}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-geo-panel border border-geo-border p-3 rounded-xl shadow-lg">
                                    <p className="font-bold text-geo-text text-sm mb-1">{payload[0].payload.subject}</p>
                                    <p className="text-geo-primary font-black text-lg">Nota: {payload[0].value}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={40}>
                            {STUDENT_DATA.grades.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.score >= 15 ? 'currentColor' : '#e5e7eb'} 
                                className={entry.score >= 15 ? 'text-geo-primary' : 'text-geo-muted'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-12">
                    <h3 className="text-xs uppercase tracking-widest text-geo-muted-light font-sans font-black mb-6">{t('Willakuykuna', 'Anuncios')}</h3>
                    <div className="space-y-4">
                      <div className="flex gap-5 p-6 border-l-4 border-geo-accent bg-geo-panel rounded-r-2xl shadow-sm">
                        <div className="w-12 h-12 bg-geo-accent/10 rounded-full shrink-0 flex items-center justify-center"><Bell className="size-6 text-geo-accent" /></div>
                        <div>
                          <p className="text-xl font-serif font-bold text-geo-text mb-1">{t('Tayta Mama Huñunakuy', 'Reunión de Padres de Familia')}</p>
                          <p className="text-base text-geo-muted-light font-sans font-medium tracking-wide">
                            {t('Chay viernes 25 de abril • 5:00 PM', 'Este viernes 25 de abril • 5:00 PM')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'grades' && (
                <motion.div key="grades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                  <h2 className="text-3xl font-bold mb-8">{t('Yachaykuna', 'Informatica')} / <span className="text-geo-muted font-light italic">{t('Notas Willaku', 'Reporte de Notas')}</span></h2>
                  <div className="bg-geo-surface border border-geo-border rounded-3xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-geo-panel border-b border-geo-border">
                        <tr className="text-left">
                          <th className="p-4 text-[10px] uppercase font-sans font-black text-geo-muted-light">{t('Yachay Yachay', 'Materia')}</th>
                          <th className="p-4 text-[10px] uppercase font-sans font-black text-geo-muted-light text-center">{t('Yupay', 'Nota')}</th>
                          <th className="p-4 text-[10px] uppercase font-sans font-black text-geo-muted-light">{t('Suti', 'Estado')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STUDENT_DATA.grades.map((g, i) => (
                          <tr key={i} className="border-b border-geo-border/50 hover:bg-geo-panel/30 transition-colors">
                            <td className="p-5 font-extrabold text-geo-text text-base leading-tight">
                              {g.subject}
                            </td>
                            <td className="p-5 text-center font-sans font-black text-2xl text-geo-primary leading-none">
                              {g.score}
                            </td>
                            <td className="p-5">
                              <span className={`px-4 py-1.5 rounded-full text-[11px] font-sans font-black uppercase tracking-wider ${g.score >= 15 ? 'bg-geo-accent/10 text-geo-accent' : 'bg-geo-primary/10 text-geo-primary'}`}>
                                {g.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeView === 'attendance' && (
                <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                  <h2 className="text-3xl font-bold mb-8">{t('Chayamuy', 'Asistencia')} / <span className="text-geo-muted font-light italic">{t('Control de Asistencia', 'Control de Asistencia')}</span></h2>
                  
                  <div className="grid grid-cols-3 gap-6 mb-8">
                     <div className="p-6 bg-geo-surface border border-geo-border rounded-2xl">
                        <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase mb-1 tracking-widest">{t('Presente', 'Presente')}</p>
                        <p className="text-4xl font-sans font-black text-geo-accent">{STUDENT_DATA.attendanceStats.present}</p>
                     </div>
                     <div className="p-6 bg-geo-surface border border-geo-border rounded-2xl">
                        <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase mb-1 tracking-widest">{t('Falta', 'Faltas')}</p>
                        <p className="text-4xl font-sans font-black text-red-500">{STUDENT_DATA.attendanceStats.absent}</p>
                     </div>
                     <div className="p-6 bg-geo-surface border border-geo-border rounded-2xl">
                        <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase mb-1 tracking-widest">{t('Justificación', 'Justificadas')}</p>
                        <p className="text-4xl font-sans font-black text-geo-primary">{STUDENT_DATA.attendanceStats.justified}</p>
                     </div>
                  </div>

                  <div className="bg-geo-surface border border-geo-border rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-geo-panel border-b border-geo-border text-left">
                        <tr>
                          <th className="p-4 text-[10px] uppercase font-sans font-black text-geo-muted-light">{t('Punchaw', 'Fecha')}</th>
                          <th className="p-4 text-[10px] uppercase font-sans font-black text-geo-muted-light">{t('Imayna', 'Estado')}</th>
                          <th className="p-4 text-[10px] uppercase font-sans font-black text-geo-muted-light">{t('Willaku', 'Justificación')}</th>
                          <th className="p-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="font-sans">
                        {attendance.map((item, idx) => (
                          <tr key={idx} className="border-b border-geo-border/30 last:border-0 hover:bg-geo-panel/20 transition-colors">
                            <td className="p-5 font-bold text-geo-text">{item.date}</td>
                            <td className="p-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                item.status === 'Presente' ? 'bg-geo-accent/10 text-geo-accent' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {item.status === 'Presente' ? t('Chayamun', 'Presente') : t('Faltan', 'Faltó')}
                              </span>
                            </td>
                            <td className="p-5 text-xs text-geo-muted italic">
                              {item.justification || (item.status === 'Faltó' ? t('Justificación mana kanchu', 'Falta injustificada') : '-')}
                            </td>
                            <td className="p-5 text-right">
                              {item.status === 'Faltó' && !item.justification && (
                                <button 
                                  onClick={() => {
                                    setSelectedAttendanceDate(item.date);
                                    setJustificationText('');
                                    setShowJustifyModal(true);
                                  }}
                                  className="px-4 py-1.5 bg-geo-surface text-geo-primary border border-geo-primary/30 rounded-xl text-[10px] font-black uppercase hover:bg-geo-primary hover:text-white transition-all shadow-sm"
                                >
                                  {t('Justificachiy', 'Justificar')}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeView === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                  <h2 className="text-3xl font-bold mb-8">{t('Qullqi', 'Pagos')} / <span className="text-geo-muted font-light italic">{t('Qullqi Willaku', 'Estado de Cuenta')}</span></h2>
                  <div className="space-y-4">
                    {STUDENT_DATA.payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-geo-surface border border-geo-border rounded-2xl group hover:border-geo-primary/30 transition-all">
                        <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            p.status === 'Pagado' ? 'bg-geo-accent/10 text-geo-accent' : 
                            p.status === 'Vencido' ? 'bg-red-500/10 text-red-500' :
                            'bg-geo-primary/10 text-geo-primary'
                          }`}>
                            {p.status === 'Pagado' ? <CheckCircle2 size={20} /> : 
                             p.status === 'Vencido' ? <AlertCircle size={20} /> : 
                             <Clock4 size={20} />}
                          </div>
                          <div>
                            <p className="font-bold group-hover:text-geo-primary transition-colors">{p.concept}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-xs text-geo-muted">{p.date}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="flex flex-col items-end">
                            <p className="text-2xl font-sans font-black text-geo-text leading-none mb-2">{p.amount}</p>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-widest ${
                              p.status === 'Pagado' ? 'bg-geo-accent/10 text-geo-accent' : 
                              p.status === 'Vencido' ? 'bg-red-500/10 text-red-500' : 
                              'bg-geo-primary/10 text-geo-primary'
                            }`}>
                              {p.status === 'Pagado' ? <CheckCircle2 size={12} strokeWidth={3} /> : 
                               p.status === 'Vencido' ? <AlertCircle size={12} strokeWidth={3} /> : 
                               <Clock4 size={12} strokeWidth={3} />}
                              <span>{t(p.status === 'Pagado' ? 'Pagosqaña' : p.status === 'Vencido' ? 'Yalliña' : 'Kukchkan', p.status)}</span>
                            </div>
                          </div>
                          
                          {p.status !== 'Pagado' && (
                            <button 
                              onClick={() => handlePay(p.id)}
                              className="px-4 py-1.5 bg-geo-primary text-white rounded-full text-[10px] font-sans font-bold uppercase hover:bg-geo-primary/90 transition-all active:scale-95 shadow-md shadow-geo-primary/20"
                            >
                              {t('Paganapaq', 'Pagar Ahora')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                  <h2 className="text-3xl font-bold mb-8">{t('Kawsay Qillqa', 'Perfil')} / <span className="text-geo-muted font-light italic">{t('Taytapa', 'Del Apoderado')}</span></h2>
                  <div className="bg-geo-surface border border-geo-border rounded-3xl p-8 space-y-8 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="relative group cursor-pointer" onClick={() => profilePicInputRef.current?.click()}>
                           <div className="w-32 h-32 bg-geo-primary/5 rounded-[2rem] flex items-center justify-center border-2 border-geo-primary/20 overflow-hidden relative shadow-inner">
                              {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="size-12 text-geo-primary/50" />
                              )}
                              <div className="absolute inset-0 bg-geo-text/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="size-8 text-white" />
                              </div>
                           </div>
                           <p className="mt-3 text-[10px] font-sans font-black text-geo-muted-light uppercase tracking-widest group-hover:text-geo-primary transition-colors">
                             {t('Huk Uya', 'Cambiar Foto')}
                           </p>
                           <input 
                             type="file" 
                             ref={profilePicInputRef}
                             onChange={handleProfileImageUpload}
                             accept="image/*"
                             className="hidden"
                           />
                        </div>
                        <div className="flex-1 w-full">
                           {isEditingProfile ? (
                             <div className="space-y-2">
                               <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase tracking-widest">{t('Suti', 'Nombre Completo')}</p>
                               <div className="relative flex items-center">
                                 <User className="absolute left-4 size-5 text-geo-muted" />
                                 <input 
                                   type="text"
                                   value={tempParentData.name}
                                   onChange={(e) => setTempParentData({ ...tempParentData, name: e.target.value })}
                                   className="w-full bg-geo-panel border border-geo-border rounded-2xl pl-12 pr-4 py-3 text-lg font-bold text-geo-text focus:border-geo-primary outline-none transition-all shadow-inner"
                                 />
                               </div>
                             </div>
                           ) : (
                             <>
                               <h3 className="text-4xl font-black text-geo-text font-sans">{parentData.name}</h3>
                               <p className="text-geo-muted font-sans text-sm mt-2 font-bold uppercase tracking-widest">{t('Tayta / Apoderado', 'Padre / Apoderado')}</p>
                             </>
                           )}
                        </div>
                     </div>
                     <hr className="border-geo-border/50" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-geo-panel/50 p-6 rounded-3xl border border-geo-border/50 hover:bg-geo-panel hover:border-geo-border hover:shadow-sm transition-all group">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="p-2.5 bg-geo-primary/10 rounded-xl group-hover:bg-geo-primary/20 transition-colors">
                               <Mail className="size-5 text-geo-primary" />
                             </div>
                             <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase tracking-widest">{t('Yachana Correo', 'Correo Electrónico')}</p>
                           </div>
                           {isEditingProfile ? (
                             <input 
                               type="email"
                               value={tempParentData.email}
                               onChange={(e) => setTempParentData({ ...tempParentData, email: e.target.value })}
                               className="w-full bg-geo-surface border border-geo-border rounded-xl px-4 py-2.5 font-bold text-geo-text focus:outline-none focus:border-geo-primary transition-colors"
                             />
                           ) : (
                             <p className="font-sans font-bold text-geo-text text-lg">{parentData.email}</p>
                           )}
                        </div>
                        <div className="bg-geo-panel/50 p-6 rounded-3xl border border-geo-border/50 hover:bg-geo-panel hover:border-geo-border hover:shadow-sm transition-all group">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="p-2.5 bg-geo-accent/10 rounded-xl group-hover:bg-geo-accent/20 transition-colors">
                               <Phone className="size-5 text-geo-accent" />
                             </div>
                             <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase tracking-widest">{t('Celular', 'Teléfono')}</p>
                           </div>
                           {isEditingProfile ? (
                             <input 
                               type="text"
                               value={tempParentData.phone}
                               onChange={(e) => setTempParentData({ ...tempParentData, phone: e.target.value })}
                               className="w-full bg-geo-surface border border-geo-border rounded-xl px-4 py-2.5 font-bold text-geo-text focus:outline-none focus:border-geo-primary transition-colors"
                             />
                           ) : (
                             <p className="font-sans font-bold text-geo-text text-lg">{parentData.phone}</p>
                           )}
                        </div>
                        <div className="bg-geo-panel/50 p-6 rounded-3xl md:col-span-2 border border-geo-border/50 hover:bg-geo-panel hover:border-geo-border hover:shadow-sm transition-all group">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="p-2.5 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                               <MapPin className="size-5 text-green-500" />
                             </div>
                             <p className="text-[10px] font-sans font-black text-geo-muted-light uppercase tracking-widest">{t('Llaqta', 'Dirección')}</p>
                           </div>
                           {isEditingProfile ? (
                             <input 
                               type="text"
                               value={tempParentData.address}
                               onChange={(e) => setTempParentData({ ...tempParentData, address: e.target.value })}
                               className="w-full bg-geo-surface border border-geo-border rounded-xl px-4 py-2.5 font-bold text-geo-text focus:outline-none focus:border-geo-primary transition-colors"
                             />
                           ) : (
                             <p className="font-sans font-bold text-geo-text text-lg">{parentData.address}</p>
                           )}
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-6 border-t border-geo-border/30">
                       {isEditingProfile ? (
                         <>
                           <button 
                             onClick={() => setIsEditingProfile(false)}
                             className="px-6 py-3.5 bg-geo-panel text-geo-muted rounded-2xl text-[10px] font-sans font-black uppercase tracking-widest hover:bg-geo-border transition-all"
                           >
                             {t('Tatiy', 'Cancelar')}
                           </button>
                           <button 
                             onClick={() => {
                               setParentData(tempParentData);
                               setIsEditingProfile(false);
                             }}
                             className="px-8 py-3.5 bg-geo-primary text-white rounded-2xl text-[10px] font-sans font-black uppercase tracking-widest hover:bg-geo-primary/90 transition-all shadow-lg shadow-geo-primary/20 active:scale-95 flex items-center gap-2"
                           >
                             <CheckCircle2 size={16} />
                             {t('Yachaykuna Wakaychay', 'Guardar Datos')}
                           </button>
                         </>
                       ) : (
                         <button 
                           onClick={() => {
                             setTempParentData(parentData);
                             setIsEditingProfile(true);
                           }}
                           className="px-8 py-3.5 bg-geo-text text-white rounded-2xl text-[10px] font-sans font-black uppercase tracking-widest hover:bg-geo-text/90 transition-all shadow-md active:scale-95 flex items-center gap-2"
                         >
                            <Edit2 size={14} />
                            {t('Llamk\'apay Datos', 'Actualizar Datos')}
                         </button>
                       )}
                     </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'assistant' && (
                <motion.div key="assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col relative">
                  <div className="flex justify-between items-center mb-6 pl-2 pr-4 pt-2">
                    <h2 className="text-3xl font-bold">{t('Rimay', 'Rimay')} / <span className="text-geo-muted font-light italic">{t('Yanapakuy', 'Asistente')}</span></h2>
                    <button
                      onClick={() => setShowAssistantHelp(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-geo-panel border border-geo-border text-geo-muted hover:text-geo-primary hover:border-geo-primary rounded-full transition-all text-xs font-sans font-bold uppercase shadow-sm active:scale-95"
                    >
                      <Info size={16} />
                      {t('Imaynata tapuy', 'Cómo preguntar')}
                    </button>
                  </div>
                  {/* Assistant Chat Interface Integrated */}
                  <div className="flex-1 overflow-y-auto minimal-scrollbar mb-4 space-y-4 pr-2">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 mb-4"
                      >
                        <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-800 font-bold text-sm">{error}</p>
                          <p className="text-red-600 text-[10px] mt-1 uppercase font-sans font-black">
                            {t('Ima pantaypas kanman chhika, Intranet-man willay.', 'Si el problema persiste, contacte con soporte de la Intranet.')}
                          </p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                          <X size={16} />
                        </button>
                      </motion.div>
                    )}
                    {messages.length === 0 && !error ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-12">
                         <div className="w-20 h-20 bg-geo-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Mic className="text-geo-primary size-10" />
                         </div>
                         <h3 className="text-2xl italic font-light mb-2">{t('Sumalla Rimay', 'Sumalla Rimay')}</h3>
                         <p className="text-xs font-sans font-black uppercase tracking-widest leading-relaxed">
                           {t('Tapuway notaspi utaq qullqimantapas, Qusqu-Qullaw rimaypi.', 'Pregúntame sobre notas o pagos en Quechua Cusqueño.')}
                         </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-5 rounded-2xl border shadow-sm max-w-xl self-start ${msg.type === 'user' ? 'ml-auto bg-geo-surface border-geo-border' : 'bg-geo-accent/5 border-geo-accent/20'}`}
                        >
                           <p className="text-xs font-sans text-geo-muted-light mb-2 uppercase tracking-tighter">
                             {msg.timestamp} • {msg.type === 'user' ? t('Tayta/Mama', 'Padre/Madre') : t('Rimay Asistente', 'Rimay Asistente')}
                           </p>
                           <p className="text-lg leading-relaxed">{msg.text}</p>
                           {msg.translation && (
                             <>
                               <hr className="my-3 border-geo-border opacity-50" />
                               <p className="text-sm italic text-geo-accent-muted">{msg.translation}</p>
                             </>
                           )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Assistant Bar - Always available if not in assistant view */}
          {activeView !== 'assistant' && (
                <div className="h-20 border-t border-geo-border bg-geo-surface/80 backdrop-blur-md px-12 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-geo-primary rounded-full flex items-center justify-center text-white">
                      <Mic size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-black uppercase text-geo-muted-light tracking-widest">Rimay Assistant</p>
                      <p className="text-xs italic text-geo-text">{t('Tapuway wawaykipaq', 'Pregunta sobre tu hijo')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('assistant')}
                    className="px-6 py-2 bg-geo-primary text-white rounded-full text-[10px] font-sans font-black uppercase tracking-widest hover:bg-geo-primary/90"
                  >
                    {t('Rimay Qallay', 'Empezar a Hablar')}
                  </button>
                </div>
              )}

          {/* Recorder Controls in Assistant View */}
          {activeView === 'assistant' && (
            <div className="h-40 border-t border-geo-border bg-geo-panel p-6 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} width={800} height={150} className="w-full h-full" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
                <div className="flex w-full items-center gap-2 bg-geo-surface border border-geo-border rounded-full p-2 pr-2 shadow-sm focus-within:border-geo-primary transition-colors">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder={t('Qillqay tapukuyniykita...', 'Escribe tu pregunta aquí...')}
                    className="flex-1 bg-transparent px-4 font-sans text-sm outline-none text-geo-text placeholder:text-geo-muted-light"
                    disabled={isProcessing || isRecording}
                  />
                  
                  {inputText.trim() ? (
                    <button 
                      onClick={handleSendText}
                      disabled={isProcessing}
                      className="w-12 h-12 bg-geo-text rounded-full flex items-center justify-center text-geo-bg hover:scale-105 transition-transform disabled:opacity-50 shrink-0 shadow-md"
                    >
                      <Send size={18} className="-translate-x-0.5 translate-y-0.5" />
                    </button>
                  ) : (
                    <AnimatePresence mode="wait">
                      {!isRecording ? (
                        <motion.button
                          key="st"
                          initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                          onClick={startRecording}
                          disabled={isProcessing}
                          className="w-12 h-12 bg-geo-primary rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform disabled:opacity-50 shrink-0"
                        >
                          <Mic size={20} />
                        </motion.button>
                      ) : (
                        <motion.button
                          key="sp"
                          initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                          onClick={stopRecording}
                          className="w-12 h-12 bg-geo-primary rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform shrink-0"
                        >
                          <Square size={16} fill="white" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  )}
                </div>
                
                <div className="mt-3 h-4">
                  {isProcessing && <p className="text-[10px] font-sans font-black text-geo-primary animate-pulse italic">{t('WILLAKUYKUNATA QHAWAYKUCHKANI...', 'PROCESANDO INFORMACIÓN...')}</p>}
                  {isRecording && <p className="text-[10px] font-sans font-black text-geo-primary animate-pulse">{t('RIMAYKUY...', 'HABLANDO...')}</p>}
                  {error && <p className="text-[10px] font-sans font-black text-red-500 uppercase">{error}</p>}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-geo-text text-geo-bg flex items-center justify-between px-12 text-[9px] uppercase tracking-widest font-sans font-bold shrink-0 relative z-20">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> 
            {t('Llamk\'achkan: I.E. Bolognesi', 'Sistema en Línea: I.E. Bolognesi')}
          </span>
        </div>
        <div className="flex gap-8">
          <span className="opacity-70">{t('Cusco-pi, Zarzuela Alta S/N', 'Zarzuela Alta S/N, Cusco')}</span>
          <span className="hidden sm:inline">© 2026 Rimay Education</span>
        </div>
      </footer>

      {/* Assistant Help Modal */}
      <AnimatePresence>
        {showAssistantHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-geo-bg/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-geo-surface border border-geo-border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAssistantHelp(false)}
                className="absolute top-6 right-6 text-geo-muted hover:text-geo-text transition-colors"
                title="Cerrar"
              >
                <X size={24} />
              </button>
              
              <div className="w-14 h-14 bg-geo-primary/10 rounded-full flex items-center justify-center mb-6">
                 <Info className="text-geo-primary size-7" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{t('Rimayta Imaynata Llamk\'achina', 'Cómo usar Rimay')}</h3>
              <p className="text-sm font-sans text-geo-muted leading-relaxed mb-8">
                {t('Micrófono botonta ñit\'iy, chaymanta kay tapuykunata ruray waqyarikuspa:', 'Presione el botón redondo del micrófono en la parte inferior y hable para hacer consultas como:')}
              </p>
              
              <div className="space-y-4 font-sans text-sm">
                <div className="p-4 bg-geo-panel rounded-2xl border border-geo-border hover:border-geo-primary/30 transition-colors">
                  <p className="font-bold text-geo-primary mb-1">"¿Imaynam wawaypa notankuna kachkan?"</p>
                  <p className="text-xs text-geo-muted italic">¿Cómo están las notas de mi hijo?</p>
                </div>
                <div className="p-4 bg-geo-panel rounded-2xl border border-geo-border hover:border-geo-primary/30 transition-colors">
                  <p className="font-bold text-geo-primary mb-1">"¿Hayk'ataq qullqita paganay kachkan?"</p>
                  <p className="text-xs text-geo-muted italic">¿Cuánto dinero me falta pagar?</p>
                </div>
                <div className="p-4 bg-geo-panel rounded-2xl border border-geo-border hover:border-geo-primary/30 transition-colors">
                  <p className="font-bold text-geo-primary mb-1">"¿Ima p'unchawmi huñunakuy kanqa?"</p>
                  <p className="text-xs text-geo-muted italic">¿Qué día será la reunión?</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAssistantHelp(false)}
                className="w-full mt-8 py-4 bg-geo-text text-geo-bg rounded-2xl font-sans font-black uppercase tracking-widest text-xs hover:bg-geo-text/90 transition-all shadow-lg active:scale-95"
              >
                {t('Allinmi, yachaniña', 'Entendido, cerrar')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-geo-surface border border-geo-border rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-geo-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="size-8 text-geo-primary" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-geo-text">
                {t('¿Pagayta munankichu?', '¿Confirmar Pago?')}
              </h3>
              <p className="text-sm text-geo-muted text-center leading-relaxed font-sans mb-8">
                {t('¿Allinchu kachkan kay pagota ruranaykipaq?', '¿Está seguro de realizar este pago?')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="py-3 bg-geo-panel border border-geo-border text-geo-muted rounded-2xl font-sans font-bold uppercase text-[10px] tracking-widest hover:bg-geo-surface transition-all"
                >
                  {t('Manan', 'Cancelar')}
                </button>
                <button 
                  onClick={confirmPay}
                  className="py-3 bg-geo-primary text-white rounded-2xl font-sans font-black uppercase text-[10px] tracking-widest hover:bg-geo-primary/90 transition-all shadow-lg shadow-geo-primary/20"
                >
                  {t('Arí, pagasaq', 'Sí, pagar')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance Justification Modal */}
      <AnimatePresence>
        {showJustifyModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-geo-surface border border-geo-border rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-geo-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="size-8 text-geo-accent" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-geo-text">
                {t('Justificación churay', 'Enviar Justificación')}
              </h3>
              <p className="text-xs text-geo-muted text-center leading-relaxed font-sans mb-6">
                {t('Kay punchawpaq justificaciónta qillqay:', 'Escriba el motivo de la falta para el día:')} <span className="font-bold text-geo-text">{selectedAttendanceDate}</span>
              </p>
              
              <textarea 
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                placeholder={t('Waway unqusqa karqan...', 'Mi hijo estuvo enfermo...')}
                className="w-full h-32 bg-geo-panel border border-geo-border rounded-2xl p-4 font-sans text-sm text-geo-text focus:border-geo-primary outline-none transition-all mb-6 resize-none"
              />

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleJustifySubmit}
                  disabled={!justificationText.trim()}
                  className="py-4 bg-geo-primary text-white rounded-2xl font-sans font-black uppercase text-[10px] tracking-widest hover:bg-geo-primary/90 transition-all shadow-lg shadow-geo-primary/20 disabled:opacity-50"
                >
                  {t('Kachay Justificación', 'Enviar Justificación')}
                </button>
                <button 
                  onClick={() => setShowJustifyModal(false)}
                  className="py-3 text-geo-muted font-sans font-bold uppercase text-[9px] tracking-widest hover:text-geo-text transition-all"
                >
                  {t('Tatiy', 'Cancelar')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
