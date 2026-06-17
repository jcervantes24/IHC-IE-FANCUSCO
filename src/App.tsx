import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Mic, Square, Volume2, VolumeX, ChevronLeft, User, 
  Calendar, BookOpen, MessageCircle, BarChart3, ArrowRight, 
  GraduationCap, Info, CheckCircle, Clock 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
const STUDENT_DATA = { 
  name: "Alex Quispe Condori", 
  school: "I.E. Coronel Francisco Bolognesi", 
  nextEvent: "Reunión de Padres - 25 Abril" 
};

const MESSAGES = [
  { id: 1, date: '23 Abril', subject: 'Dirección', es: 'No hay clases mañana por desinfección del colegio.', qu: 'Manam paqarin yachaywasi kanqachu, pichanqaku chaymi.' },
  { id: 2, date: '21 Abril', subject: 'Prof. Tutor', es: 'Reunión de padres este viernes a las 4 de la tarde.', qu: 'Tayta mamakuna huñunakuy kanqa kay diviernes tawa aspiyta.' }
];

const TASKS = [
  { id: 1, subject: 'Matemáticas', es: 'Hacer páginas 12 y 13 del libro de trabajo.', qu: 'Yupay yachay rapikunata chunka iskayniyuq, chunka kimsayuqpas ruwana.', due: '25 Abril', status: 'pending' },
  { id: 2, subject: 'Ciencias', es: 'Dibujar las plantas nativas de la región del Cusco.', qu: 'Cusco yachaq yorakunata llimp`ina siqina.', due: '28 Abril', status: 'completed' }
];

const ATTENDANCE = [
  { day: 'Lunes', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Martes', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Miércoles', status: 'Tardanza', es: 'Llegó 15 minutos tarde.', qu: 'Aslla qhipatam chayamurqan.' },
  { day: 'Jueves', status: 'Asistió', es: 'Asistencia normal.', qu: 'Allin chayamurqan.' },
  { day: 'Viernes', status: 'Falta', es: 'Falta injustificada.', qu: 'Manam chayamurqanchu.' }
];
const VOICE_USAGE_DATA = [
  { name: 'Mensajes', Español: 45, Quechua: 120 },
  { name: 'Tareas', Español: 30, Quechua: 95 },
  { name: 'Asistencia', Español: 15, Quechua: 110 },
  { name: 'Perfil', Español: 20, Quechua: 40 }
];

const SUCCESS_RATE_DATA = [
  { mes: 'Marzo', tasa: 60 },
  { mes: 'Abril', tasa: 75 },
  { mes: 'Mayo', tasa: 88 },
  { mes: 'Junio', tasa: 94 }
];

type View = 'splash' | 'login' | 'home' | 'messages' | 'tasks' | 'attendance' | 'dashboard';

