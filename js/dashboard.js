/**
 * Rimay - Administración Escolar Docente
 * Sincronización completa con localStorage y el portal móvil
 */

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

// --- DATA ACCESSORS ---
function getSchoolData() {
  let stored = localStorage.getItem("RIMAY_SCHOOL_DATA");
  if (!stored) {
    localStorage.setItem("RIMAY_SCHOOL_DATA", JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  try {
    const parsed = JSON.parse(stored);
    const merged = { ...DEFAULT_DATA, ...parsed };
    merged.student = { ...DEFAULT_DATA.student, ...parsed.student };
    if (!Array.isArray(merged.students)) merged.students = DEFAULT_DATA.students;
    if (!Array.isArray(merged.messages)) merged.messages = DEFAULT_DATA.messages;
    if (!Array.isArray(merged.tasks)) merged.tasks = DEFAULT_DATA.tasks;
    if (!Array.isArray(merged.attendance)) merged.attendance = DEFAULT_DATA.attendance;
    if (!Array.isArray(merged.weeklyAttendance)) merged.weeklyAttendance = DEFAULT_DATA.weeklyAttendance;
    return merged;
  } catch (e) {
    return DEFAULT_DATA;
  }
}

function saveSchoolData(data) {
  localStorage.setItem("RIMAY_SCHOOL_DATA", JSON.stringify(data));
  // Dispatch custom event for same-window updates
  window.dispatchEvent(new Event('localDataChanged'));
}

let DATA = getSchoolData();

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderAll();
  
  // Real-time tab synchronization
  window.addEventListener("storage", (e) => {
    if (e.key === "RIMAY_SCHOOL_DATA" && e.newValue) {
      DATA = JSON.parse(e.newValue);
      renderAll();
    }
  });

  // Same-window change listener
  window.addEventListener("localDataChanged", () => {
    DATA = getSchoolData();
    renderAll();
  });
});

// --- NAVIGATION SYSTEM ---
function setupNavigation() {
  const links = document.querySelectorAll("#sidebar-navigation .nav-link");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Update active nav-link class
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      
      // Hide all panels, show target
      const targetId = link.getAttribute("data-target");
      document.querySelectorAll(".admin-view-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");

      // Update header title
      const titleMap = {
        "panel-inicio": "Dashboard Escolar",
        "panel-asistencia": "Control de Asistencia Diario",
        "panel-tareas": "Asignaciones y Tareas Escolares",
        "panel-avisos": "Comunicados Oficiales"
      };
      document.getElementById("dynamic-header-title").textContent = titleMap[targetId] || "Rimay Docente";
    });
  });
}

// --- CORE RENDER MASTER ---
function renderAll() {
  calculateStats();
  renderRecentMessages();
  renderStudentsTable();
  renderAsistenciaPanel();
  renderTareasPanel();
  renderAvisosPanel();
  
  // Clean container and redraw D3 chart to prevent duplicates
  const chartContainer = document.getElementById("attendance-chart");
  if (chartContainer) {
    chartContainer.innerHTML = "";
    drawChart();
  }

  if (window.feather) feather.replace();
}

// --- CALCULATE STATS ---
function calculateStats() {
  // 1. Students Count
  document.getElementById("stat-alumnos").textContent = DATA.students.length;

  // 2. Attendance percentage today
  const presents = DATA.students.filter(s => s.status === "present").length;
  const percentage = DATA.students.length > 0 ? Math.round((presents / DATA.students.length) * 100) : 0;
  document.getElementById("stat-asistencia").textContent = percentage + "%";

  // 3. Active tasks count
  document.getElementById("stat-tareas").textContent = DATA.tasks.length;

  // 4. Rimay interaction count
  document.getElementById("stat-interinteractions") || (document.getElementById("stat-interacciones").textContent = DATA.interactionCount || 156);
}

// --- RENDER RECENT MESSAGES (SIDEBAR IN MAIN VIEW) ---
function renderRecentMessages() {
  const container = document.getElementById("recent-messages-list");
  if (!container) return;

  if (DATA.messages.length === 0) {
    container.innerHTML = `
      <div class="text-center p-4 border rounded-4 text-muted small">
        No hay comunicados publicados recientemente.
      </div>
    `;
    return;
  }

  // Show last 3 messages
  const recent = [...DATA.messages].reverse().slice(0, 3);

  container.innerHTML = recent.map(msg => `
    <div class="p-3 rounded-4 border d-flex gap-3 align-items-center bg-light">
      <div class="icon-circle ${msg.type === "Importante" ? "terracotta-bg text-terracotta" : "blue-bg text-blue"}" style="width:40px;height:40px;flex-shrink:0;">
        <i data-feather="${msg.type === "Importante" ? "alert-triangle" : "info"}" style="width:18px;"></i>
      </div>
      <div class="overflow-hidden">
        <span class="d-block fw-bold small text-muted">${msg.date} • ${msg.type || 'Aviso'}</span>
        <span class="d-block small text-truncate fw-medium" style="color:var(--text-brown);">${msg.es}</span>
      </div>
    </div>
  `).join("");

  if (window.feather) feather.replace();
}

