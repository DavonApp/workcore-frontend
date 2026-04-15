// ==========================
// GLOBAL STATE
// ==========================

// Holds reference to FullCalendar instance so it can be controlled globally
let calendar;

// Cache DOM elements once to avoid repeated queries
const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.querySelector('.sidebar');

const API_BASE = 'http://localhost:8080/api/tasks';

// Converts flatpickr's m/d/Y to yyyy-MM-dd that Java's LocalDate expects
function formatDateForBackend(dateStr) {
    if (!dateStr) return null;
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
}

// Reads all values off a task card and returns a plain object
function getTaskDataFromCard(card) {
    return {
        title:       card.querySelector('.task-title-input').value,
        description: card.querySelector('.task-desc-input').value,
        dueDate:     formatDateForBackend(card.querySelector('.task-due-input').value),
        dueTime:     card.dataset.dueTime || null,
        category:    card.querySelector('.task-category-input').value || null,
        priority:    card.querySelector('.task-priority-input').value === 'Priority' 
                         ? null 
                         : card.querySelector('.task-priority-input').value.toUpperCase(),
        isCompleted: card.querySelector('input[type="checkbox"]').checked
    };
}

// ==========================
// EMAIL CONTACT FORM SYSTEM
// ==========================


const contactForm = document.getElementById("contact-form");
if (contactForm) {
document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = {
        name: document.querySelector("input[name='name']").value,
        subject: document.querySelector("input[name='subject']").value,
        email: document.querySelector("input[name='email']").value,
        message: document.querySelector("textarea[name='message']").value
    };

    fetch("http://localhost:8080/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.text())
    .then(data => {
        alert("Message sent!");

        document.getElementById("contact-form").reset();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to send message.");
    });
});
}


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
// SEARCH TOGGLE
// ==========================

