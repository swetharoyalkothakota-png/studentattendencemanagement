/* ===== Teacher dashboard ===== */
const today = () => new Date().toISOString().slice(0, 10);
const $ = id => document.getElementById(id);
const uniq = key => [...new Set(DATA.students.map(s => s[key]))];
function fillSelect(id, first, values) { $(id).innerHTML = `<option value="all">${first}</option>` + values.map(v => `<option>${v}</option>`).join(""); }

/* Student information table with filters */
function renderStudents() {
  const q = $("sSearch").value.toLowerCase(), d = $("sDept").value, y = $("sYear").value, sec = $("sSec").value;
  const body = $("stuBody"); body.innerHTML = "";
  DATA.students.filter(s => (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) && (d === "all" || s.department === d) && (y === "all" || s.year === y) && (sec === "all" || s.section === sec))
    .forEach(s => { const tr = document.createElement("tr"), p = overallPercent(s);
      tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.department}</td><td>${s.year}</td><td>${s.section}</td><td>${p}% ${badge(getStatus(p))}</td>`; body.appendChild(tr); });
}
/* Mark attendance: list students matching department/year/section */
function renderMarkList() {
  const date = $("mDate").value, sub = $("mSub").value, body = $("markBody"); body.innerHTML = "";
  DATA.students.filter(s => ($("mDept").value === "all" || s.department === $("mDept").value) && ($("mYear").value === "all" || s.year === $("mYear").value) && ($("mSec").value === "all" || s.section === $("mSec").value))
    .forEach(s => {
      const key = `${date}|${sub}|${s.id}`, tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.name} (${s.id})</td><td class="mark"><button data-v="Present">Present</button><button data-v="Absent">Absent</button></td>`;
      const btns = tr.querySelectorAll("button");
      const paint = () => { const v = loadAttendance()[key]; btns[0].classList.toggle("on-p", v === "Present"); btns[1].classList.toggle("on-a", v === "Absent"); };
      btns.forEach(b => b.addEventListener("click", () => {
        if (!date) { showToast("Please select a date.", "error"); return; }
        const r = loadAttendance(); r[key] = b.dataset.v; saveAttendance(r); paint(); renderReports();
        showToast("Attendance marked successfully!");
      }));
      paint(); body.appendChild(tr);
    });
}
function renderClasses() {
  const box = $("classCards"); box.innerHTML = "";
  DATA.subjects.forEach(n => { const c = document.createElement("div"); c.className = "card hover"; c.innerHTML = `<div class="ico"><i class="fas fa-book-open"></i></div><h3>${n}</h3><p>${DATA.students.length} students enrolled</p>`; box.appendChild(c); });
}
/* Report stats + table */
function renderReports() {
  const rec = loadAttendance(), t = today(), todays = Object.keys(rec).filter(k => k.startsWith(t + "|"));
  const present = todays.filter(k => rec[k] === "Present").length;
  const avg = calculateAttendance(DATA.students.reduce((a, s) => a + overallPercent(s), 0), DATA.students.length * 100);
  const stats = [["Total Students", DATA.students.length], ["Present Today", present], ["Absent Today", todays.length - present], ["Average Attendance", avg + "%"]];
  document.querySelectorAll(".stat-grid").forEach(g => { g.innerHTML = ""; stats.forEach(([l, v]) => { const c = document.createElement("div"); c.className = "card stat"; c.innerHTML = `<b>${v}</b>${l}`; g.appendChild(c); }); });
  const body = $("repBody"); body.innerHTML = "";
  DATA.students.forEach(s => { const p = overallPercent(s), marks = todays.filter(k => k.endsWith("|" + s.id)).map(k => rec[k]);
    const tr = document.createElement("tr"); tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${p}%</td><td>${badge(getStatus(p))}</td><td>${marks.length ? marks.join(", ") : "Not marked"}</td>`; body.appendChild(tr); });
}
/* CSV export using a Blob download */
function exportCSV() {
  const rows = [["Student ID", "Name", "Department", "Overall %", "Status"]];
  DATA.students.forEach(s => { const p = overallPercent(s); rows.push([s.id, s.name, s.department, p, getStatus(p)]); });
  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "attendance-report.csv"; a.click();
  showToast("Report exported!");
}
document.addEventListener("dashboardReady", () => {
  fillSelect("sDept", "All Departments", uniq("department")); fillSelect("sYear", "All Years", uniq("year")); fillSelect("sSec", "All Sections", uniq("section"));
  fillSelect("mDept", "All Departments", uniq("department")); fillSelect("mYear", "All Years", uniq("year")); fillSelect("mSec", "All Sections", uniq("section"));
  $("mSub").innerHTML = DATA.subjects.map(n => `<option>${n}</option>`).join(""); $("mDate").value = today();
  ["sSearch", "sDept", "sYear", "sSec"].forEach(id => $(id).addEventListener(id === "sSearch" ? "input" : "change", renderStudents));
  ["mDept", "mYear", "mSec", "mSub", "mDate"].forEach(id => $(id).addEventListener("change", renderMarkList));
  $("exportBtn").addEventListener("click", exportCSV);
  $("printBtn").addEventListener("click", () => window.print());
  renderStudents(); renderMarkList(); renderClasses(); renderReports();
});
