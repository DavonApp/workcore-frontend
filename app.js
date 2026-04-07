const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.querySelector('.sidebar')

function toggleSidebar() {
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')

    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show')
        ul.previousElementSibling.classList.remove('rotate')
    })
}

function toggleSubMenu(button){
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if(sidebar.classList.contains('close')){
        sidebar.classList.toggle('close')
        toggleButton.classList.toggle('rotate')
    }

}

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
                <img src="Images/calendar_month_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Calendar Icon" class="due-icon">
                <input type="date" class="task-due-input" placeholder="Due date">
            </div>
            <select class="task-category-input">
                <option value="">Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="School">School</option>
                <option value="Other">Other</option>
            </select>
            <select class="task-priority-input priority-default" onchange="updatePriorityColor(this)">
                <option value="Priority">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </div>
    `;

    if (isCompletedPage) {
        const checkbox = task.querySelector('input[type="checkbox"]');
        const title = task.querySelector('.task-title-input');
        checkbox.checked = true;
        title.style.textDecoration = 'line-through';
        title.style.opacity = '0.4';
    }

    const fpOptions = { dateFormat: "m/d/Y" };

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
            today.setHours(0,0,0,0); // Reset time to compare only date

            // If selected date is today or earlier, hide it from Upcoming
            if (selected <= today) {
                task.style.display = 'none';
            }
        };
    }

    flatpickr(task.querySelector('.task-due-input'), fpOptions);
    return task;
}

function updatePriorityColor(select) {
    select.className = 'task-priority-input';
    switch(select.value) {
        case 'High': select.classList.add('priority-high'); break;
        case 'Medium': select.classList.add('priority-medium'); break;
        case 'Low': select.classList.add('priority-low'); break;
        default: select.classList.add('priority-default');
    }
}

function addTask() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    const pageTitle = document.querySelector('.dashboard-header h2')?.textContent.trim();
    
    const isTodayPage = pageTitle === 'Today';
    const isCompletedPage = pageTitle === 'Completed';
    const isUpcomingPage = pageTitle === 'Upcoming';
    
    taskList.appendChild(createTaskCard(isTodayPage, isCompletedPage, isUpcomingPage));
}

function toggleComplete(checkbox) {
    const card = checkbox.closest('.task-card');
    const title = card.querySelector('.task-title-input');
    
    // Toggle styles
    title.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    title.style.opacity = checkbox.checked ? '0.4' : '1';

    // Check if we are currently on the "Completed" page
    const pageTitle = document.querySelector('.dashboard-header h2');
    const isCompletedPage = pageTitle && pageTitle.textContent.trim() === 'Completed';

    // If we are on the Completed page and the user unchecks the box, hide the card
    if (isCompletedPage && !checkbox.checked) {
        card.style.display = 'none';
    }
}

function deleteTask(btn) {
    btn.closest('.task-card').remove();
}



// Start with one card on load
document.addEventListener('DOMContentLoaded', () => {
    addTask();
});

function toggleSearch() {
    const container = document.querySelector('.search-container');
    const input = document.getElementById('search-input');
    container.classList.toggle('open');
    if (container.classList.contains('open')) {
        input.focus();
    } else {
        input.value = '';
        filterTasks(''); // reset all cards visible
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const container = document.querySelector('.search-container');
        if (container.classList.contains('open')) toggleSearch();
    }
});

document.getElementById('search-input').addEventListener('input', (e) => {
    filterTasks(e.target.value);
});

function filterTasks(query) {
    const cards = document.querySelectorAll('.task-card');
    const lower = query.toLowerCase();
    cards.forEach(card => {
        const title = card.querySelector('.task-title-input').value.toLowerCase();
        const desc = card.querySelector('.task-desc-input').value.toLowerCase();
        const match = title.includes(lower) || desc.includes(lower);
        card.style.display = match ? '' : 'none';
    });
}

function toggleEdit(inputId, btn) {
    const input = document.getElementById(inputId);
    const isEditing = !input.readOnly;
    const label = btn.querySelector('p');

    if (isEditing) {
        // Save clicked
        input.readOnly = true;
        label.textContent = 'Edit';
        btn.classList.remove('saving');
        // Later: add your fetch/POST call here to save to backend
    } else {
        // Edit clicked
        input.readOnly = false;
        input.focus();
        label.textContent = 'Save';
        btn.classList.add('saving');
    }
}

btn.classList.toggle('saving');

function togglePasswordForm() {
    const form = document.getElementById('password-form');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

function savePassword() {
    const lastChanged = document.getElementById('last-changed');
    const now = new Date();
    lastChanged.textContent = 'Last changed: ' + now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    togglePasswordForm();
    // Later: add your fetch/POST call here
}

function toggleDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

document.getElementById('delete-modal').addEventListener('click', function(e) {
    if (e.target === this) toggleDeleteModal();
});

function setView(btn) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}