/*
    Toggles the search input open/closed.
    Targets the parent .search-container with the "open" class,
    which CSS already uses to reveal the input via .search-container.open .search-input.
    Focuses the input on open so the user can type immediately.
    Clears and collapses on close to reset state for next use.
*/
function toggleSearch() {
    const container = document.querySelector('.search-container');
    if (!container) return; // Defensive check in case element isn't on the page

    const isOpen = container.classList.toggle('open');

    if (isOpen) {
        // Expand: focus after transition starts so cursor appears in the field
        const input = document.getElementById('search-input');
        if (input) input.focus();
    } else {
        // Collapse: clear value and reset task visibility
        const input = document.getElementById('search-input');
        if (input) {
            input.value = '';
            filterTasks(''); // Reset any active search filter
        }
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
        fpOptions.minDate = "tomorrow" // Prevents selcting today or past dates

        fpOptions.onChange = function(selectedDates) {
            const selected = selectedDates[0];

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selected <= today) {
                task.style.display = 'none';
            }
        };
    }

    // Change event for flatpickr to save date
    fpOptions.onClose = function() {
        saveTaskCard(task);
    };

    const timeInput = task.querySelector('.task-time-input');
    timeInput.placeholder = "Time";


    // Attach flatpickr to wrapper (enables clicking icon to open calendar)
    flatpickr(task.querySelector('.task-due-wrapper'), fpOptions);


    // Time picker using flatpickr for cross-browser consistency
    flatpickr(task.querySelector('.task-time-input'),{  
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        altInput: true,
        time_24hr: false,
        defaultDate: "09:00",
        onReady: function(selectedDates, dateStr, instance) {
            if (dateStr) {
                task.dataset.dueTime = instance.formatDate(selectedDates[0], "H:i:S")
            }
        },
        onClose: function(selectedDates, dateStr, instance) {
            if(!selectedDates.length) {
                task.dataset.dueTime = null;
                saveTaskCard(task);
                return;
            }
            
            const date = selectedDates[0];

            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = "00";

            const formattedTime = `${hours}:${minutes}:${seconds}`;

            task.dataset.dueTime = formattedTime;

            saveTaskCard(task);
        }
    });

     // Auto-saves whenever user leaves any input field
    task.querySelectorAll('.task-title-input, .task-desc-input, .task-category-input, .task-priority-input').forEach(input => {
        input.addEventListener('change', () => saveTaskCard(task));
    });


        async function saveTaskCard(card) {
        const taskId = card.dataset.taskId;
        const data = getTaskDataFromCard(card);

        if (!data.title) return;

        try {
            const res = await fetch(taskId ? `${API_BASE}/${taskId}` : API_BASE, {
                method: taskId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            // Check if the server actually returned a 200-299 status
            if (!res.ok) {
                console.error(`Server error: ${res.status}`);
                return;
            }

            // Only parse if it's a new task (POST) and the response isn't empty
            if (!taskId) {
                const text = await res.text();
                if (text) {
                const created = await res.json();
                card.dataset.taskId = created.id;
                }
            }
        } catch (err) {
            console.error("Network or parsing error:", err);
        }
    }
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
async function toggleComplete(checkbox) {
    const card = checkbox.closest('.task-card');
    const title = card.querySelector('.task-title-input');
    const taskId = card.dataset.taskId;

    title.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    title.style.opacity        = checkbox.checked ? '0.4' : '1';

    if (taskId) {
        await fetch(`${API_BASE}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // sends session cookie
            body: JSON.stringify(getTaskDataFromCard(card))
        });
    }

    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();
    if (pageTitle === 'Completed' && !checkbox.checked) {
        card.style.display = 'none';
    }
}


/*
    Removes task card 
*/
async function deleteTask(btn) {
    const card = btn.closest('.task-card');
    const taskId = card.dataset.taskId;

    if (taskId) {
        await fetch(`http://localhost:8080/api/tasks/${taskId}`, { 
            method: 'DELETE',
            credentials: 'include' // sends session cookie
        });
    }

    card.remove();
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
// PROFILE EDIT TOGGLE
// ==========================

/*
    Toggles a profile input field between read-only and editable states.
    Saves the previous value so the user can cancel without losing data.
    Accepts the input's ID and the button element that triggered the call.
*/
function toggleEdit(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return; // Defensive check if element isn't on the page

    const isEditing = !input.readOnly;

    if (isEditing) {
        // Save mode: lock the field and persist the new value ---
        input.readOnly = true;
        input.classList.remove('profile-input-active');
        btn.querySelector('p').textContent = 'Edit';

        // Clear saved fallback — value is now committed
        delete input.dataset.prevValue;
    } else {
        // Edit mode: unlock the field and focus it ---
        input.readOnly = false;
        input.classList.add('profile-input-active');
        input.focus();
        btn.querySelector('p').textContent = 'Save';

        // Store current value so Cancel can restore it
        input.dataset.prevValue = input.value;
    }
}

/*
    Cancels an in-progress edit and restores the previous value.
    Only shown while a field is actively being edited.
*/
function cancelEdit(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Restore the saved value if it exists
    if (input.dataset.prevValue !== undefined) {
        input.value = input.dataset.prevValue;
        delete input.dataset.prevValue;
    }

    input.readOnly = true;
    input.classList.remove('profile-input-active');

    // Reset the sibling Edit button text
    const editBtn = btn.closest('.settings-content-row2-right, .settings-content-row3 .settings-content-row2-right')
                        ?.querySelector('.edit-button p');
    if (editBtn) editBtn.textContent = 'Edit';
}

// =============================
// SETTINGS PASSWORD FORM TOGGLE
// =============================
/*
    Toggles the inline password change form open/closed.
    Clears all three fields on collapse to avoid stale input
    persisting if the user reopens the form.
*/
function togglePasswordForm() {
    const form = document.getElementById('password-form');
    if (!form) return;

    const isOpen = form.style.display !== 'none';

    if (isOpen) {
        // Collapse and wipe fields — don't leave passwords sitting in the DOM
        form.style.display = 'none';
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } else {
        form.style.display = 'flex';
        document.getElementById('current-password').focus();
    }
}

/*
    Placeholder for password save logic.
    Validates that new and confirm fields match before proceeding.
    Replace the console.log with a real API call when backend is ready.
*/
function savePassword() {
    const current = document.getElementById('current-password').value;
    const next    = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;

    // Basic client-side guard — backend should validate as well
    if (!current || !next || !confirm) return;

    if (next !== confirm) {
        // TODO: replace with a proper inline error message
        console.warn('Passwords do not match.');
        return;
    }

    // TODO: wire up to backend
    console.log('Password change submitted.');
    togglePasswordForm();
}

// ============================
// SETTINGS DELETE MODAL TOGGLE
// ============================

/*
    Toggles the delete account confirmation modal.
    Uses display toggling to match your existing modal-overlay pattern.
*/
function toggleDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;

    // Flip between hidden and visible — CSS handles the overlay styling
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
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
document.addEventListener('DOMContentLoaded', async () => {

    // Check if user is logged in before loading anything
    const authCheck = await fetch('http://localhost:8080/api/auth/me', {
        credentials: 'include'
    });

    if (!authCheck.ok) {
        window.location.href = 'login.html';
        return; // Stop everything else from running
    }

    // Initialize task system if on task-related page
    if (document.getElementById('task-list')) {
        loadTasks();
    }

    async function loadTasks() {
    const res = await fetch(API_BASE, {
        credentials: 'include' // sends session cookie
    });

    if (!res.ok) {
        console.error("Failed to load tasks:", res.status);
        return; 
    }

    const tasks = await res.json();

    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();

    tasks.forEach(task => {
        // Filter tasks to the right page
        if (pageTitle === 'Today') {
            const today = new Date().toISOString().split('T')[0];
            if (task.dueDate !== today) return;
        }
        if (pageTitle === 'Upcoming') {
            const today = new Date().toISOString().split('T')[0];
            if (!task.dueDate || task.dueDate <= today) return;
        }
        if (pageTitle === 'Completed' && !task.isCompleted) return;

        renderTaskCard(task, pageTitle);
    });

    // Always keep the blank "add new" card at the bottom
    addTask();
    }

    function renderTaskCard(task, pageTitle) {
    const taskList = document.getElementById('task-list');
    const card = createTaskCard(
        pageTitle === 'Today',
        pageTitle === 'Completed',
        pageTitle === 'Upcoming'
    );

    // Store the backend ID on the card so save/delete know which task to target
    card.dataset.taskId = task.id;

    card.querySelector('.task-title-input').value       = task.title || '';
    card.querySelector('.task-desc-input').value        = task.description || '';
    card.querySelector('.task-category-input').value    = task.category || '';
    card.dataset.dueTime = task.dueTime || null;

    if (task.dueTime) {
    const timeInput = card.querySelector('.task-time-input');
    const fpInstance = timeInput._flatpickr;
    if (fpInstance) {
        fpInstance.setDate(task.dueTime); // e.g. "02:00:00"
    }
}

    // Convert yyyy-MM-dd back to m/d/Y for flatpickr display
    if (task.dueDate) {
        const [y, m, d] = task.dueDate.split('-');
        card.querySelector('.task-due-input').value = `${parseInt(m)}/${parseInt(d)}/${y}`;
    }

    if (task.priority) {
        const sel = card.querySelector('.task-priority-input');
        sel.value = task.priority.charAt(0) + task.priority.slice(1).toLowerCase();
        updatePriorityColor(sel);
    }

    if (task.isCompleted) {
        const checkbox = card.querySelector('input[type="checkbox"]');
        const title    = card.querySelector('.task-title-input');
        checkbox.checked = true;
        title.style.textDecoration = 'line-through';
        title.style.opacity = '0.4';
    }

    taskList.appendChild(card);
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
                Dynamic Data for FullCalendar page
            */
            events: async function(fetchInfo, successCallback, failureCallback) {
                try {
                    const res = await fetch(API_BASE, {
                        credentials: 'include' // sends session cookie
                    });
                    const tasks = await res.json();

                    const priorityColors = {
                        HIGH: '#6B0504',
                        MEDIUM: '#b45309',
                        LOW: '#1e5631',
                        null: '#3788d8' // defauly for no priority
                    };

                    const events = tasks
                        .filter(task => task.dueDate) // Skips tasks wiht no due date
                        .map(task => ({
                            title: task.title || '(Untitled)',
                            start: task.dueTime
                                ? `${task.dueDate}T${task.dueTime}`
                                : task.dueDate,
                            backgroundColor: priorityColors[task.priority] ?? priorityColors[null],
                            borderColor: priorityColors[task.priority] ?? priorityColors[null],
                            textDecoration: task.isCompleted ? 'line-through' : '',
                            opacity:        task.isCompleted ? '0.5' : '1',
                            extendedProps: {
                                description: task.description,
                                category:    task.category,
                                isCompleted: task.isCompleted
                            }
                        }));
                    successCallback(events);
                } catch (err) {
                    console.error('Failed to load calendar events:', err);
                    failureCallback(err);
                }
            },

            // Debug + interaction hooks for future features
            select: function(info) {
                console.log("Selected: " + info.startStr + " to " + info.endStr);
            },

            eventClick: function(info) {
                const {description, category, isCompleted } = info.event.extendedProps;
                alert(
                    `${info.event.title}\n` +
                    `${description ? 'Notes: ' + description + '\n' : ''}` +
                    `${category ? 'Category: ' + category + '\n' : ''}` +
                    `Status: ${isCompleted ? 'Completed' : 'Incomplete'}`
                );
            },

            datesSet: function(info) {
                console.log("Showing: " + info.view.title);
            }
        });

        calendar.render();
    }
});