// GLOBAL VARIABLES
let calendar;
const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.querySelector('.sidebar');

// SIDEBAR LOGIC
function toggleSidebar() {
    if (!sidebar) return;
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show');
        ul.previousElementSibling.classList.remove('rotate');
    });
}

function toggleSubMenu(button) {
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');
    if (sidebar.classList.contains('close')) {
        sidebar.classList.toggle('close');
        toggleButton.classList.toggle('rotate');
    }
}

// TASK CARD ENGINE
function createTaskCard(isTodayPage = false, isCompletedPage = false, isUpcomingPage = false) {
    const task = document.createElement('div');
    task.classList.add('task-card');
    task.innerHTML = `
        <div class="task-card-header">
            <input type="checkbox" onchange="toggleComplete(this)">
            <input type="text" class="task-title-input" placeholder="Task name">
            <button class="delete-btn" onclick="deleteTask(this)">✕</button>
        </div>
        <textarea class="task-desc-input" placeholder="Description"></textarea>
        <div class="task-meta">
            <div class="task-due-wrapper">
                <img src="Images/calendar_month_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Calendar" class="due-icon" data-toggle>
                <input type="text" class="task-due-input" data-input>
            </div>
            <div class="task-time-wrapper">
                <input type="time" class="task-time-input">
            </div>
            <select class="task-category-input">
                <option value="">Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="School">School</option>
            </select>
            <select class="task-priority-input priority-default" onchange="updatePriorityColor(this)">
                <option value="Priority">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </div>`;

    if (isCompletedPage) {
        const checkbox = task.querySelector('input[type="checkbox"]');
        const title = task.querySelector('.task-title-input');
        checkbox.checked = true;
        title.style.textDecoration = 'line-through';
        title.style.opacity = '0.4';
    }

    // FLATPICKR LOGIC 
    const fpOptions = { 
        dateFormat: "m/d/Y",
        wrap: true,
        allowInput: true 
    };

    // Target the wrapper DIV instead of just the input
    flatpickr(task.querySelector('.task-due-wrapper'), fpOptions);

    if (isTodayPage) {
        fpOptions.defaultDate = "today";
        fpOptions.onChange = function(selectedDates, dateStr) {
            const todayStr = flatpickr.formatDate(new Date(), "m/d/Y");
            if (dateStr !== todayStr && dateStr !== "") task.style.display = 'none';
        };
    }

    if (isUpcomingPage) {
        // Set default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        fpOptions.defaultDate = tomorrow;

        fpOptions.onChange = function(selectedDates, dateStr) {
            const selected = selectedDates[0];
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            // Hide if selected date is today or in the past
            if (selected <= today) {
                task.style.display = 'none';
            }
        };
    }

    flatpickr(task.querySelector('.task-due-input'), fpOptions);
    return task;
}

function addTask() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();
    taskList.appendChild(createTaskCard(pageTitle === 'Today', pageTitle === 'Completed', pageTitle === 'Upcoming'));
}

function updatePriorityColor(select) {
    select.className = 'task-priority-input';
    if (select.value === 'High') select.classList.add('priority-high');
    else if (select.value === 'Medium') select.classList.add('priority-medium');
    else if (select.value === 'Low') select.classList.add('priority-low');
    else select.classList.add('priority-default');
}

function toggleComplete(checkbox) {
    const card = checkbox.closest('.task-card');
    const title = card.querySelector('.task-title-input');
    title.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    title.style.opacity = checkbox.checked ? '0.4' : '1';
    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();
    if (pageTitle === 'Completed' && !checkbox.checked) card.style.display = 'none';
}

function deleteTask(btn) { btn.closest('.task-card').remove(); }

function filterTasks(query) {
    const cards = document.querySelectorAll('.task-card');
    const lower = query.toLowerCase();
    cards.forEach(card => {
        const title = card.querySelector('.task-title-input').value.toLowerCase();
        const desc = card.querySelector('.task-desc-input').value.toLowerCase();
        card.style.display = (title.includes(lower) || desc.includes(lower)) ? '' : 'none';
    });
}

// CALENDAR CONTROLS
function changeCalendarView(viewName, btnElement) {
    if (!calendar) return;
    calendar.changeView(viewName);
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
}

// SINGLE SOURCE OF TRUTH FOR LOADING
document.addEventListener('DOMContentLoaded', () => {
    // Handle Task Pages
    if (document.getElementById('task-list')) {
        addTask();
    }

    // Handle Search Bar 
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterTasks(e.target.value));
    }

    // INITIALIZE CALENDAR
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev next today',
                center: 'title',
                right: ''
            },
            height: 650,
            nowIndicator: true,    // Shows a red line on the current time in Week/Day views
            selectable: true,      // Allows clicking/highlighting days
            unselectAuto: true,    // Deselects when clicking outside
            navLinks: true,        // Click day numbers to drill down
            selectMirror: true,    // Shows a "ghost" selection while dragging
            // ----------------------------

            events: [
                {
                    title: 'Work Project (High)',
                    start: new Date().toISOString().split('T')[0],
                    backgroundColor: '#6B0504',
                    borderColor: '#6B0504'
                }
            ],
            
            select: function(info) {
                console.log("Selected: " + info.startStr + " to " + info.endStr);
            },
            eventClick: function(info) {
                alert('Event: ' + info.event.title);
            },
            datesSet: function(info) {
                console.log("Showing: " + info.view.title);
            }
        });
        calendar.render();
    }
});