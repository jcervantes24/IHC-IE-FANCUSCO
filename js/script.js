
const DEFAULT_DATA = {
  student: {
    name: "Alex Quispe Condori",
    school: "I.E. Coronel Francisco Bolognesi",
    nextEvent: "Reunión de Padres - 25 Abril"
  },
  students: [
    { id: 101, name: "Alex Quispe Condori", grade: "3ro A", status: "present", tasks: "85%" },
    { id: 102, name: "Maria Mamani Ccuta", grade: "3ro A", status: "present", tasks: "100%" },
    { id: 103, name: "Luis Huaman Paucar", grade: "3ro B", status: "absent", tasks: "60%" },
    { id: 104, name: "Ana Torres Vilca", grade: "4to C", status: "present", tasks: "95%" },
    { id: 105, name: "Carlos Cusi Yupanqui", grade: "2do A", status: "present", tasks: "40%" }
  ],
  messages: [
    { id: 1, date: '23 Abril', es: 'No hay clases mañana por desinfección del colegio.', qu: 'Manam paqarin yachaywasi kanqachu, pichanqaku chaymi.', type: 'General' },
    { id: 2, date: '21 Abril', es: 'Reunión de padres este viernes a las 4pm.', qu: 'Tayta mamakuna huñunakuy kanqa kay diviernes tawa aspiyta.', type: 'Importante' }
  ],
  tasks: [
    { id: 1, subject: 'Matemáticas', es: 'Hacer páginas 12 y 13 del libro.', qu: 'Yupay yachay rapikunata 12, 13 ruwana.', due: '25 Abril' },
    { id: 2, subject: 'Comunicación', es: 'Traer un cuento corto familiar.', qu: 'Willakuyta apamuna.', due: '26 Abril' }
  ],
  attendance: [
    { date: '24 Abril', status: 'present', es: 'Asistió', qu: 'Hamurqan' },
    { date: '23 Abril', status: 'present', es: 'Asistió', qu: 'Hamurqan' },
    { date: '22 Abril', status: 'absent', es: 'Faltó', qu: 'Mana hamurqanchu' }
  ],
  weeklyAttendance: [
    { day: "Lun", present: 330, absent: 12 },
    { day: "Mar", present: 325, absent: 17 },
    { day: "Mié", present: 340, absent: 2 },
    { day: "Jue", present: 338, absent: 4 },
    { day: "Vie", present: 342, absent: 0 }
  ],
  interactionCount: 156
};