export default function App() {
  const [activeView, setActiveView] = useState<View>('splash');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Redirección automática de la pantalla de bienvenida al Login
  useEffect(() => {
    if (activeView === 'splash') {
      const timer = setTimeout(() => setActiveView('login'), 3500);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  const speakText = (textEs: string, textQu: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      
      if (isSpeaking && activeAudioId === id) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setActiveAudioId(null);
        return;
      }
      const phraseToSpeak = `${textEs}. En quechua se entiende como: ${textQu}`;
      const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
      utterance.lang = 'es-PE';
      utterance.rate = 0.85;  
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
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Su navegador o dispositivo no soporta la lectura automática de voz.");
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
    setIsRecording(!isRecording);
    // Simulación IHC de captura de respuesta por voz de los padres
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
      }, 4000);
    }
  };
  const colors = {
    bg: '#FDFBF7',
    text: '#3D2B1F',
    primary: '#BC4A3C',
    accent: '#708238',  
    border: '#E8E2D2',
    muted: '#8B7E66'
  };
  const AudioButton = ({ textEs, textQu, id }: { textEs: string; textQu: string; id: string }) => {
    const isActive = isSpeaking && activeAudioId === id;
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); speakText(textEs, textQu, id); }}
        className="btn p-3 rounded-circle border shadow-sm transition"
        style={{ 
          backgroundColor: isActive ? colors.primary : '#FFFFFF',
          color: isActive ? '#FFFFFF' : colors.primary,
          borderColor: colors.border,
          width: '54px',
          height: '54px'
        }}
        title="Escuchar audio bilingüe"
      >
        {isActive ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-start" style={{ backgroundColor: colors.bg, color: colors.text, fontFamily: 'sans-serif' }}>
      
      {/* 1. VIEW: SPLASH SCREEN / BIENVENIDA */}
      {activeView === 'splash' && (
        <div className="container text-center my-auto px-4 animated fade-in">
          <div className="p-4 rounded-circle bg-white shadow-sm d-inline-block mb-4 border" style={{ borderColor: colors.border }}>
            <GraduationCap size={70} style={{ color: colors.primary }} />
          </div>
          <h1 className="fw-bold display-5 mb-2" style={{ color: colors.text }}>Allillanchu / Bienvenidos</h1>
          <p className="fs-5 mb-4" style={{ color: colors.muted }}>Intranet Inclusiva I.E. Coronel Francisco Bolognesi</p>
          <div className="spinner-border text-center" style={{ color: colors.primary }} role="status">
            <span className="visually-hidden">Cargando interfaz bilingüe...</span>
          </div>
        </div>
      )}

      {/* 2. VIEW: LOGIN VISUAL ADAPTADO */}
      {activeView === 'login' && (
        <div className="container my-auto px-4" style={{ maxWidth: '450px' }}>
          <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
            <div className="text-center mb-4">
              <GraduationCap size={48} style={{ color: colors.primary }} />
              <h2 className="fw-bold mt-2 h3">Yaykuy / Ingresar</h2>
              <p className="small" style={{ color: colors.muted }}>Seleccione su perfil para comenzar a escuchar</p>
            </div>
            
            <div className="d-grid gap-3">
              <button 
                onClick={() => setActiveView('home')}
                className="btn p-3 text-start d-flex align-items-center justify-content-between rounded-3 border bg-light transition hover-shadow"
                style={{ color: colors.text }}
              >
                <div className="d-flex align-items-center">
                  <div className="p-2 rounded bg-white text-dark me-3 border"><User size={24} style={{ color: colors.accent }} /></div>
                  <div>
                    <strong className="d-block">Alex Quispe Condori</strong>
                    <span className="small text-muted">Intranet del Estudiante / Alumno</span>
                  </div>
                </div>
                <ArrowRight size={20} style={{ color: colors.primary }} />
              </button>

              <button 
                onClick={() => setActiveView('home')}
                className="btn p-3 text-start d-flex align-items-center justify-content-between rounded-3 border bg-light transition hover-shadow"
                style={{ color: colors.text }}
              >
                <div className="d-flex align-items-center">
                  <div className="p-2 rounded bg-white text-dark me-3 border"><User size={24} style={{ color: colors.primary }} /></div>
                  <div>
                    <strong className="d-block">Tayta Mama / Apoderado</strong>
                    <span className="small text-muted">Acceso asistido para Padres</span>
                  </div>
                </div>
                <ArrowRight size={20} style={{ color: colors.primary }} />
              </button>
            </div>

            <div className="mt-4 p-3 rounded bg-light border d-flex align-items-start" style={{ borderColor: colors.border }}>
              <Info size={20} className="me-2 shrink-0 mt-1" style={{ color: colors.accent }} />
              <p className="small m-0" style={{ color: colors.muted }}>
                Esta plataforma convierte textos escolares a voz en español y locuciones adaptadas en quechua de manera inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ESTRUCTURA PRINCIPAL DE LA INTRANET (Vistas Home y Módulos) */}
      {activeView !== 'splash' && activeView !== 'login' && (
        <div className="w-100 d-flex flex-column" style={{ maxWidth: '600px', minHeight: '100vh' }}>
          
          {/* HEADER RESPONSIVO GENERAL */}
          <header className="p-3 bg-white border-bottom sticky-top d-flex align-items-center justify-content-between" style={{ borderColor: colors.border }}>
            {activeView === 'home' ? (
              <div className="d-flex align-items-center">
                <div className="p-2 bg-light rounded-circle me-2 border"><GraduationCap size={24} style={{ color: colors.primary }} /></div>
                <div>
                  <h6 className="m-0 fw-bold">{STUDENT_DATA.name}</h6>
                  <span className="small text-muted" style={{ fontSize: '12px' }}>{STUDENT_DATA.school}</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { stopSpeaking(); setActiveView('home'); }} 
                className="btn border-0 p-1 d-flex align-items-center text-decoration-none"
                style={{ color: colors.primary }}
              >
                <ChevronLeft size={24} className="me-1" />
                <span>Kutiy / Volver</span>
              </button>
            )}

            {/* Acceso Directo al Dashboard Académico del Profesor/Colegio */}
            <button 
              onClick={() => { stopSpeaking(); setActiveView(activeView === 'dashboard' ? 'home' : 'dashboard'); }}
              className="btn btn-sm d-flex align-items-center border px-2 py-1 rounded"
              style={{ backgroundColor: activeView === 'dashboard' ? colors.primary : '#FFFFFF', color: activeView === 'dashboard' ? '#FFFFFF' : colors.text, borderColor: colors.border }}
            >
              <BarChart3 size={18} className="me-1" />
              <span className="small fw-semibold">Dashboard</span>
            </button>
          </header>

          {/* CONTENIDO DINÁMICO SEGÚN LA VISTA ACTIVA */}
          <main className="flex-grow-1 p-3 container">
            
            {/* 3. VIEW: HOME (MENÚ DE ICONOS GRANDES - SEMANA 13) */}
            {activeView === 'home' && (
              <div className="animated fade-in">
                {/* Banner de Próximo Evento Auditivo */}
                <div className="card border-0 rounded-4 p-3 mb-4 shadow-sm bg-white border" style={{ borderLeft: `5px solid ${colors.accent}`, borderColor: colors.border }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <Calendar size={28} className="me-3" style={{ color: colors.accent }} />
                      <div>
                        <span className="text-muted d-block small fw-bold">Willaquy / Próximo Evento</span>
                        <strong style={{ color: colors.text }}>{STUDENT_DATA.nextEvent}</strong>
                      </div>
                    </div>
                    <AudioButton textEs={`Próximo evento obligatorio: ${STUDENT_DATA.nextEvent}`} textQu="Tayta mamakuna huñunakuy tawa aspiyta chayamunqa." id="next-event-audio" />
                  </div>
                </div>

                <h5 className="fw-bold mb-3 px-1" style={{ color: colors.text }}>Akllay / Seleccione una Sección:</h5>
                
                {/* Grid Responsivo de Bootstrap 5 para los Botones del Menú */}
                <div className="row g-3">
                  <div className="col-6">
                    <div onClick={() => setActiveView('messages')} className="card text-center p-3 h-100 rounded-4 shadow-sm bg-white border transition cursor-pointer hover-card">
                      <div className="mx-auto p-3 bg-light rounded-circle mb-2" style={{ color: colors.primary }}><MessageCircle size={32} /></div>
                      <span className="fw-bold d-block">Willakuykuna</span>
                      <small className="text-muted">Mensajes</small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div onClick={() => setActiveView('tasks')} className="card text-center p-3 h-100 rounded-4 shadow-sm bg-white border transition cursor-pointer hover-card">
                      <div className="mx-auto p-3 bg-light rounded-circle mb-2" style={{ color: colors.accent }}><BookOpen size={32} /></div>
                      <span className="fw-bold d-block">Ruwanakuna</span>
                      <small className="text-muted">Tareas</small>
                    </div>
                  </div>

                  <div className="col-12">
                    <div onClick={() => setActiveView('attendance')} className="card p-3 rounded-4 shadow-sm bg-white border transition cursor-pointer hover-card d-flex flex-row align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div className="p-3 bg-light rounded-circle me-3" style={{ color: '#D99B43' }}><Calendar size={32} /></div>
                        <div className="text-start">
                          <span className="fw-bold d-block">Yachaywasi Chayamuy</span>
                          <small className="text-muted">Asistencia Diaria Escolar</small>
                        </div>
                      </div>
                      <ArrowRight size={24} style={{ color: colors.muted }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VIEW: WILLAKUYKUNA / MENSAJES INSTITUCIONALES */}
            {activeView === 'messages' && (
              <div className="animated fade-in">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="fw-bold m-0">Willakuykuna / Mensajes</h4>
                  <AudioButton textEs="Sección de Mensajes de la dirección y profesores." textQu="Kaypi kachkan llapan yachaywasimanta willakuykuna." id="view-messages-hdr" />
                </div>

                <div className="d-flex flex-column gap-3">
                  {MESSAGES.map((msg) => (
                    <div key={msg.id} className="card p-3 rounded-4 bg-white border shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom text-muted small">
                        <span>{msg.subject}</span>
                        <span>{msg.date}</span>
                      </div>
                      <div className="d-flex align-items-start gap-3">
                        <div className="flex-grow-1">
                          <p className="fw-bold mb-1 fs-6">{msg.es}</p>
                          <p className="m-0 text-muted italic" style={{ fontSize: '14px', color: colors.muted }}>{msg.qu}</p>
                        </div>
                        <AudioButton textEs={msg.es} textQu={msg.qu} id={`msg-${msg.id}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. VIEW: RUWANAKUNA / GESTIÓN DE TAREAS ESCOLARES */}
            {activeView === 'tasks' && (
              <div className="animated fade-in">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="fw-bold m-0">Ruwanakuna / Tareas</h4>
                  <AudioButton textEs="Sección de deberes y tareas del alumno." textQu="Kaypi kachkan wawaykipa yachay wasimanta ruwanankuna." id="view-tasks-hdr" />
                </div>

                <div className="d-flex flex-column gap-3">
                  {TASKS.map((task) => (
                    <div key={task.id} className="card p-3 rounded-4 bg-white border shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge px-3 py-2 rounded-pill bg-light text-dark border">{task.subject}</span>
                        <span className="small text-muted d-flex align-items-center">
                          <Clock size={14} className="me-1" /> Vence: {task.due}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <div className="flex-grow-1">
                          <p className="fw-bold mb-1 fs-6">{task.es}</p>
                          <p className="m-0 text-muted" style={{ fontSize: '14px' }}>{task.qu}</p>
                        </div>
                        <AudioButton textEs={task.es} textQu={task.qu} id={`task-${task.id}`} />
                      </div>

                      <div className="p-2 rounded bg-light border d-flex align-items-center justify-content-between">
                        <span className="small text-muted">Estado del cumplimiento:</span>
                        {task.status === 'completed' ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><CheckCircle size={14} className="me-1" /> Entregado</span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1"><Clock size={14} className="me-1" /> Pendiente</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. VIEW: ASISTENCIA DIARIA */}
            {activeView === 'attendance' && (
              <div className="animated fade-in">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="fw-bold m-0">Chayamuy / Asistencia</h4>
                  <AudioButton textEs="Registro de asistencia de la semana en curso." textQu="Kaypi qhawariy wawaykipa sapa p`unchay chayamusqanta." id="view-attendance-hdr" />
                </div>

                <div className="card p-3 rounded-4 bg-white border shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle m-0">
                      <thead>
                        <tr className="border-bottom text-muted small">
                          <th>P'unchay / Día</th>
                          <th>Estado</th>
                          <th className="text-end">Audio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ATTENDANCE.map((att, idx) => (
                          <tr key={idx} className="border-bottom-subtle">
                            <td><strong className="d-block">{att.day}</strong></td>
                            <td>
                              <span className={`badge px-2 py-1 ${
                                att.status === 'Asistió' ? 'bg-success-subtle text-success' :
                                att.status === 'Tardanza' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'
                              }`}>
                                {att.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <button 
                                onClick={() => speakText(`El día ${att.day} el alumno registra: ${att.es}`, att.qu, `att-${idx}`)}
                                className="btn btn-light btn-sm p-2 rounded-circle border"
                              >
                                <Volume2 size={16} style={{ color: colors.primary }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 7. VIEW: DASHBOARD DE MÉTRICAS E IMPACTO SOCIAL (Semana 12) */}
            {activeView === 'dashboard' && (
              <div className="animated fade-in pb-4">
                <div className="p-3 bg-white rounded-4 border shadow-sm mb-4">
                  <h4 className="fw-bold m-0 h5 text-center" style={{ color: colors.primary }}>
                    Panel Analítico Escolar - Accesibilidad ODS 10
                  </h4>
                  <p className="small text-muted text-center m-0">
                    Métricas en tiempo real de Interacción Humano-Computador para familias quechuahablantes.
                  </p>
                </div>

                {/* Tarjetas KPI del Dashboard en Rejilla de Bootstrap */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="card p-3 border-0 bg-white shadow-sm rounded-4 border">
                      <span className="small text-muted d-block text-truncate">Inclusión Lingüística</span>
                      <h3 className="fw-bold my-1 text-success">+92%</h3>
                      <small className="text-muted">Padres activos por audio</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card p-3 border-0 bg-white shadow-sm rounded-4 border">
                      <span className="small text-muted d-block text-truncate">Reducción Brecha</span>
                      <h3 className="fw-bold my-1 text-primary">4.2x</h3>
                      <small className="text-muted">Más respuestas al colegio</small>
                    </div>
                  </div>
                </div>

                {/* Gráfico 1: Uso de Audio Recharts (Semana 12) */}
                <div className="card p-3 border-0 bg-white shadow-sm rounded-4 border mb-4">
                  <h6 className="fw-bold mb-2">Ayuda por Voz por Sección (Interacciones)</h6>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={VOICE_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12, marginTop: 5 }} />
                        <Bar dataKey="Español" fill="#BC4A3C" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Quechua" fill="#708238" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <small className="text-muted mt-2 block text-center" style={{ fontSize: '11px' }}>
                    * El gráfico demuestra que el soporte auditivo en quechua registra el triple de demanda visual en zonas rurales.
                  </small>
                </div>

                {/* Gráfico 2: Evolución de Éxito Académico */}
                <div className="card p-3 border-0 bg-white shadow-sm rounded-4 border">
                  <h6 className="fw-bold mb-2">Tasa de Éxito en Entrega de Deberes (%)</h6>
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <AreaChart data={SUCCESS_RATE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="tasa" name="Tasa de Éxito" stroke="#708238" fill="#e2ebd5" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="small text-muted m-0 mt-2" style={{ fontSize: '11px' }}>
                    Métrica IHC: Incremento exponencial del cumplimiento escolar desde el lanzamiento del módulo de síntesis de voz en el Cusco.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* MENÚ DE ACCESIBILIDAD FIJO INFERIOR (MICRÓFONO ADAPTADO - SEMANA 11) */}
          {activeView !== 'dashboard' && (
            <footer className="bg-white border-top p-3 sticky-bottom text-center d-flex align-items-center justify-content-center gap-3" style={{ borderColor: colors.border }}>
              <div className="d-flex align-items-center bg-light px-3 py-2 rounded-pill border" style={{ maxWidth: '400px', width: '100%' }}>
                <button 
                  onClick={toggleRecording}
                  className={`btn rounded-circle d-flex align-items-center justify-content-center p-3 border shadow-sm transition ${isRecording ? 'bg-danger text-white border-danger animate-pulse' : 'bg-white'}`}
                  style={{ width: '56px', height: '56px', color: isRecording ? '#FFFFFF' : colors.accent }}
                >
                  {isRecording ? <Square size={24} /> : <Mic size={24} />}
                </button>
                <div className="text-start ms-3 flex-grow-1" style={{ lineHeight: '1.2' }}>
                  <strong className="small d-block text-dark">
                    {isRecording ? 'Uyarichkanchik... / Grabando' : 'Rimayta Atinki / Enviar Voz'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '11px' }}>
                    {isRecording ? 'Hable ahora para responder...' : 'Presione para hablar en quechua o español'}
                  </span>
                </div>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
