import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Volume2, VolumeX, ChevronLeft, User, 
  Calendar, BookOpen, MessageCircle, BarChart3, ArrowRight, 
  GraduationCap, Info, CheckCircle, Clock 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// Modelos de datos del sistema
const STUDENT_DATA = { 
  name: "Alex Quispe Condori", 
  school: "I.E. Coronel Francisco Bolognesi", 
  nextEvent: "Reunión de Padres - 25 Abril" 
};

const MESSAGES = [
  { id: 1, date: '23 Env.', subject: 'Dirección', es: 'No hay clases mañana por desinfección del colegio.', qu: 'Manam paqarin yachaywasi kanqachu, pichanqaku chaymi.' },
  { id: 2, date: '21 Env.', subject: 'Prof. Tutor', es: 'Reunión de padres este viernes a las 4 de la tarde.', qu: 'Tayta mamakuna huñunakuy kanqa kay diviernes tawa aspiyta.' }
];

const TASKS = [
  { id: 1, subject: 'Matemáticas', es: 'Hacer páginas 12 y 13 del libro de trabajo.', qu: 'Yupay yachay rapikunata chunka iskayniyuq, chunka kimsayuqpas ruwana.', due: '25 Abr', status: 'pending' },
  { id: 2, subject: 'Ciencias', es: 'Dibujar las plantas nativas de la región del Cusco.', qu: 'Cusco yachaq yorakunata llimp`ina siqina.', due: '28 Abr', status: 'completed' }
];

