// ==========================
// GLOBAL STATE
// ==========================

// Holds reference to FullCalendar instance so it can be controlled globally
let calendar;

// Cache DOM elements once to avoid repeated queries
const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.querySelector('.sidebar');


// ==========================
// SIDEBAR INTERACTIONS
// ==========================

/*
    Toggles sidebar open/closed state.
    Also ensures any expanded submenus are reset when collapsing,
    preventing inconsistent UI states.
*/
function toggleSidebar() {
    if (!sidebar) return; // Defensive check in case element doesn't exist on page

    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');

    // Close all open submenus when sidebar is collapsed
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show');
        ul.previousElementSibling.classList.remove('rotate');
    });
}

/*
    Handles expanding/collapsing nested sidebar menus.
    Automatically reopens sidebar if user interacts while it's collapsed,
    improving usability.
*/
function toggleSubMenu(button) {
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    // Ensure sidebar is open if user interacts with submenu
    if (sidebar.classList.contains('close')) {
        sidebar.classList.toggle('close');
        toggleButton.classList.toggle('rotate');
    }
}


// ==========================
// TASK CARD SYSTEM
// ==========================

/*
    Factory function for generating task cards dynamically.

    Uses flags (Today, Completed, Upcoming) instead of separate functions
    to avoid duplication and centralize task creation logic.
*/
function createTaskCard(isTodayPage = false, isCompletedPage = false, isUpcomingPage = false) {

    const task = document.createElement('div');
    task.classList.add('task-card');

    // Template-based creation keeps structure consistent 
    task.innerHTML = `
        <div class="task-card-header">
            <input type="checkbox" onchange="toggleComplete(this)">
            <input type="text" class="task-title-input" placeholder="Task name">
            <button class="delete-btn" onclick="deleteTask(this)">✕</button>
        </div>

        <textarea class="task-desc-input" placeholder="Description"></textarea>

        <div class="task-meta">
            <div class="task-due-wrapper">
                <!-- Using wrapper allows flatpickr "wrap" mode for better styling control -->
                <img src="Images/calendar_month_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" 
                     alt="Calendar" class="due-icon" data-toggle>
                <input type="text" class="task-due-input" data-input>
            </div>

            <div class="task-time-wrapper">
                <input type="time" class="task-time-input">
            </div>

            <!-- Categories kept simple for MVP; can be expanded later -->
            <select class="task-category-input">
                <option value="">Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="School">School</option>
            </select>

            <!-- Priority drives visual styling via CSS classes -->
            <select class="task-priority-input priority-default" onchange="updatePriorityColor(this)">
                <option value="Priority">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </div>`;

    /*
        If rendering on Completed page, pre-apply completed styles.
        This avoids needing separate rendering logic elsewhere.
    */
    if (isCompletedPage) {
        const checkbox = task.querySelector('input[type="checkbox"]');
        const title = task.querySelector('.task-title-input');

        checkbox.checked = true;
        title.style.textDecoration = 'line-through';
        title.style.opacity = '0.4';
    }

    // ==========================
    // DATE PICKER (FLATPICKR)
    // ==========================

    /*
        Shared configuration object for flatpickr instances.
    */
    const fpOptions = { 
        dateFormat: "m/d/Y",
        wrap: true,       // Enables custom UI trigger via wrapper
        allowInput: true  // Allows manual typing for flexibility
    };

    // Attach flatpickr to wrapper (enables clicking icon to open calendar)
    flatpickr(task.querySelector('.task-due-wrapper'), fpOptions);

    /*
        Today Page Behavior:
        - Default to today's date
        - Hide tasks if user changes date away from today
    */
    if (isTodayPage) {
        fpOptions.defaultDate = "today";

        fpOptions.onChange = function(selectedDates, dateStr) {
            const todayStr = flatpickr.formatDate(new Date(), "m/d/Y");

            if (dateStr !== todayStr && dateStr !== "") {
                task.style.display = 'none';
            }
        };
    }

    /*
        Upcoming Page Behavior:
        - Default to tomorrow
        - Hide tasks scheduled for today or past dates
    */
    if (isUpcomingPage) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        fpOptions.defaultDate = tomorrow;

        fpOptions.onChange = function(selectedDates) {
            const selected = selectedDates[0];

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selected <= today) {
                task.style.display = 'none';
            }
        };
    }

    // Attach flatpickr directly to input as well (ensures proper binding)
    flatpickr(task.querySelector('.task-due-input'), fpOptions);

    return task;
}