// --- RENDER STUDENTS TABLE (MAIN VIEW) ---
function renderStudentsTable() {
  const tbody = document.getElementById("student-table-body");
  if (!tbody) return;

  tbody.innerHTML = DATA.students.map(student => `
    <tr>
      <td class="fw-bold">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-circle bg-light border" style="width:40px;height:40px;">
            <i data-feather="user" style="width:18px;color:var(--text-brown);"></i>
          </div>
          <div>
            <span class="d-block">${student.name}</span>
            <span class="text-muted small fw-normal">${student.id === 101 ? 'Estudiante Principal (App)' : 'Estudiante'}</span>
          </div>
        </div>
      </td>
      <td>${student.grade}</td>
      <td class="text-center">
        <span class="badge-status ${student.status}" onclick="toggleStudentAttendance(${student.id})" title="Haz clic para cambiar asistencia">
          ${student.status === "present" ? "Asistió" : "Faltó"}
        </span>
      </td>
      <td>
        <div class="d-flex align-items-center gap-2" style="max-width: 200px;">
          <input type="range" class="form-range" min="0" max="100" step="5" value="${parseInt(student.tasks)}" onchange="updateStudentTasksProgress(${student.id}, this.value)">
          <span class="small fw-bold">${student.tasks}</span>
        </div>
      </td>
      <td class="text-end">
        <div class="dropdown">
          <button class="btn btn-sm btn-light rounded-circle shadow-sm" data-bs-toggle="dropdown" aria-expanded="false">
            <i data-feather="more-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end rounded-4 shadow border-0 p-2">
            <li><a class="dropdown-menu-item btn btn-sm btn-link text-decoration-none text-dark w-100 text-start py-2 px-3" onclick="toggleStudentAttendance(${student.id})"><i data-feather="check-square" class="me-2" style="width:16px;"></i> Cambiar Asistencia</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-menu-item btn btn-sm btn-link text-decoration-none text-danger w-100 text-start py-2 px-3" onclick="eliminarEstudiante(${student.id})"><i data-feather="trash" class="me-2" style="width:16px;"></i> Eliminar</a></li>
          </ul>
        </div>
      </td>
    </tr>
  `).join("");

  if (window.feather) feather.replace();
}

// --- RENDER DEDICATED ATTENDANCE VIEW ---
function renderAsistenciaPanel() {
  const tbody = document.getElementById("asistencia-panel-tbody");
  if (!tbody) return;

  tbody.innerHTML = DATA.students.map(student => `
    <tr>
      <td class="text-muted">#${student.id}</td>
      <td class="fw-bold">${student.name}</td>
      <td><span class="badge bg-light text-brown border fw-bold">${student.grade}</span></td>
      <td class="text-center">
        <span class="badge-status ${student.status}">
          ${student.status === "present" ? "Presente" : "Ausente"}
        </span>
      </td>
      <td class="text-center">
        <div class="btn-group rounded-pill overflow-hidden shadow-sm border border-light" role="group">
          <button type="button" class="btn btn-sm ${student.status === 'present' ? 'btn-success' : 'btn-light'} px-3" onclick="setStudentAttendance(${student.id}, 'present')">Presente</button>
          <button type="button" class="btn btn-sm ${student.status === 'absent' ? 'btn-danger' : 'btn-light'} px-3" onclick="setStudentAttendance(${student.id}, 'absent')">Ausente</button>
        </div>
      </td>
    </tr>
  `).join("");

  if (window.feather) feather.replace();
}

