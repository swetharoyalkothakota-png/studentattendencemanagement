/* ===== Shared script: demo data, helpers, theme, toast, login, session ===== */
const DATA = {
  users: {
    student: [{ id: "STU001", name: "Sai Swetha", password: "1234" }],
    teacher: [{ id: "TCH001", name: "Professor", password: "1234" }]
  },
  subjects: ["Python", "DBMS", "Java", "Mathematics", "Statistics"],
  // Replace with an API call (fetch) later - the rest of the UI only uses these arrays.
  // classes: [total, present] per subject, in the same order as `subjects`.
  students: [
    { id: "STU001", name: "Sai Swetha", department: "Data Science", year: "3rd Year", semester: "5th Semester", section: "A", email: "student@example.com", classes: [[30,27],[28,23],[25,20],[22,16],[15,14]] },
    { id: "STU002", name: "Anjali", department: "Data Science", year: "3rd Year", semester: "5th Semester", section: "A", email: "anjali@example.com", classes: [[30,29],[28,26],[25,22],[22,20],[15,14]] },
    { id: "STU003", name: "Priya", department: "CSE", year: "2nd Year", semester: "3rd Semester", section: "B", email: "priya@example.com", classes: [[30,22],[28,20],[25,17],[22,15],[15,10]] },
    { id: "STU004", name: "Rahul", department: "ECE", year: "4th Year", semester: "7th Semester", section: "A", email: "rahul@example.com", classes: [[30,25],[28,24],[25,21],[22,18],[15,13]] },
    { id: "STU005", name: "Kiran", department: "CSE", year: "3rd Year", semester: "5th Semester", section: "B", email: "kiran@example.com", classes: [[30,18],[28,19],[25,16],[22,14],[15,9]] }
  ]
};

/* ---- Attendance calculations ---- */
function calculateAttendance(present, total) {          // percentage = present/total*100, 2 decimals
  return total === 0 ? 0 : Number(((present / total) * 100).toFixed(2));
}
function getStatus(p) { return p >= 90 ? "Excellent" : p >= 75 ? "Good" : "Low"; }
function badge(status) { return `<span class="badge ${status.toLowerCase()}">${status === "Low" ? "Low Attendance" : status}</span>`; }

/* ---- localStorage attendance records: { "date|subject|studentId": "Present"|"Absent" } ---- */
function loadAttendance() { return JSON.parse(localStorage.getItem("attendanceRecords") || "{}"); }
function saveAttendance(records) { localStorage.setItem("attendanceRecords", JSON.stringify(records)); }

/* Base demo numbers + anything the teacher marked is merged here */
function getStudentSubjects(student) {
  const records = loadAttendance();
  return DATA.subjects.map((name, i) => {
    let total = student.classes[i][0], present = student.classes[i][1];
    Object.keys(records).forEach(key => {
      const [, sub, id] = key.split("|");
      if (sub === name && id === student.id) { total++; if (records[key] === "Present") present++; }
    });
    const percentage = calculateAttendance(present, total);
    return { name, total, present, absent: total - present, percentage, status: getStatus(percentage) };
  });
}
function overallPercent(student) {
  const s = getStudentSubjects(student);
  return calculateAttendance(s.reduce((a, x) => a + x.present, 0), s.reduce((a, x) => a + x.total, 0));
}

/* ---- Toast notifications ---- */
function showToast(message, type = "success") {
  let box = document.getElementById("toast-box");
  if (!box) { box = document.createElement("div"); box.id = "toast-box"; document.body.appendChild(box); }
  const t = document.createElement("div");
  t.className = "toast " + (type === "error" ? "error" : "");
  t.textContent = message;
  box.appendChild(t);
  setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 400); }, 2800);
}

/* ---- Theme (saved in localStorage) ---- */
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  document.querySelectorAll(".theme-toggle i").forEach(i => i.className = dark ? "fas fa-sun" : "fas fa-moon");
}
function initTheme() {
  applyTheme(localStorage.getItem("theme") === "dark");
  document.querySelectorAll(".theme-toggle").forEach(btn => btn.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    localStorage.setItem("theme", dark ? "dark" : "light"); applyTheme(dark);
  }));
}

/* ---- Session ---- */
function getSession() { return { userType: sessionStorage.getItem("userType"), userName: sessionStorage.getItem("userName"), userId: sessionStorage.getItem("userId") }; }
function requireLogin(role) {                              // redirect to login if not logged in
  if (getSession().userType !== role) { window.location.href = "login.html"; return false; }
  return true;
}
function logout() {
  sessionStorage.clear();
  showToast("Logged out successfully.");
  setTimeout(() => window.location.href = "login.html", 900);
}