const ATTENDANCE = [
  { day: 'Lunes', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Martes', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Miércoles', status: 'Tardanza', es: 'Llegó 15 minutos tarde.', qu: 'Aslla qhipatam chayamurqan.' },
  { day: 'Jueves', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Viernes', status: 'Falta', es: 'Falta injustificada.', qu: 'Manam chayamurqanchu.' }
];

// Datos del Dashboard de Inclusión (Semana 12)
const METRICS_VOICE = [
  { name: 'Mensajes', Español: 40, Quechua: 115 },
  { name: 'Tareas', Español: 35, Quechua: 98 },
  { name: 'Asistencia', Español: 12, Quechua: 104 }
];

const METRICS_PROGRESS = [
  { name: 'Mar', porcentaje: 65 },
  { name: 'Abr', porcentaje: 78 },
  { name: 'May', porcentaje: 89 },
  { name: 'Jun', porcentaje: 95 }
];

type View = 'splash' | 'login' | 'home' | 'messages' | 'tasks' | 'attendance' | 'dashboard';

export default function App() {
  const [activeView, setActiveView] = useState<View>('splash');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  // Efecto para la pantalla de carga inicial
  useEffect(() => {
    if (activeView === 'splash') {
      const timer = setTimeout(() => setActiveView('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  // Manejo de la Web Speech API nativa del navegador
  const speakText = (textEs: string, textQu: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      if (isSpeaking && activeAudioId === id) {
        setIsSpeaking(false);
        setActiveAudioId(null);
        return;
      }

      const speechText = `${textEs}. En quechua: ${textQu}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'es-PE';
      utterance.rate = 0.9;

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

  // Simulación inteligente de envío y procesamiento de mensajes de voz de los padres
  const toggleRecording = () => {
    stopSpeaking();
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        alert("Mensaje enviado con éxito a la dirección del colegio.");
      }, 3500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#FDFBF7] text-[#3D2B1F]">
      
      {/* VISTA: PANTALLA DE BIENVENIDA (SPLASH) */}
      {activeView === 'splash' && (
        <div className="flex flex-col items-center justify-center my-auto px-4 text-center">
          <div className="p-4 rounded-full bg-white shadow-sm border border-[#E8E2D2] mb-4">
            <GraduationCap size={64} className="text-[#BC4A3C]" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Allillanchu</h1>
          <p className="text-[#8B7E66] mb-4">I.E. Coronel Francisco Bolognesi</p>
          <div className="w-8 h-8 border-4 border-[#BC4A3C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* VISTA: LOGIN DE ACCESIBILIDAD */}
      {activeView === 'login' && (
        <div className="w-full max-w-md my-auto px-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E2D2]">
            <div className="text-center mb-6">
              <GraduationCap size={44} className="text-[#BC4A3C] mx-auto" />
              <h2 className="text-2xl font-bold mt-2">Yaykuy / Ingresar</h2>
              <p className="text-sm text-[#8B7E66]">Seleccione un perfil de acceso bilingüe</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setActiveView('home')} className="flex items-center justify-between p-4 rounded-xl border border-[#E8E2D2] bg-[#FDFBF7] text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-[#E8E2D2] text-[#708238]"><User size={20} /></div>
                  <div>
                    <strong className="block text-sm">Alex Quispe Condori</strong>
                    <span className="text-xs text-[#8B7E66]">Intranet Estudiante</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-[#BC4A3C]" />
              </button>

              <button onClick={() => setActiveView('home')} className="flex items-center justify-between p-4 rounded-xl border border-[#E8E2D2] bg-[#FDFBF7] text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-[#E8E2D2] text-[#BC4A3C]"><User size={20} /></div>
                  <div>
                    <strong className="block text-sm">Tayta Mama / Apoderado</strong>
                    <span className="text-xs text-[#8B7E66]">Acceso Asistido para Padres</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-[#BC4A3C]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR DE LA INTRANET ACTIVA */}
      {activeView !== 'splash' && activeView !== 'login' && (
        <div className="w-full max-w-md min-h-screen flex flex-col bg-[#FDFBF7] shadow-lg border-x border-[#E8E2D2]">
          
          {/* HEADER DEL SISTEMA */}
          <header className="p-4 bg-white border-bottom sticky top-0 flex items-center justify-between border-b border-[#E8E2D2] z-10">
            {activeView === 'home' ? (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FDFBF7] rounded-full border border-[#E8E2D2] text-[#BC4A3C]"><GraduationCap size={20} /></div>
                <div>
                  <h6 className="m-0 font-bold text-sm">{STUDENT_DATA.name}</h6>
                  <span className="text-xs text-[#8B7E66] block">{STUDENT_DATA.school}</span>
                </div>
              </div>
            ) : (
              <button onClick={() => { stopSpeaking(); setActiveView('home'); }} className="flex items-center text-sm font-semibold text-[#BC4A3C] bg-transparent border-0 cursor-pointer">
                <ChevronLeft size={20} className="mr-1" />
                <span>Kutiy / Volver</span>
              </button>
            )}

            <button 
              onClick={() => { stopSpeaking(); setActiveView(activeView === 'dashboard' ? 'home' : 'dashboard'); }}
              className="flex items-center gap-1 text-xs font-bold border px-2 py-1.5 rounded-lg transition-colors"
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

          {/* CUERPO PRINCIPAL DINÁMICO */}
          <main className="flex-1 p-4">
            
            {/* PANALES PRINCIPALES (HOME) */}
            {activeView === 'home' && (
              <div className="flex flex-col gap-4">
                {/* Banner de Recordatorios Auditivos */}
                <div className="bg-white p-4 rounded-xl border border-[#E8E2D2] flex items-center justify-between border-l-4 border-l-[#708238]">
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="text-[#708238]" />
                    <div>
                      <span className="text-xs text-[#8B7E66] block font-bold">Willaquy / Evento</span>
                      <strong className="text-sm">{STUDENT_DATA.nextEvent}</strong>
                    </div>
                  </div>
                  <button onClick={() => speakText(`Próximo evento institucional: ${STUDENT_DATA.nextEvent}`, "Tayta mamakuna yachaywasipi huñunakuy kanqa.", "next-evt")} className="p-2.5 rounded-full border bg-white text-[#BC4A3C] border-[#E8E2D2]"><Volume2 size={20} /></button>
                </div>

                <h3 className="text-base font-bold text-[#3D2B1F] mt-2">Secciones Disponibles:</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div onClick={() => setActiveView('messages')} className="bg-white p-4 rounded-xl border border-[#E8E2D2] text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <MessageCircle size={28} className="text-[#BC4A3C] mx-auto mb-2" />
                    <span className="font-bold block text-sm">Willakuykuna</span>
                    <small className="text-xs text-[#8B7E66]">Mensajes</small>
                  </div>

                  <div onClick={() => setActiveView('tasks')} className="bg-white p-4 rounded-xl border border-[#E8E2D2] text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <BookOpen size={28} className="text-[#708238] mx-auto mb-2" />
                    <span className="font-bold block text-sm">Ruwanakuna</span>
                    <small className="text-xs text-[#8B7E66]">Tareas</small>
                  </div>
                </div>

                <div onClick={() => setActiveView('attendance')} className="bg-white p-4 rounded-xl border border-[#E8E2D2] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors mt-1">
                  <div className="flex items-center gap-3">
                    <Calendar size={28} className="text-amber-600" />
                    <div>
                      <span className="font-bold block text-sm">Yachaywasi Chayamuy</span>
                      <small className="text-xs text-[#8B7E66]">Control de Asistencia</small>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-[#8B7E66]" />
                </div>
              </div>
            )}

            {/* VISTA: MENSAJES */}
            {activeView === 'messages' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-bold">Willakuykuna / Mensajes</h4>
                {MESSAGES.map((msg) => (
                  <div key={msg.id} className="bg-white p-4 rounded-xl border border-[#E8E2D2] flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-[#8B7E66] mb-1 font-semibold">
                        <span>{msg.subject}</span>
                        <span>{msg.date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{msg.es}</p>
                      <p className="text-xs text-[#8B7E66] italic">{msg.qu}</p>
                    </div>
                    <button onClick={() => speakText(msg.es, msg.qu, `msg-${msg.id}`)} className="p-2 rounded-full border bg-[#FDFBF7] text-[#BC4A3C] border-[#E8E2D2] mt-4"><Volume2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA: TAREAS */}
            {activeView === 'tasks' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-bold">Ruwanakuna / Tareas</h4>
                {TASKS.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-xl border border-[#E8E2D2] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded border">{task.subject}</span>
                      <span className="text-xs text-[#8B7E66] flex items-center gap-1"><Clock size={12} /> {task.due}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-950 mb-0.5">{task.es}</p>
                        <p className="text-xs text-[#8B7E66]">{task.qu}</p>
                      </div>
                      <button onClick={() => speakText(task.es, task.qu, `tsk-${task.id}`)} className="p-2 rounded-full border bg-[#FDFBF7] text-[#BC4A3C] border-[#E8E2D2]"><Volume2 size={18} /></button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-[#8B7E66]">Estado:</span>
                      {task.status === 'completed' ? (
                        <span className="text-[#708238] font-bold flex items-center gap-1"><CheckCircle size={14} /> Entregado</span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center gap-1"><Clock size={14} /> Pendiente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA: ASISTENCIA */}
            {activeView === 'attendance' && (
              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-bold">Chayamuy / Asistencia</h4>
                <div className="bg-white rounded-xl border border-[#E8E2D2] p-3">
                  <div className="flex flex-col">
                    {ATTENDANCE.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                        <div>
                          <strong className="text-sm block">{att.day}</strong>
                          <span className="text-xs text-[#8B7E66]">{att.es}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            att.status === 'Asistió' ? 'bg-green-50 text-green-700 border border-green-200' :
                            att.status === 'Tardanza' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>{att.status}</span>
                          <button onClick={() => speakText(`Día ${att.day}: ${att.es}`, att.qu, `att-${idx}`)} className="p-1.5 rounded-full bg-gray-50 border border-gray-200 text-[#BC4A3C]"><Volume2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VISTA: DASHBOARD DOCENTE ODS 10 (Semana 12) */}
            {activeView === 'dashboard' && (
              <div className="flex flex-col gap-4 pb-6">
                <div className="bg-white p-3 rounded-xl border border-[#E8E2D2] text-center">
                  <h4 className="text-sm font-bold text-[#BC4A3C] m-0">Inclusión Digital Educativa (ODS 10)</h4>
                  <p className="text-xs text-[#8B7E66] m-0 mt-0.5">Métricas de interacción del módulo de voz bilingüe</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-[#E8E2D2]">
                    <span className="text-xs text-[#8B7E66] block">Uso del Quechua</span>
                    <strong className="text-xl text-[#708238] block mt-1">+84%</strong>
                    <span className="text-[10px] text-gray-400">Preferido por apoderados</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#E8E2D2]">
                    <span className="text-xs text-[#8B7E66] block">Cumplimiento</span>
                    <strong className="text-xl text-[#BC4A3C] block mt-1">92%</strong>
                    <span className="text-[10px] text-gray-400">Tareas entregadas a tiempo</span>
                  </div>
                </div>

                {/* Gráfico 1: Barras Recharts */}
                <div className="bg-white p-3 rounded-xl border border-[#E8E2D2]">
                  <h5 className="text-xs font-bold mb-3 text-gray-700">Demanda de Audio por Sección</h5>
                  <div className="w-full h-48">
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

                {/* Gráfico 2: Área Recharts */}
                <div className="bg-white p-3 rounded-xl border border-[#E8E2D2]">
                  <h5 className="text-xs font-bold mb-2 text-gray-700">Evolución de Tasa de Éxito Escolar</h5>
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={METRICS_PROGRESS} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="porcentaje" name="Éxito %" stroke="#708238" fill="#F0F4EC" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* MENÚ DE ACCESIBILIDAD INFERIOR (MICRÓFONO FIJO) */}
          {activeView !== 'dashboard' && (
            <footer className="bg-white border-t border-[#E8E2D2] p-3 sticky bottom-0 flex justify-center z-10">
              <div className="flex items-center bg-[#FDFBF7] px-3 py-1.5 rounded-full border border-[#E8E2D2] w-full max-w-xs shadow-sm">
                <button 
                  onClick={toggleRecording} 
                  className={`p-3 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    isRecording ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-white text-[#708238] border-[#E8E2D2]'
                  }`}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <div className="ml-3 text-left">
                  <strong className="text-xs block text-gray-900">{isRecording ? 'Grabando audio...' : 'Rimayta Atinki / Grabar Voz'}</strong>
                  <span className="text-[11px] text-[#8B7E66] block">{isRecording ? 'Suelte el botón para enviar' : 'Responda comunicados por aquí'}</span>
                </div>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
