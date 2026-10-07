/* ===== Student dashboard ===== */
let student, subjects;

function renderOverview() {
  const present = subjects.reduce((a, s) => a + s.present, 0), total = subjects.reduce((a, s) => a + s.total, 0);
  const pct = calculateAttendance(present, total), status = getStatus(pct);
  const box = document.getElementById("overview"); box.innerHTML = "";
  [["Overall Attendance", pct + "%", true], ["Present", present], ["Absent", total - present], ["Total Classes", total]].forEach(([label, val, bar]) => {
    const c = document.createElement("div"); c.className = "card fade";
    c.innerHTML = `<p>${label}</p><h1>${val}</h1>` + (bar ? `${badge(status)}<div class="progress"><span class="${status.toLowerCase()}" data-width="${pct}"></span></div>` : "");
    box.appendChild(c);
  });
  setTimeout(() => box.querySelectorAll("span[data-width]").forEach(s => s.style.width = s.dataset.width + "%"), 200);
}
function renderProfile() {
  document.getElementById("avatar").textContent = student.name[0];
  const info = { "Student Name": student.name, "Student ID": student.id, Department: student.department, Year: student.year, Semester: student.semester, Section: student.section, Email: student.email };
  const dl = document.getElementById("profileInfo"); dl.innerHTML = "";
  Object.entries(info).forEach(([k, v]) => { const d = document.createElement("div"); d.innerHTML = `<dt>${k}</dt><dd><b>${v}</b></dd>`; dl.appendChild(d); });
}
/* Filter + search + sort, then redraw the table */
function updateAttendanceUI() {
  const q = document.getElementById("search").value.toLowerCase(), sub = document.getElementById("subjectFilter").value;
  const st = document.getElementById("statusFilter").value, sort = document.getElementById("sortBy").value;
  let list = subjects.filter(s => s.name.toLowerCase().includes(q) && (sub === "all" || s.name === sub) && (st === "all" || s.status === st));
  if (sort !== "none") list = [...list].sort((a, b) => sort === "asc" ? a.percentage - b.percentage : b.percentage - a.percentage);
  const body = document.getElementById("attBody"); body.innerHTML = "";
  if (!list.length) body.innerHTML = '<tr><td colspan="6">No subjects match your filters.</td></tr>';
  list.forEach(s => {
    const tr = document.createElement("tr"); tr.className = "clickable";
    tr.innerHTML = `<td>${s.name}</td><td>${s.total}</td><td>${s.present}</td><td>${s.absent}</td><td>${s.percentage}%</td><td>${badge(s.status)}</td>`;
    tr.addEventListener("click", () => showDetail(s));
    body.appendChild(tr);
  });
}
/* Detail view with a sample October calendar (demo history) */
function showDetail(s) {
  const box = document.getElementById("detail"); box.style.display = "block";
  box.innerHTML = `<h3>${s.name} Attendance</h3><p>Total Classes: ${s.total} | Present: ${s.present} | Absent: ${s.absent} | Attendance: ${s.percentage}%</p><div class="calendar"></div>`;
  const cal = box.querySelector(".calendar"), seed = s.name.length;
  for (let d = 1; d <= 30; d++) {
    const type = d % 7 === 0 ? "Holiday" : (d * 3 + seed) % 8 === 0 ? "Absent" : "Present";
    const cell = document.createElement("div"); cell.className = "day " + type.toLowerCase();
    cell.textContent = `${String(d).padStart(2, "0")} Oct → ${type}`; cal.appendChild(cell);
  }
  box.scrollIntoView({ behavior: "smooth" });
}
function renderSubjectCards() {
  const box = document.getElementById("subjectCards"); box.innerHTML = "";
  subjects.forEach(s => { const c = document.createElement("div"); c.className = "card hover";
    c.innerHTML = `<h3>${s.name}</h3><p>${s.present}/${s.total} classes</p>${badge(s.status)}<div class="progress"><span class="${s.status.toLowerCase()}" style="width:${s.percentage}%"></span></div>`;
    box.appendChild(c); });
}
document.addEventListener("dashboardReady", () => {
  student = DATA.students.find(s => s.id === getSession().userId); subjects = getStudentSubjects(student);
  document.getElementById("subjectFilter").innerHTML = '<option value="all">All Subjects</option>' + DATA.subjects.map(n => `<option>${n}</option>`).join("");
  renderOverview(); renderProfile(); renderSubjectCards(); updateAttendanceUI();
  [["search","input"],["subjectFilter","change"],["statusFilter","change"],["sortBy","change"]].forEach(([id, ev]) => document.getElementById(id).addEventListener(ev, updateAttendanceUI));
});
