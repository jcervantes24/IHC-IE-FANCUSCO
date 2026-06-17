import React, { useState, useEffect } from 'react';
import { 
  Mic, Square, Volume2, VolumeX, ChevronLeft, User, 
  Calendar, BookOpen, MessageCircle, BarChart3, ArrowRight, 
  GraduationCap, Info, CheckCircle, Clock 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// Datos fijos de la intranet escolar
const STUDENT_DATA = { 
  name: "Alex Quispe Condori", 
  school: "I.E. Coronel Francisco Bolognesi", 
  nextEvent: "Reunión de Padres - 25 Abril" 
};

const MESSAGES = [
  { id: 1, date: '23 Abr.', subject: 'Dirección', es: 'No hay clases mañana por desinfección del colegio.', qu: 'Manam paqarin yachaywasi kanqachu, pichanqaku chaymi.' },
  { id: 2, date: '21 Abr.', subject: 'Prof. Tutor', es: 'Reunión de padres este viernes a las 4 de la tarde.', qu: 'Tayta mamakuna huñunakuy kanqa kay diviernes tawa aspiyta.' }
];

const TASKS = [
  { id: 1, subject: 'Matemáticas', es: 'Hacer páginas 12 y 13 del libro de trabajo.', qu: 'Yupay yachay rapikunata chunka iskayniyuq, chunka kimsayuqpas ruwana.', due: '25 Abr.', status: 'pending' },
  { id: 2, subject: 'Ciencias', es: 'Dibujar las plantas nativas de la región del Cusco.', qu: 'Cusco yachaq yorakunata llimp`ina siqina.', due: '28 Abr.', status: 'completed' }
];

const ATTENDANCE = [
  { day: 'Lunes', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Martes', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Miércoles', status: 'Tardanza', es: 'Llegó 15 minutos tarde.', qu: 'Aslla qhipatam chayamurqan.' },
  { day: 'Jueves', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Viernes', status: 'Falta', es: 'Falta injustificada.', qu: 'Manam chayamurqanchu.' }
];

// Analíticas de usabilidad del ODS 10 (Semana 12)
const METRICS_VOICE = [
  { name: 'Mensajes', Español: 38, Quechua: 122 },
  { name: 'Tareas', Español: 29, Quechua: 94 },
  { name: 'Asistencia', Español: 14, Quechua: 108 }
];

const METRICS_PROGRESS = [
  { name: 'Mar', porcentaje: 62 },
  { name: 'Abr', porcentaje: 76 },
  { name: 'May', porcentaje: 88 },
  { name: 'Jun', porcentaje: 95 }
];

type View = 'splash' | 'login' | 'home' | 'messages' | 'tasks' | 'attendance' | 'dashboard';

export default function App() {
  const [activeView, setActiveView] = useState<View>('splash');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  useEffect(() => {
    if (activeView === 'splash') {
      const timer = setTimeout(() => setActiveView('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  // Manejo de la locución bilingüe nativa (Semana 11)
  const speakText = (textEs: string, textQu: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      if (isSpeaking && activeAudioId === id) {
        setIsSpeaking(false);
        setActiveAudioId(null);
        return;
      }

      const compositeText = `${textEs}. En quechua se entiende como: ${textQu}`;
      const utterance = new SpeechSynthesisUtterance(compositeText);
      utterance.lang = 'es-PE';
      utterance.rate = 0.88;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setActiveAudioId(id);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveAudioId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveAudioId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveAudioId(null);
    }
  };

  const toggleRecording = () => {
    stopSpeaking();
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        alert("Mensaje de voz enviado de forma segura al colegio.");
      }, 3500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-geo-bg text-geo-text">
      
      {/* VISTA: SPLASH COMPONENT */}
      {activeView === 'splash' && (
        <div className="flex flex-col items-center justify-center my-auto px-4 text-center">
          <div className="p-4 rounded-full bg-geo-surface shadow-sm border border-geo-border mb-4">
            <GraduationCap size={64} className="text-geo-primary" />
          </div>
          <h1 className="text-3xl font-bold font-sans mb-1">Allillanchu</h1>
          <p className="text-geo-muted mb-4">Intranet I.E. Coronel Francisco Bolognesi</p>
          <div className="w-8 h-8 border-4 border-geo-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* VISTA: LOGIN ADAPTADO ACCESIBLE */}
      {activeView === 'login' && (
        <div className="w-full max-w-md my-auto px-4">
          <div className="bg-geo-surface rounded-2xl p-6 shadow-sm border border-geo-border">
            <div className="text-center mb-6">
              <GraduationCap size={44} className="text-geo-primary mx-auto" />
              <h2 className="text-2xl font-bold mt-2">Yaykuy / Ingresar</h2>
              <p className="text-sm text-geo-muted">Asistente digital escolar bilingüe</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setActiveView('home')} className="flex items-center justify-between p-4 rounded-xl border border-geo-border bg-geo-bg text-left hover:bg-geo-panel transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-geo-surface rounded-lg border border-geo-border text-geo-accent"><User size={20} /></div>
                  <div>
                    <strong className="block text-sm">Alex Quispe Condori</strong>
                    <span className="text-xs text-geo-muted">Acceso Estudiante</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-geo-primary" />
              </button>

              <button onClick={() => setActiveView('home')} className="flex items-center justify-between p-4 rounded-xl border border-geo-border bg-geo-bg text-left hover:bg-geo-panel transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-geo-surface rounded-lg border border-geo-border text-geo-primary"><User size={20} /></div>
                  <div>
                    <strong className="block text-sm">Tayta Mama / Apoderado</strong>
                    <span className="text-xs text-geo-muted">Acceso Asistido para Padres</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-geo-primary" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR MÓVIL RESPONSIVO (Semana 13) */}
      {activeView !== 'splash' && activeView !== 'login' && (
        <div className="w-full max-w-md min-h-screen flex flex-col bg-geo-bg shadow-md border-x border-geo-border">
          
          {/* HEADER GENERAL */}
          <header className="p-4 bg-geo-surface border-b border-geo-border sticky top-0 flex items-center justify-between z-10">
            {activeView === 'home' ? (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-geo-bg rounded-full border border-geo-border text-geo-primary"><GraduationCap size={20} /></div>
                <div>
                  <h6 className="m-0 font-bold text-sm">{STUDENT_DATA.name}</h6>
                  <span className="text-xs text-geo-muted block">{STUDENT_DATA.school}</span>
                </div>
              </div>
            ) : (
              <button onClick={() => { stopSpeaking(); setActiveView('home'); }} className="flex items-center text-sm font-semibold text-geo-primary bg-transparent border-0 cursor-pointer">
                <ChevronLeft size={20} className="mr-1" />
                <span>Kutiy / Volver</span>
              </button>
            )}

            <button 
              onClick={() => { stopSpeaking(); setActiveView(activeView === 'dashboard' ? 'home' : 'dashboard'); }}
              className="flex items-center gap-1 text-xs font-bold border px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ 
                backgroundColor: activeView === 'dashboard' ? '#BC4A3C' : '#FFFFFF', 
                color: activeView === 'dashboard' ? '#FFFFFF' : '#3D2B1F',
                borderColor: '#E8E2D2'
              }}
            >
              <BarChart3 size={16} />
              <span>Métricas</span>
            </button>
          </header>

          {/* CUERPO DINÁMICO */}
          <main className="flex-1 p-4">
            
            {/* INTRANET GENERAL (HOME) */}
            {activeView === 'home' && (
              <div className="flex flex-col gap-4">
                <div className="bg-geo-surface p-4 rounded-xl border border-geo-border flex items-center justify-between border-l-4 border-l-geo-accent">
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="text-geo-accent" />
                    <div>
                      <span className="text-xs text-geo-muted block font-bold">Willaquy / Evento</span>
                      <strong className="text-sm">{STUDENT_DATA.nextEvent}</strong>
                    </div>
                  </div>
                  <button onClick={() => speakText(`Próximo evento escolar: ${STUDENT_DATA.nextEvent}`, "Tayta mamakuna yachaywasipi huñunakuy kanqa.", "banner-audio")} className="p-2 rounded-full border bg-geo-bg text-geo-primary border-geo-border cursor-pointer"><Volume2 size={18} /></button>
                </div>

                <h3 className="text-sm font-bold text-geo-text mt-2">Secciones:</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div onClick={() => setActiveView('messages')} className="bg-geo-surface p-4 rounded-xl border border-geo-border text-center cursor-pointer hover:bg-geo-panel transition-colors">
                    <MessageCircle size={28} className="text-geo-primary mx-auto mb-2" />
                    <span className="font-bold block text-sm">Willakuykuna</span>
                    <small className="text-xs text-geo-muted">Mensajes</small>
                  </div>

                  <div onClick={() => setActiveView('tasks')} className="bg-geo-surface p-4 rounded-xl border border-geo-border text-center cursor-pointer hover:bg-geo-panel transition-colors">
                    <BookOpen size={28} className="text-geo-accent mx-auto mb-2" />
                    <span className="font-bold block text-sm">Ruwanakuna</span>
                    <small className="text-xs text-geo-muted">Tareas</small>
                  </div>
                </div>

                <div onClick={() => setActiveView('attendance')} className="bg-geo-surface p-4 rounded-xl border border-geo-border flex items-center justify-between cursor-pointer hover:bg-geo-panel transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar size={28} className="text-amber-600" />
                    <div>
                      <span className="font-bold block text-sm">Yachaywasi Chayamuy</span>
                      <small className="text-xs text-geo-muted">Control de Asistencia</small>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-geo-muted" />
                </div>
              </div>
            )}

            {/* SECCIÓN: MENSAJES */}
            {activeView === 'messages' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-base font-bold">Willakuykuna / Mensajes</h4>
                {MESSAGES.map((msg) => (
                  <div key={msg.id} className="bg-geo-surface p-4 rounded-xl border border-geo-border flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-geo-muted mb-1 font-semibold">
                        <span>{msg.subject}</span>
                        <span>{msg.date}</span>
                      </div>
                      <p className="text-sm font-bold mb-1">{msg.es}</p>
                      <p className="text-xs text-geo-muted italic">{msg.qu}</p>
                    </div>
                    <button onClick={() => speakText(msg.es, msg.qu, `msg-${msg.id}`)} className="p-2 rounded-full border bg-geo-bg text-geo-primary border-geo-border cursor-pointer mt-4"><Volume2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* SECCIÓN: TAREAS */}
            {activeView === 'tasks' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-base font-bold">Ruwanakuna / Tareas</h4>
                {TASKS.map((task) => (
                  <div key={task.id} className="bg-geo-surface p-4 rounded-xl border border-geo-border flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold bg-geo-panel px-2 py-0.5 rounded border border-geo-border">{task.subject}</span>
                      <span className="text-xs text-geo-muted flex items-center gap-1"><Clock size={12} /> {task.due}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold mb-0.5">{task.es}</p>
                        <p className="text-xs text-geo-muted">{task.qu}</p>
                      </div>
                      <button onClick={() => speakText(task.es, task.qu, `tsk-${task.id}`)} className="p-2 rounded-full border bg-geo-bg text-geo-primary border-geo-border cursor-pointer"><Volume2 size={16} /></button>
                    </div>
                    <div className="pt-2 border-t border-geo-border flex justify-between items-center text-xs">
                      <span className="text-geo-muted">Cumplimiento:</span>
                      {task.status === 'completed' ? (
                        <span className="text-geo-accent font-bold flex items-center gap-1"><CheckCircle size={14} /> Entregado</span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center gap-1"><Clock size={14} /> Pendiente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECCIÓN: ASISTENCIA */}
            {activeView === 'attendance' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-base font-bold">Chayamuy / Asistencia</h4>
                <div className="bg-geo-surface rounded-xl border border-geo-border p-3">
                  {ATTENDANCE.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 border-b border-geo-border last:border-0">
                      <div>
                        <strong className="text-sm block">{att.day}</strong>
                        <span className="text-xs text-geo-muted">{att.es}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          att.status === 'Asistió' ? 'bg-green-50 text-green-700' :
                          att.status === 'Tardanza' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>{att.status}</span>
                        <button onClick={() => speakText(`Día ${att.day}: ${att.es}`, att.qu, `att-${idx}`)} className="p-1.5 rounded-full bg-geo-bg border border-geo-border text-geo-primary cursor-pointer"><Volume2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN: DASHBOARD DOCENTE ODS 10 (Semana 12) */}
            {activeView === 'dashboard' && (
              <div className="flex flex-col gap-4 pb-6">
                <div className="bg-geo-surface p-3 rounded-xl border border-geo-border text-center">
                  <h4 className="text-sm font-bold text-geo-primary m-0">Inclusión Digital Educativa (ODS 10)</h4>
                  <p className="text-xs text-geo-muted m-0 mt-0.5">Analíticas del soporte bilingüe de voz</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-geo-surface p-3 rounded-xl border border-geo-border">
                    <span className="text-xs text-geo-muted block">Uso del Quechua</span>
                    <strong className="text-xl text-geo-accent block mt-1">+84%</strong>
                    <span className="text-[10px] text-gray-400">Preferencia familiar</span>
                  </div>
                  <div className="bg-geo-surface p-3 rounded-xl border border-geo-border">
                    <span className="text-xs text-geo-muted block">Cumplimiento</span>
                    <strong className="text-xl text-geo-primary block mt-1">92%</strong>
                    <span className="text-[10px] text-gray-400">Tareas a tiempo</span>
                  </div>
                </div>

                <div className="bg-geo-surface p-3 rounded-xl border border-geo-border">
                  <h5 className="text-xs font-bold mb-3 text-gray-700">Demanda de Audio por Sección</h5>
                  <div className="w-full h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={METRICS_VOICE} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Español" fill="#BC4A3C" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Quechua" fill="#708238" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-geo-surface p-3 rounded-xl border border-geo-border">
                  <h5 className="text-xs font-bold mb-2 text-gray-700">Evolución del Rendimiento Escolar</h5>
                  <div className="w-full h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={METRICS_PROGRESS} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="porcentaje" stroke="#708238" fill="#F0F4EC" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* MENÚ ACCESIBLE FIJO INFERIOR */}
          {activeView !== 'dashboard' && (
            <footer className="bg-geo-surface border-t border-geo-border p-3 sticky bottom-0 flex justify-center z-10">
              <div className="flex items-center bg-geo-bg px-3 py-1.5 rounded-full border border-geo-border w-full max-w-xs shadow-sm">
                <button 
                  onClick={toggleRecording} 
                  className={`p-3 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    isRecording ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-geo-surface text-geo-accent border-geo-border'
                  }`}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <div className="ml-3 text-left">
                  <strong className="text-xs block text-gray-900">{isRecording ? 'Grabando audio...' : 'Rimayta Atinki / Enviar Voz'}</strong>
                  <span className="text-[11px] text-geo-muted block">{isRecording ? 'Procesando mensaje...' : 'Responde comunicados por voz'}</span>
                </div>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
