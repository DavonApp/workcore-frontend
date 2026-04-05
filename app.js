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

function createTaskCard() {
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
            <select class="task-priority-input">
                <option value="">Priority</option>
                <option value="Hight">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </div>
    `;

    flatpickr(task.querySelector('.task-due-input'), { dateFormat: "m/d/Y" });

    return task;
}

function addTask() {
    const taskList = document.getElementById('task-list');
    taskList.appendChild(createTaskCard());
}

function toggleComplete(checkbox) {
    const title = checkbox.closest('.task-card').querySelector('.task-title-input');
    title.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    title.style.opacity = checkbox.checked ? '0.4' : '1';
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