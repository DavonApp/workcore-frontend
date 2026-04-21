# WorkCore Frontend

Frontend client for **WorkCore**, a full-stack productivity web application built to help users organize tasks, manage schedules, and improve workflow efficiency.

Designed in **Figma first**, then developed using **HTML**, **CSS**, and **JavaScript** with a focus on clean UI, responsiveness, and real-world functionality.

## Live Demo

Frontend URL: https://workcore-app.netlify.app

---

## Features

### Authentication

* User registration
* Email/password login
* Google Sign-In
* Forgot password flow
* Password reset email confirmation page

### Task Management

* Create tasks
* Edit tasks
* Delete tasks
* Mark tasks as completed
* Search tasks
* Set due dates
* Set task priority levels

### Productivity Views

* Dashboard page
* Tasks completed page
* Tasks due today page
* Upcoming tasks page

### User Settings

* Profile settings page
* Login & security settings page

### Calendar & Scheduling

* Flatpickr date picker integration
* FullCalendar task calendar visualization

### Additional Pages

* Homepage / landing page
* Privacy Policy page
* Terms of Service page

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

### UI / Tools

* Figma (UI design)
* Flatpickr
* FullCalendar

### Deployment

* Netlify

### Backend Integration

* Spring Boot REST API
* PostgreSQL database

---

## Design Process

WorkCore was first planned and designed in Figma before development. The goal was to create a modern, productivity-focused user experience with simple navigation and strong usability.

---

## Architecture

Frontend communicates with the WorkCore backend API for:

* Authentication
* User account management
* Task CRUD operations
* Secure sessions
* Password recovery flows

Frontend → API → Database

---

## Screenshots

<img width="1440" height="809" alt="Screenshot 2026-04-21 at 1 14 07 AM" src="https://github.com/user-attachments/assets/1804d734-ecdf-49b7-ad4e-f60b130a04b7" />

<img width="1440" height="811" alt="Screenshot 2026-04-21 at 1 15 45 AM" src="https://github.com/user-attachments/assets/16d0db7c-e152-4f4c-bd21-eba493685ba9" />

<img width="1440" height="810" alt="Screenshot 2026-04-21 at 1 17 04 AM" src="https://github.com/user-attachments/assets/1b60df19-561f-4025-b485-a5efc99f2212" />

<img width="1440" height="809" alt="Screenshot 2026-04-21 at 1 17 49 AM" src="https://github.com/user-attachments/assets/1014ac3f-dd8a-4a08-a702-80488d1c96c9" />

---

## Run Locally

```bash id="71nza"
git clone <repo-url>
cd workcore-frontend
open index.html
```

If using local backend:

```javascript id="m12pd"
const API_URL = "http://localhost:8080";
```

---

## Why I Built This

I built WorkCore to strengthen my frontend development skills while creating a polished real-world product connected to a production backend. The project helped me gain experience in UI/UX design, JavaScript architecture, API integration, and deployment workflows.

---

## What I Learned

* Building responsive layouts from scratch
* Designing interfaces in Figma before coding
* Managing frontend state with vanilla JavaScript
* Connecting frontend to REST APIs
* Handling authentication flows
* Building multi-page user experiences
* Improving UX with calendar/date tools

---

## Future Improvements

* React migration
* Drag-and-drop task management
* Dark mode
* Notifications / reminders
* Real-time sync
* Team collaboration features
* Mobile app version
* Custom dashboard item cards

---

## Author

Davon Appolon
GitHub: https://github.com/DavonApp
