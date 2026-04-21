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

WorkCore began as a UI/UX concept in Figma before development started. Designing first helped define the user journey, layout structure, and feature priorities before writing code.

### Goals

* Create a clean and modern productivity interface
* Keep navigation simple and intuitive
* Prioritize speed and usability
* Build a layout that scales across multiple pages

### Figma Planning Included

* Homepage wireframes
* Dashboard layouts
* Authentication flows
* Task management screens
* Settings pages
* Responsive mobile concepts

### From Design to Development

After finalizing layouts in Figma, the frontend was built using HTML, CSS, and JavaScript while preserving the original design direction and improving usability during development.

### Design Preview

<img width="490" height="783" alt="Screenshot 2026-04-21 at 1 49 18 AM" src="https://github.com/user-attachments/assets/cee9906f-a6f2-466b-8328-d8e8eea7ec61" />

<img width="501" height="650" alt="Screenshot 2026-04-21 at 1 50 49 AM" src="https://github.com/user-attachments/assets/ad80c60f-831c-4319-b8c7-0858b13085cc" />

<img width="784" height="566" alt="Screenshot 2026-04-21 at 1 52 14 AM" src="https://github.com/user-attachments/assets/b062d47e-0dd1-4386-9c1c-8b7318bac1be" />

<img width="795" height="560" alt="Screenshot 2026-04-21 at 1 53 00 AM" src="https://github.com/user-attachments/assets/d09d4b06-81a1-442a-af6b-33d41fbeed66" />

<img width="810" height="535" alt="Screenshot 2026-04-21 at 1 53 13 AM" src="https://github.com/user-attachments/assets/74176693-3970-48fb-8249-cda9b99d0b8c" />

<img width="809" height="552" alt="Screenshot 2026-04-21 at 1 53 27 AM" src="https://github.com/user-attachments/assets/57e78cac-aab3-4b6b-a952-00e6e160c77a" />

<img width="811" height="742" alt="Screenshot 2026-04-21 at 1 53 40 AM" src="https://github.com/user-attachments/assets/333dc46d-9cb4-4764-b56f-e2947069c47c" />


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
