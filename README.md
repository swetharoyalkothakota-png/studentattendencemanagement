# CREC Student Attendance Management System
A frontend-only college attendance portal (HTML5, CSS3, Vanilla JS). No backend, no frameworks.

## Features
Landing + About pages, student/teacher login, student dashboard (profile, overview, subject-wise table with search/filter/sort, calendar detail), teacher dashboard (student list with filters, mark attendance, reports, CSV export, print), dark mode, toast notifications, responsive layout.

## Folder structure
`index.html, login.html, about.html, student-dashboard.html, teacher-dashboard.html, css/style.css, js/script.js (shared), js/student.js, js/teacher.js, assets/college-logo.png`

## Run
Open the folder in VS Code and use **Live Server** on `index.html` (or double-click it). Font Awesome loads from a CDN, so icons need internet.

## Demo logins
Student: `STU001` / `1234` — Teacher: `TCH001` / `1234`

## DOM manipulation
Tables, cards, forms, calendars and toasts are built with `createElement`, `appendChild`, `innerHTML`, `textContent` and `classList` (add/remove/toggle).

## Event handling
`DOMContentLoaded`, `submit` (with `preventDefault`), `click`, `change`, `input`; a custom `dashboardReady` event starts each dashboard after the session check.

## localStorage / sessionStorage
- `sessionStorage`: `userType`, `userName`, `userId` (cleared on logout)
- `localStorage`: `theme`, and `attendanceRecords` (via `JSON.stringify/parse`), keyed `date|subject|studentId`. Marked attendance is merged into each student's totals.

## Logo
Replace the `CREC` text inside `.logo` with `<img src="assets/college-logo.png" alt="CREC logo">`.

## Backend-ready
All data lives in `DATA` (script.js) and is accessed through `loadAttendance/saveAttendance/getStudentSubjects`. Swap these for `fetch()` calls to Firebase/Node/MySQL/MongoDB without redesigning the UI.

## Future improvements
Real authentication and password hashing, per-teacher classes, charts, per-date student history, low-attendance email alerts.