/* ---- Login page ---- */
function renderLoginForm(type) {
  const label = type === "student" ? "Student" : "Teacher";
  const area = document.getElementById("formArea");
  area.innerHTML = `<form id="loginForm" novalidate>
    <label for="uid">${label} ID</label><input id="uid" placeholder="${type === "student" ? "STU001" : "TCH001"}">
    <label for="pwd">Password</label><input id="pwd" type="password" placeholder="1234">
    <p class="error" id="formError"></p><br><button class="btn" style="width:100%">Login</button>
    <p class="hint">Demo: ${type === "student" ? "STU001" : "TCH001"} / 1234</p></form>`;
  document.querySelectorAll(".choice button").forEach(b => b.classList.toggle("selected", b.dataset.type === type));
  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();                                    // stop real form submission
    const id = document.getElementById("uid").value.trim(), pwd = document.getElementById("pwd").value.trim();
    const err = document.getElementById("formError");
    if (!id || !pwd) { err.textContent = `Please enter ${label} ID and Password.`; return; }
    const user = DATA.users[type].find(u => u.id.toLowerCase() === id.toLowerCase() && u.password === pwd);
    if (!user) { err.textContent = "Invalid login credentials."; return; }
    sessionStorage.setItem("userType", type); sessionStorage.setItem("userName", user.name); sessionStorage.setItem("userId", user.id);
    showToast("Login successful!");
    setTimeout(() => window.location.href = type === "student" ? "student-dashboard.html" : "teacher-dashboard.html", 800);
  });
}
function initLogin() {
  document.querySelectorAll(".choice button").forEach(b => b.addEventListener("click", () => renderLoginForm(b.dataset.type)));
  renderLoginForm(location.hash === "#teacher" ? "teacher" : "student");
}

/* ---- Landing page: features + animated counters ---- */
function renderFeatures() {
  const box = document.getElementById("features"); if (!box) return;
  [["fa-user-check","Student Attendance Tracking","Monitor every class a student attends."],["fa-chalkboard-user","Teacher Attendance Management","Mark attendance in a few clicks."],["fa-table-list","Class-wise Attendance","See attendance subject by subject."],["fa-percent","Attendance Percentage","Automatic percentage and status."],["fa-address-card","Student Information","Profiles with department and section."],["fa-lock","Secure Login","Separate student and teacher access."]]
  .forEach(([ic, t, d]) => { const c = document.createElement("div"); c.className = "card hover fade"; c.innerHTML = `<div class="ico"><i class="fas ${ic}"></i></div><h3>${t}</h3><p>${d}</p>`; box.appendChild(c); });
}
function animateCount(el) {
  const target = +el.dataset.count, suffix = el.dataset.suffix || ""; let n = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => { n = Math.min(n + step, target); el.textContent = n.toLocaleString() + suffix; if (n >= target) clearInterval(timer); }, 25);
}
function initCounters() {
  const items = document.querySelectorAll("[data-count]"); if (!items.length) return;
  const obs = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { animateCount(en.target); obs.unobserve(en.target); } }), { threshold: .5 });
  items.forEach(i => obs.observe(i));
}

/* ---- Common init ---- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme(); renderFeatures(); initCounters();
  document.querySelectorAll(".progress span[data-width]").forEach(s => setTimeout(() => s.style.width = s.dataset.width + "%", 300));
  const menu = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  if (menu) menu.addEventListener("click", () => nav.classList.toggle("open"));
  const page = location.pathname.split("/").pop().replace(".html", "") || "index";
  document.querySelectorAll(".nav a[data-p]").forEach(a => a.classList.toggle("active", a.dataset.p === page));
  if (document.getElementById("formArea")) initLogin();
  // Dashboard shared behaviour
  const role = document.body.dataset.role;
  if (role && requireLogin(role)) {
    const nameEl = document.getElementById("userName"); if (nameEl) nameEl.textContent = getSession().userName;
    document.querySelectorAll(".logout-btn").forEach(b => b.addEventListener("click", logout));
    const side = document.getElementById("sidebar");
    document.getElementById("sideBtn").addEventListener("click", () => side.classList.toggle("open"));
    document.querySelectorAll("[data-panel]").forEach(link => link.addEventListener("click", () => {
      document.querySelectorAll("[data-panel]").forEach(l => l.classList.remove("active")); link.classList.add("active");
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("show"));
      document.getElementById(link.dataset.panel).classList.add("show"); side.classList.remove("open");
    }));
    document.dispatchEvent(new Event("dashboardReady"));
  }
});