// --- RENDER DEDICATED TAREAS VIEW ---
function renderTareasPanel() {
  const container = document.getElementById("tareas-panel-list");
  if (!container) return;

  if (DATA.tasks.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="icon-circle bg-light text-muted mx-auto mb-3 shadow-sm" style="width: 80px; height: 80px;">
          <i data-feather="book-open" style="width:36px; height:36px;"></i>
        </div>
        <h4 class="text-brown fw-bold">No hay tareas asignadas</h4>
        <p class="text-muted">Crea una nueva asignación para verla reflejada aquí.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = DATA.tasks.map(task => `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 rounded-5 shadow-sm p-4 h-100 position-relative d-flex flex-column" style="background-color: var(--white); border: 2px solid rgba(167, 199, 231, 0.2) !important;">
        <span class="position-absolute top-0 end-0 m-4 badge bg-light text-terracotta border border-dashed rounded-4 py-2 px-3">Límite: ${task.due}</span>
        
        <div class="d-flex align-items-center gap-2 mb-3">
          <div class="icon-circle blue-bg text-blue" style="width: 36px; height:36px;">
            <i data-feather="book" style="width:16px;"></i>
          </div>
          <span class="fw-bold text-blue tracking-wide text-uppercase" style="font-size:0.85rem;">${task.subject}</span>
        </div>
        
        <div class="mb-3 flex-grow-1">
          <h5 class="text-brown fw-bold fs-5 mb-2">${task.es}</h5>
          <p class="text-muted italic small mb-0 lh-sm"><strong>Rimay Quechua:</strong><br>${task.qu || 'Sin traducción asignada'}</p>
        </div>

        <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-voice-preview" onclick="playVoiceText('${task.es}', 'es')" title="Escuchar en español">
              <i data-feather="volume-2" style="width:14px;"></i>
            </button>
            <button class="btn btn-sm btn-voice-preview" onclick="playVoiceText('${task.qu}', 'qu')" title="Escuchar en quechua">
              <i data-feather="volume-2" style="width:14px; color: var(--green);"></i>
            </button>
          </div>
          <button class="btn btn-sm btn-link text-danger text-decoration-none p-0" onclick="deleteTarea(${task.id})">
            <i data-feather="trash-2" style="width: 16px;"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  `).join("");

  if (window.feather) feather.replace();
}

// --- RENDER DEDICATED AVISOS VIEW ---
function renderAvisosPanel() {
  const tbody = document.getElementById("avisos-panel-tbody");
  if (!tbody) return;

  if (DATA.messages.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          <i data-feather="bell-off" class="d-block mx-auto mb-3" style="width:40px; height:40px;"></i>
          No hay comunicados o avisos publicados para los padres.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = DATA.messages.map(msg => `
    <tr>
      <td class="fw-bold">${msg.date}</td>
      <td>
        <span class="badge ${msg.type === 'Importante' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} rounded-pill px-3 py-1 fw-bold small">
          ${msg.type || 'General'}
        </span>
      </td>
      <td><div class="text-wrap" style="max-width: 250px;">${msg.es}</div></td>
      <td><div class="text-wrap text-muted small" style="max-width: 250px;"><em>${msg.qu || 'N/A'}</em></div></td>
      <td class="text-center">
        <div class="d-inline-flex gap-2">
          <button class="btn btn-sm btn-voice-preview" onclick="playVoiceText('${msg.es}', 'es')" title="Reproducir Español">ES</button>
          <button class="btn btn-sm btn-voice-preview" onclick="playVoiceText('${msg.qu}', 'qu')" title="Reproducir Quechua">QU</button>
        </div>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger border-0 rounded-circle" onclick="deleteAviso(${msg.id})">
          <i data-feather="trash-2" style="width:16px;"></i>
        </button>
      </td>
    </tr>
  `).join("");

  if (window.feather) feather.replace();
}

// --- TOGGLE STUDENT ATTENDANCE (FAST CLICK) ---
function toggleStudentAttendance(studentId) {
  const student = DATA.students.find(s => s.id === studentId);
  if (!student) return;
  const newStatus = student.status === "present" ? "absent" : "present";
  setStudentAttendance(studentId, newStatus);
}

// --- SET STUDENT ATTENDANCE ---
function setStudentAttendance(studentId, status) {
  const student = DATA.students.find(s => s.id === studentId);
  if (!student) return;

  student.status = status;

  // If this student is Alex, synchronize with the student details for the parent app
  if (studentId === 101) {
    const todayRecord = DATA.attendance[0]; // Assuming index 0 is today (24 Abril)
    if (todayRecord) {
      todayRecord.status = status;
      if (status === "present") {
        todayRecord.es = "Asistió";
        todayRecord.qu = "Hamurqan";
      } else {
        todayRecord.es = "Faltó";
        todayRecord.qu = "Mana hamurqanchu";
      }
    }
  }

  saveSchoolData(DATA);
  renderAll();
}

// --- UPDATE STUDENT TASK PROGRESS SLIDER ---
function updateStudentTasksProgress(studentId, val) {
  const student = DATA.students.find(s => s.id === studentId);
  if (student) {
    student.tasks = val + "%";
    saveSchoolData(DATA);
  }
}

// --- SET MASS ATTENDANCE ---
function markAllAsistencia(isPresent) {
  const status = isPresent ? "present" : "absent";
  DATA.students.forEach(s => {
    s.status = status;
  });

  // Sync Alex
  const todayRecord = DATA.attendance[0];
  if (todayRecord) {
    todayRecord.status = status;
    todayRecord.es = isPresent ? "Asistió" : "Faltó";
    todayRecord.qu = isPresent ? "Hamurqan" : "Mana hamurqanchu";
  }

  saveSchoolData(DATA);
  renderAll();
}

// --- DELETE ESTUDIANTE ---
function eliminarEstudiante(id) {
  if (confirm("¿Estás seguro de eliminar a este estudiante de tu registro de clases?")) {
    DATA.students = DATA.students.filter(s => s.id !== id);
    saveSchoolData(DATA);
    renderAll();
  }
}

// --- DELETE TAREA ---
function deleteTarea(id) {
  if (confirm("¿Eliminar esta tarea del registro? Se borrará también de la app móvil del padre.")) {
    DATA.tasks = DATA.tasks.filter(t => t.id !== id);
    saveSchoolData(DATA);
    renderAll();
  }
}

// --- DELETE AVISO ---
function deleteAviso(id) {
  if (confirm("¿Eliminar este comunicado? Los padres ya no lo verán en la aplicación.")) {
    DATA.messages = DATA.messages.filter(m => m.id !== id);
    saveSchoolData(DATA);
    renderAll();
  }
}

// --- MODAL UTILITIES ---
let avisoModal, tareaModal;
function getAvisoModalInstance() {
  if (!avisoModal) {
    avisoModal = new bootstrap.Modal(document.getElementById('modal-nuevo-aviso'));
  }
  return avisoModal;
}
function getTareaModalInstance() {
  if (!tareaModal) {
    tareaModal = new bootstrap.Modal(document.getElementById('modal-nueva-tarea'));
  }
  return tareaModal;
}

function showAddAvisoModal() {
  document.getElementById("form-nuevo-aviso").reset();
  // Autofill with today's date placeholder
  document.getElementById("aviso-fecha").value = "24 Abril";
  getAvisoModalInstance().show();
}

function showAddTareaModal() {
  document.getElementById("form-nueva-tarea").reset();
  document.getElementById("tarea-fecha").value = "26 Abril";
  getTareaModalInstance().show();
}

// --- SAVE FORM DATA ---
function saveAviso(e) {
  e.preventDefault();
  const date = document.getElementById("aviso-fecha").value;
  const category = document.getElementById("aviso-categoria").value;
  const esText = document.getElementById("aviso-es").value;
  const quText = document.getElementById("aviso-qu").value;

  const newId = DATA.messages.length > 0 ? Math.max(...DATA.messages.map(m => m.id)) + 1 : 1;

  const newMsg = {
    id: newId,
    date: date,
    es: esText,
    qu: quText,
    type: category
  };

  DATA.messages.push(newMsg);
  saveSchoolData(DATA);
  renderAll();

  getAvisoModalInstance().hide();
}

function saveTarea(e) {
  e.preventDefault();
  const subject = document.getElementById("tarea-materia").value;
  const dateDue = document.getElementById("tarea-fecha").value;
  const esText = document.getElementById("tarea-es").value;
  const quText = document.getElementById("tarea-qu").value;

  const newId = DATA.tasks.length > 0 ? Math.max(...DATA.tasks.map(t => t.id)) + 1 : 1;

  const newTsk = {
    id: newId,
    subject: subject,
    es: esText,
    qu: quText,
    due: dateDue
  };

  DATA.tasks.push(newTsk);
  saveSchoolData(DATA);
  renderAll();

  getTareaModalInstance().hide();
}


// --- AUTO TRANSLATE MOCKS WITH RIMAY AI ---
function autoTranslateAviso() {
  const esText = document.getElementById("aviso-es").value.trim();
  if (!esText) {
    alert("Por favor, escribe primero el texto en español.");
    return;
  }

  // Simple clever local mapper
  let quTranslation = translateSentence(esText);
  document.getElementById("aviso-qu").value = quTranslation;
}

function autoTranslateTarea() {
  const esText = document.getElementById("tarea-es").value.trim();
  if (!esText) {
    alert("Por favor, escribe primero el texto en español.");
    return;
  }

  let quTranslation = translateSentence(esText);
  document.getElementById("tarea-qu").value = quTranslation;
}

function translateSentence(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes("desinfección") || lower.includes("clases")) {
    return "Manam paqarin yachaywasi kanqachu, pichanqaku chaymi tayta mamakuna.";
  }
  if (lower.includes("reunión") || lower.includes("padres")) {
    return "Tayta mamakuna huñunakuy kanqa kay diviernes tawa aspiyta, allin hamuychik.";
  }
  if (lower.includes("matemáticas") || lower.includes("página") || lower.includes("libro")) {
    return "Yupay yachay rapikunata yachay liwrupi ruwananku kachkan wawaykikuna.";
  }
  if (lower.includes("comunicación") || lower.includes("cuento")) {
    return "Willakuyta qillqaspa apamunan wawayki yachaywasiman, yanapaychik.";
  }
  if (lower.includes("traer") || lower.includes("material")) {
    return "Yachay ruranakunata apamunanku paqarin p'unchawpaq.";
  }
  if (lower.includes("mañana") || lower.includes("ingreso")) {
    return "Paqarin tutamanta utqaylla hamunqaku wawaykichikuna.";
  }
  
  // High quality generic translator synthesizer
  return "Rimay AI: " + text.replace(/padres/gi, "tayta mamakuna")
                            .replace(/escuela/gi, "yachaywasi")
                            .replace(/colegio/gi, "yachaywasi")
                            .replace(/niños/gi, "wawakuna")
                            .replace(/hijo/gi, "wawayki")
                            .replace(/clases/gi, "yachaykuna")
                            .replace(/mañana/gi, "paqarin")
                            .replace(/gracias/gi, "sulpayki")
                            + " (Runasimiman t'ikrasqa).";
}


// --- SPEECH SYNTHESIS UTILITY ---
let currentUtterance = null;
function playVoiceText(text, lang) {
  if (!('speechSynthesis' in window)) {
    alert("La síntesis de voz no está soportada en tu navegador.");
    return;
  }

  // Toggle stop
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'es' ? 'es-PE' : 'es-ES'; // Quechua fallback using Spanish accent slow rate
  utterance.rate = 0.8;

  window.speechSynthesis.speak(utterance);
}


// --- D3 CHART IMPLEMENTATION ---
function drawChart() {
  const container = document.getElementById("attendance-chart");
  if (!container) return;

  const data = DATA.weeklyAttendance || DEFAULT_DATA.weeklyAttendance;
  
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 300;

  const margin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 40
  };

  const svg = d3
    .select("#attendance-chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMin meet");

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.day))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.present + d.absent) * 1.05 || 360])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const colorPresent = "#6B8F71";
  const colorAbsent = "#C97B63";

  // Gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat("")
    )
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "4,4")
    );

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
    .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
    .call(g =>
      g.selectAll("text")
        .style("font-family", "Inter, sans-serif")
        .style("font-weight", "600")
        .style("fill", "#8B5E3C")
        .style("font-size", "12px")
    );

  // Y Axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8))
    .call(g => g.select(".domain").remove())
    .call(g =>
      g.selectAll("text")
        .style("font-family", "Inter, sans-serif")
        .style("fill", "#8B5E3C")
        .style("font-size", "11px")
        .style("opacity", 0.7)
    );

  // Stack setup
  const stack = d3.stack().keys(["present", "absent"]);
  const series = stack(data);

  const colors = d3
    .scaleOrdinal()
    .domain(["present", "absent"])
    .range([colorPresent, colorAbsent]);

  // Bar group rendering
  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", d => colors(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.day))
    .attr("y", d => y(d[1]))
    .attr("height", d => Math.max(0, y(d[0]) - y(d[1])))
    .attr("width", x.bandwidth())
    .attr("rx", 5)
    .attr("ry", 5);

  // Legend
  const legend = svg
    .append("g")
    .attr("font-family", "Inter, sans-serif")
    .attr("font-size", 11)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(["Asistentes", "Faltas"])
    .join("g")
    .attr("transform", (_, i) => `translate(0,${i * 20 + 15})`);

  legend
    .append("rect")
    .attr("x", width - 15)
    .attr("width", 12)
    .attr("height", 12)
    .attr("rx", 3)
    .attr("fill", (_, i) => (i === 0 ? colorPresent : colorAbsent));

  legend
    .append("text")
    .attr("x", width - 23)
    .attr("y", 6)
    .attr("dy", "0.32em")
    .style("font-weight", "600")
    .style("fill", "#8B5E3C")
    .text(d => d);
}
