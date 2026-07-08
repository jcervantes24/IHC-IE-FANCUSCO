const ADMIN_DATA = {
  messages: [
    { id: 1, date: "23 Abril", text: "No hay clases mañana por desinfección del colegio.", type: "General" },
    { id: 2, date: "21 Abril", text: "Reunión de padres este viernes a las 4pm.", type: "Importante" },
    { id: 3, date: "15 Abril", text: "Inicio de campeonato interno.", type: "Deportes" }
  ],
  students: [
    { id: 101, name: "Alex Quispe Condori", grade: "3ro A", status: "present", tasks: "85%" },
    { id: 102, name: "Maria Mamani Ccuta", grade: "3ro A", status: "present", tasks: "100%" },
    { id: 103, name: "Luis Huaman Paucar", grade: "3ro B", status: "absent", tasks: "60%" },
    { id: 104, name: "Ana Torres Vilca", grade: "4to C", status: "present", tasks: "95%" },
    { id: 105, name: "Carlos Cusi Yupanqui", grade: "2do A", status: "present", tasks: "40%" }
  ],
  weeklyAttendance: [
    { day: "Lun", present: 330, absent: 12 },
    { day: "Mar", present: 325, absent: 17 },
    { day: "Mié", present: 340, absent: 2 },
    { day: "Jue", present: 338, absent: 4 },
    { day: "Vie", present: 342, absent: 0 }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  renderMessages();
  renderTable();
  drawChart();
});

function renderMessages() {
  const container = document.getElementById("recent-messages-list");

  container.innerHTML = ADMIN_DATA.messages.map(msg => `
    <div class="p-3 rounded-4 border d-flex gap-3 align-items-center" style="background:#f8f9fa;">
      <div class="icon-circle ${msg.type === "Importante" ? "terracotta-bg text-terracotta" : "blue-bg text-blue"}" style="width:48px;height:48px;flex-shrink:0;">
        <i data-feather="${msg.type === "Importante" ? "alert-triangle" : "info"}"></i>
      </div>
      <div>
        <span class="d-block fw-bold" style="color:var(--text-brown);">${msg.date}</span>
        <span class="d-block small" style="color:var(--text-brown);opacity:.8;">${msg.text}</span>
      </div>
    </div>
  `).join("");

  if (window.feather) feather.replace();
}

function renderTable() {
  const tbody = document.getElementById("student-table-body");

  tbody.innerHTML = ADMIN_DATA.students.map(student => `
    <tr>
      <td class="fw-bold">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-circle bg-light border" style="width:40px;height:40px;">
            <i data-feather="user" style="width:18px;color:var(--text-brown);"></i>
          </div>
          ${student.name}
        </div>
      </td>
      <td>${student.grade}</td>
      <td>
        <span class="badge-status ${student.status}">
          ${student.status === "present" ? "Asistió" : "Faltó"}
        </span>
      </td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="progress flex-grow-1" style="height:8px;">
            <div
              class="progress-bar ${
                parseInt(student.tasks) >= 80
                  ? "bg-success"
                  : parseInt(student.tasks) >= 50
                  ? "bg-warning"
                  : "bg-danger"
              }"
              role="progressbar"
              style="width:${student.tasks}"
              aria-valuemin="0"
              aria-valuemax="100">
            </div>
          </div>
          <span class="small fw-bold">${student.tasks}</span>
        </div>
      </td>
      <td>
        <button class="btn btn-sm btn-light rounded-circle shadow-sm">
          <i data-feather="more-horizontal"></i>
        </button>
      </td>
    </tr>
  `).join("");

  if (window.feather) feather.replace();
}

function drawChart() {
  const container = document.getElementById("attendance-chart");

  if (!container) return;

  const data = ADMIN_DATA.weeklyAttendance;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
  };

  const svg = d3
    .select("#attendance-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.day))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.present + d.absent)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const colorPresent = "#6B8F71";
  const colorAbsent = "#C97B63";

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call(g => g.select(".domain").remove())
    .call(g =>
      g.selectAll("text")
        .style("font-family", "Inter")
        .style("font-weight", "600")
        .style("font-size", "14px")
    );

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5))
    .call(g => g.select(".domain").remove())
    .call(g =>
      g.selectAll(".tick line")
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1)
    )
    .call(g =>
      g.selectAll("text")
        .style("font-family", "Inter")
        .style("font-size", "12px")
        .style("opacity", 0.7)
    );

  const stack = d3.stack().keys(["present", "absent"]);
  const series = stack(data);

  const colors = d3
    .scaleOrdinal()
    .domain(["present", "absent"])
    .range([colorPresent, colorAbsent]);

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
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("rx", 6);

  const legend = svg
    .append("g")
    .attr("font-family", "Inter")
    .attr("font-size", 12)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(["Asistentes", "Faltas"])
    .join("g")
    .attr("transform", (_, i) => `translate(0,${i * 20 + 10})`);

  legend
    .append("rect")
    .attr("x", width - 19)
    .attr("width", 15)
    .attr("height", 15)
    .attr("rx", 4)
    .attr("fill", (_, i) => (i === 0 ? colorPresent : colorAbsent));

  legend
    .append("text")
    .attr("x", width - 28)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .style("font-weight", "600")
    .style("fill", "#8B5E3C")
    .text(d => d);
}