/*
    Adds a new task to the current page.

    Uses page title as a simple state indicator 
*/
function addTask() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();

    taskList.appendChild(
        createTaskCard(
            pageTitle === 'Today',
            pageTitle === 'Completed',
            pageTitle === 'Upcoming'
        )
    );
}


/*
    Updates priority styling dynamically based on selection.
    Uses CSS classes instead of inline styles for scalability.
*/
function updatePriorityColor(select) {
    select.className = 'task-priority-input';

    if (select.value === 'High') select.classList.add('priority-high');
    else if (select.value === 'Medium') select.classList.add('priority-medium');
    else if (select.value === 'Low') select.classList.add('priority-low');
    else select.classList.add('priority-default');
}


/*
    Toggles task completion state visually.
    Also enforces filtering logic on Completed page.
*/
function toggleComplete(checkbox) {
    const card = checkbox.closest('.task-card');
    const title = card.querySelector('.task-title-input');

    title.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    title.style.opacity = checkbox.checked ? '0.4' : '1';

    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();

    // Hide task if it no longer belongs on Completed page
    if (pageTitle === 'Completed' && !checkbox.checked) {
        card.style.display = 'none';
    }
}


/*
    Removes task card from DOM.
    Simple client-side deletion (no persistence yet).
*/
function deleteTask(btn) {
    btn.closest('.task-card').remove();
}


/*
    Filters tasks in real-time based on user input.
    Matches both title and description for better UX.
*/
function filterTasks(query) {
    const cards = document.querySelectorAll('.task-card');
    const lower = query.toLowerCase();

    cards.forEach(card => {
        const title = card.querySelector('.task-title-input').value.toLowerCase();
        const desc = card.querySelector('.task-desc-input').value.toLowerCase();

        card.style.display =
            (title.includes(lower) || desc.includes(lower)) ? '' : 'none';
    });
}


// ==========================
// CALENDAR CONTROLS
// ==========================

/*
    Changes FullCalendar view (month/week/day).
    Also updates active button styling for visual feedback.
*/
function changeCalendarView(viewName, btnElement) {
    if (!calendar) return;

    calendar.changeView(viewName);

    document.querySelectorAll('.view-btn').forEach(b =>
        b.classList.remove('active')
    );

    btnElement.classList.add('active');
}


// ==========================
// INITIALIZATION (ENTRY POINT)
// ==========================

/*
    Centralized initialization logic.
    Ensures scripts only run after DOM is fully loaded,
    preventing null reference errors.
*/
document.addEventListener('DOMContentLoaded', () => {

    // Initialize task system if on task-related page
    if (document.getElementById('task-list')) {
        addTask();
    }

    // Attach live search filtering
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) =>
            filterTasks(e.target.value)
        );
    }

    // ==========================
    // FULLCALENDAR SETUP
    // ==========================

    const calendarEl = document.getElementById('calendar');

    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {

            // Default monthly view
            initialView: 'dayGridMonth',

            // Custom header configuration for cleaner UI
            headerToolbar: {
                left: 'prev next today',
                center: 'title',
                right: ''
            },

            height: 650,

            // Visual + interaction features
            nowIndicator: true,
            selectable: true,
            unselectAuto: true,
            navLinks: true,
            selectMirror: true,

            /*
                Static sample event.
                Placeholder until backend integration replaces this with dynamic data.
            */
            events: [
                {
                    title: 'Work Project (High)',
                    start: new Date().toISOString().split('T')[0],
                    backgroundColor: '#6B0504',
                    borderColor: '#6B0504'
                }
            ],

            // Debug + interaction hooks for future features
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