function getSchoolData() {
  let stored = localStorage.getItem("RIMAY_SCHOOL_DATA");
  if (!stored) {
    localStorage.setItem("RIMAY_SCHOOL_DATA", JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  return JSON.parse(stored);
}

function saveSchoolData(data) {
  localStorage.setItem("RIMAY_SCHOOL_DATA", JSON.stringify(data));
}

let DATA = getSchoolData();

const app = {
  lang: 'es', // 'es' o 'qu'
  currentUtterance: null,
  isSpeaking: false,
  recognition: null,
  isRecording: false,

  init: function() {
    this.renderMessages();
    this.renderAttendance();
    this.renderTasks();
    this.renderCalendar();
    this.setupSpeechRecognition();
  },

  navigate: function(viewId) {
    this.stopSpeaking();
    if(this.isRecording) this.stopRecording();

    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId + '-view').classList.add('active');
    
    // Re-render icons if needed
    if(window.feather) feather.replace();
  },

  selectLanguage: function(lang) {
    this.lang = lang;
    this.updateLanguageUI();
    this.navigate('login');

    if (lang === 'es') {
      this.speak('Has elegido español. Por favor, ingresa tu número de DNI para continuar.');
    } else {
      this.speak('Españolta akllarunki. DNI yupayniykita qillqakuy.', 'Runasimita akllarunki. DNI yupayniykita qillqakuy haykunaykipaq.');
    }
  },

  updateLanguageUI: function() {
    document.querySelectorAll('[data-es]').forEach(el => {
      el.textContent = el.getAttribute(`data-${this.lang}`);
    });
  },

  checkDniLength: function() {
    const input = document.getElementById('dni-input');
    const btn = document.getElementById('btn-login');
    input.value = input.value.replace(/\\D/g, ''); // solo numeros
    if (input.value.length >= 8) {
      btn.removeAttribute('disabled');
    } else {
      btn.setAttribute('disabled', 'true');
    }
  },

  login: function() {
    this.navigate('home');
    this.speak('Bienvenido. Aquí puedes ver cómo le va a tu hijo.', 'Allin hamusqa kachkay. Kaypi wawaykiq yachayninmanta yachanki.');
  },

  // --- TEXT TO SPEECH ---
  speak: function(textEs, textQu = null, btnElement = null) {
    if (!('speechSynthesis' in window)) return;
    
    if (this.isSpeaking) {
      this.stopSpeaking();
      return;
    }

    const textToRead = (this.lang === 'qu' && textQu) ? textQu : textEs;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = this.lang === 'es' ? 'es-PE' : 'es-ES'; // Fallback para quechua
    utterance.rate = 0.85;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (btnElement) {
        btnElement.classList.add('playing');
        btnElement.innerHTML = '<i data-feather="stop-circle" style="width:28px; height:28px;"></i>';
        if(btnElement.classList.contains('btn-play')) {
          btnElement.innerHTML = '<i data-feather="stop-circle" style="width:40px; height:40px;"></i>';
        }
        feather.replace();
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.resetAudioButtons();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.resetAudioButtons();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking: function() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.resetAudioButtons();
  },

  resetAudioButtons: function() {
    document.querySelectorAll('.btn-audio, .btn-play').forEach(btn => {
      btn.classList.remove('playing');
      if(btn.classList.contains('btn-play')) {
        btn.innerHTML = '<i data-feather="play-circle" style="width:40px; height:40px;"></i>';
      } else {
        btn.innerHTML = '<i data-feather="volume-2"></i>';
      }
    });
    feather.replace();
  },

  playSummary: function(btn) {
    this.speak('Resumen de hoy: Alex asistió a clases. Hay una reunión el 25 de abril.', 'Kunan p\'unchaw: Alexqa hamurqanmi yachaywasiman. Tayta mamakuna huñunakuy 25 p\'unchawta.', btn);
  },

  // --- RENDER LISTS ---
  renderMessages: function() {
    const container = document.getElementById('messages-list');
    container.innerHTML = DATA.messages.map(msg => `
      <div class="list-card d-flex flex-column gap-3">
        <div class="d-flex gap-3 align-items-start">
          <button class="btn-audio" onclick="app.speak('${msg.es}', '${msg.qu}', this)">
            <i data-feather="volume-2"></i>
          </button>
          <div class="flex-grow-1">
            <span class="text-terracotta fw-bold small text-uppercase tracking-wide">${msg.date}</span>
            <p class="text-brown fs-5 fw-medium mt-1 mb-0 lh-sm" data-es="${msg.es}" data-qu="${msg.qu}">${this.lang === 'es' ? msg.es : msg.qu}</p>
          </div>
        </div>
        <div class="d-flex justify-content-end border-top pt-3 mt-1">
          <button class="btn-share shadow-sm" onclick="app.shareMessage(${msg.id}, this)">
            <i data-feather="share-2" style="width: 20px; height: 20px;"></i>
            <span data-es="Compartir" data-qu="Willanakuy">${this.lang === 'es' ? 'Compartir' : 'Willanakuy'}</span>
          </button>
        </div>
      </div>
    `).join('');
  },

  shareMessage: async function(id, btn) {
    const msg = DATA.messages.find(m => m.id === id);
    const textToShare = `${msg.date} - ${this.lang === 'es' ? msg.es : msg.qu}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: this.lang === 'es' ? 'Aviso Escolar' : 'Yachaywasi Willakuy',
          text: textToShare,
        });
      } else {
        await navigator.clipboard.writeText(textToShare);
        btn.classList.add('copied');
        btn.innerHTML = `<i data-feather="check-circle" style="width: 20px; height: 20px;"></i> <span data-es="¡Copiado!" data-qu="Hap'isqa!">${this.lang === 'es' ? '¡Copiado!' : 'Hap\'isqa!'}</span>`;
        feather.replace();
        this.speak('Mensaje copiado para compartir.', 'Aviso copiasqa hukman apanaykipaq.');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = `<i data-feather="share-2" style="width: 20px; height: 20px;"></i> <span data-es="Compartir" data-qu="Willanakuy">${this.lang === 'es' ? 'Compartir' : 'Willanakuy'}</span>`;
          feather.replace();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  },

  renderAttendance: function() {
    const container = document.getElementById('attendance-list');
    container.innerHTML = DATA.attendance.map(rec => `
      <div class="list-card d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-circle ${rec.status === 'present' ? 'green-bg text-green' : 'terracotta-bg text-terracotta'}" style="width: 60px; height: 60px;">
            <i data-feather="${rec.status === 'present' ? 'check-circle' : 'alert-circle'}" style="width: 32px; height: 32px;"></i>
          </div>
          <div>
            <p class="fs-4 fw-black text-brown mb-0" data-es="${rec.es}" data-qu="${rec.qu}">${this.lang === 'es' ? rec.es : rec.qu}</p>
            <p class="fs-5 text-brown opacity-75 fw-medium mb-0">${rec.date}</p>
          </div>
        </div>
        <button class="btn-audio" onclick="app.speak('El ${rec.date}, el alumno ${rec.es}', '${rec.date} p\\'unchawta, ruraqmi ${rec.qu}', this)">
          <i data-feather="volume-2"></i>
        </button>
      </div>
    `).join('');
  },

  renderTasks: function() {
    const container = document.getElementById('tasks-list');
    container.innerHTML = DATA.tasks.map(task => `
      <div class="list-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="badge blue-bg text-blue fs-6 px-3 py-2 rounded-4">${task.subject}</span>
          <span class="fs-5 fw-bold text-terracotta"><span data-es="Para el " data-qu="Yaku ">${this.lang === 'es' ? 'Para el ' : 'Yaku '}</span>${task.due}</span>
        </div>
        <div class="d-flex gap-3 align-items-start">
          <button class="btn-audio" onclick="app.speak('${task.es}', '${task.qu}', this)">
            <i data-feather="volume-2"></i>
          </button>
          <p class="text-brown fs-4 fw-medium mt-1 mb-0 lh-sm" data-es="${task.es}" data-qu="${task.qu}">${this.lang === 'es' ? task.es : task.qu}</p>
        </div>
      </div>
    `).join('');
  },

  renderCalendar: function() {
    const grid = document.getElementById('calendar-days');
    let html = '';
    // Empty spots
    html += `<div class="cal-day"></div><div class="cal-day"></div><div class="cal-day"></div>`;
    
    for (let day = 1; day <= 30; day++) {
      const dateStr = `${day} Abril`;
      const hasMsg = DATA.messages.some(m => m.date.includes(`${day} Abril`) || m.date.includes(`0${day} Abril`));
      const hasTask = DATA.tasks.some(t => t.due.includes(`${day} Abril`) || t.due.includes(`0${day} Abril`));
      
      let classes = 'cal-day';
      if (hasMsg || hasTask) classes += ' active-day';

      let dots = '';
      if (hasMsg) dots += `<div class="dot msg"></div>`;
      if (hasTask) dots += `<div class="dot tsk"></div>`;

      html += `
        <button class="${classes}" onclick="app.selectDate(${day}, this)">
          <span class="fs-5">${day}</span>
          <div class="dot-container">${dots}</div>
        </button>
      `;
    }
    grid.innerHTML = html;
  },

  selectDate: function(day, btnElement) {
    document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
    btnElement.classList.add('selected');
    
    const dateStr = `${day} Abril`;
    const detailsContainer = document.getElementById('calendar-details');
    
    const dateMessages = DATA.messages.filter(m => m.date.includes(dateStr) || m.date.includes(`0${day} Abril`));
    const dateTasks = DATA.tasks.filter(t => t.due.includes(dateStr) || t.due.includes(`0${day} Abril`));

    let html = `<h4 class="text-brown fw-bold fs-4 ms-2 mb-3">${dateStr}</h4>`;

    if (dateMessages.length === 0 && dateTasks.length === 0) {
      html += `
        <div class="text-center p-4 border rounded-4 bg-white opacity-75">
          <p class="text-brown fs-5 fw-medium mb-0" data-es="No hay actividades programadas." data-qu="Manam ruranakuna kanchu.">
            ${this.lang === 'es' ? 'No hay actividades programadas.' : 'Manam ruranakuna kanchu.'}
          </p>
        </div>`;
    } else {
      dateMessages.forEach(msg => {
        html += `
          <div class="detail-card msg mb-3">
            <div class="icon-circle blue-bg text-blue" style="width: 56px; height: 56px; flex-shrink: 0;">
              <i data-feather="info"></i>
            </div>
            <div>
              <span class="text-blue fw-bold small text-uppercase tracking-wide d-block mb-1" data-es="Aviso" data-qu="Willakuy">${this.lang === 'es' ? 'Aviso' : 'Willakuy'}</span>
              <p class="text-brown fs-5 fw-bold mb-0 lh-sm" data-es="${msg.es}" data-qu="${msg.qu}">${this.lang === 'es' ? msg.es : msg.qu}</p>
            </div>
          </div>
        `;
      });
      dateTasks.forEach(task => {
        html += `
          <div class="detail-card tsk mb-3">
            <div class="icon-circle terracotta-bg text-terracotta" style="width: 56px; height: 56px; flex-shrink: 0;">
              <i data-feather="book-open"></i>
            </div>
            <div>
              <span class="text-terracotta fw-bold small text-uppercase tracking-wide d-block mb-1">${task.subject}</span>
              <p class="text-brown fs-5 fw-bold mb-0 lh-sm" data-es="${task.es}" data-qu="${task.qu}">${this.lang === 'es' ? task.es : task.qu}</p>
            </div>
          </div>
        `;
      });
    }

    detailsContainer.innerHTML = html;
    feather.replace();
  },

  // --- CHAT & SPEECH RECOGNITION ---
  setupSpeechRecognition: function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-PE';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isRecording = true;
        const btn = document.getElementById('btn-mic');
        const status = document.getElementById('mic-status');
        btn.classList.add('recording');
        btn.innerHTML = '<i data-feather="square" style="width:48px; height:48px;"></i>' + status.outerHTML;
        status.textContent = this.lang === 'es' ? 'Escuchando' : 'Uyarispa';
        feather.replace();
      };

      this.recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        this.processChatText(text);
      };

      this.recognition.onerror = (event) => {
        this.stopRecording();
        this.showTextControls();
        this.speak('No pude escucharte bien. Prueba escribiendo.', 'Manam allintachu uyarini. Qillqay uraypi.');
      };

      this.recognition.onend = () => {
        this.stopRecording();
      };

      // Events for MIC button
      const micBtn = document.getElementById('btn-mic');
      micBtn.addEventListener('pointerdown', () => this.startRecording());
      micBtn.addEventListener('pointerup', () => this.stopRecording());
      micBtn.addEventListener('pointerleave', () => this.stopRecording());
      
    } else {
      this.showTextControls();
    }
  },

  startRecording: function() {
    if (this.recognition && !this.isRecording) {
      this.stopSpeaking();
      this.recognition.lang = this.lang === 'es' ? 'es-PE' : 'es-PE';
      try {
        this.recognition.start();
      } catch(e) {}
    }
  },

  stopRecording: function() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      const btn = document.getElementById('btn-mic');
      const status = document.getElementById('mic-status');
      btn.classList.remove('recording');
      btn.innerHTML = '<i data-feather="mic" style="width:48px; height:48px;"></i>' + status.outerHTML;
      status.textContent = this.lang === 'es' ? 'Mantener' : 'Ñitiy';
      feather.replace();
    }
  },

  showTextControls: function() {
    document.getElementById('mic-controls').classList.add('d-none');
    document.getElementById('text-controls').classList.remove('d-none');
  },

  processTextForm: function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(text) {
      this.processChatText(text);
      input.value = '';
    }
  },

  processChatText: function(text) {
    this.appendChatMessage(text, 'user');
    
    // Increment interaction count in state
    DATA.interactionCount = (DATA.interactionCount || 156) + 1;
    saveSchoolData(DATA);
    // Dispatch local event to update same window
    window.dispatchEvent(new Event('localDataChanged'));
    
    // Simular procesamiento
    setTimeout(() => {
      const response = this.getLocalResponse(text);
      const resText = this.lang === 'es' ? response.es : response.qu;
      this.appendChatMessage(resText, 'ai', response.es, response.qu);
      this.speak(response.es, response.qu);
    }, 1000);
  },

  appendChatMessage: function(text, sender, textEs = null, textQu = null) {
    const container = document.getElementById('chat-messages-container');
    const isUser = sender === 'user';
    
    const div = document.createElement('div');
    div.className = `chat-msg ${sender} d-flex gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`;
    
    let html = '';
    if (!isUser) {
      html += `
        <div class="chat-avatar terracotta shadow-sm">
          <i data-feather="message-circle" class="text-white"></i>
        </div>
      `;
    }
    
    html += `
      <div class="chat-bubble ${isUser ? 'user-bubble' : 'ai-bubble position-relative'}">
        <p class="${isUser ? '' : 'text-brown'} fw-medium fs-5 mb-0">${text}</p>
        ${!isUser ? `
          <button class="btn-audio mini shadow-sm" onclick="app.speak('${textEs}', '${textQu}', this)">
            <i data-feather="volume-2"></i>
          </button>
        ` : ''}
      </div>
    `;
    
    div.innerHTML = html;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    feather.replace();
  },

  getLocalResponse: function(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('asisti') || lower.includes('fue') || lower.includes('clases') || lower.includes('colegio')) {
      return { es: "Sí 😊, su hijo asistió correctamente hoy.", qu: "Arí 😊, wawaykiqa kunan p'unchaw yachaywasiman rirqanmi." };
    }
    if (lower.includes('tarea') || lower.includes('deber') || lower.includes('trabajo')) {
      return { es: "Sí, tiene una tarea pendiente de matemáticas.", qu: "Arí, yupay yachaymanta ruranan kachkan." };
    }
    if (lower.includes('reunión') || lower.includes('reunion') || lower.includes('tutor') || lower.includes('padres')) {
      return { es: "Mañana habrá reunión de padres a las 8 de la mañana.", qu: "Paqarinmi tayta mamakuna huñunakuy kanqa 8 paqarinmanta." };
    }
    if (lower.includes('hola') || lower.includes('buenos') || lower.includes('tardes') || lower.includes('dias')) {
      return { es: "¡Hola! Soy Rimay. ¿En qué te puedo ayudar hoy con Alex?", qu: "¡Allinllachu! Rimaymi kani. ¿Imapim yanapaykiman Alexmanta kunan p'unchaw?" };
    }
    if (lower.includes('nota') || lower.includes('calificacion')) {
      return { es: "Las notas de Alex están muy bien. Ha mejorado mucho.", qu: "Alexpa notasninqa allinmi kachkan. Aswan allinta rurachkan." };
    }
    return { es: "Entiendo. Sin embargo, no tengo esa información. ¿Hay algo más que te gustaría saber?", qu: "Entiendenim. Ichaqa manam chay willakuyta hap'inichu. ¿Ima huknatataq yachayta munanki?" };
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  app.init();
  
  // Tab synchronization and real-time updates
  window.addEventListener("storage", (e) => {
    if (e.key === "RIMAY_SCHOOL_DATA" && e.newValue) {
      DATA = JSON.parse(e.newValue);
      // Re-render everything with the new data
      app.renderMessages();
      app.renderAttendance();
      app.renderTasks();
      app.renderCalendar();
      
      // Update student details dynamically
      const nameEl = document.getElementById('student-name');
      const schoolEl = document.getElementById('student-school');
      if (nameEl && DATA.student) nameEl.textContent = DATA.student.name;
      if (schoolEl && DATA.student) schoolEl.textContent = DATA.student.school;
    }
  });

  // Listener for changes made within the same window (e.g. chat increments)
  window.addEventListener("localDataChanged", () => {
    DATA = getSchoolData();
    app.renderMessages();
    app.renderAttendance();
    app.renderTasks();
    app.renderCalendar();
  });
});
