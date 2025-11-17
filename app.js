// TaskMaster - Student Task Management App

class TaskManager {
    constructor() {
        this.tasks = [];
        this.subjects = ["Mathematics", "History", "Science", "English", "Art", "Physical Education", "Music"];
        this.priorities = ["high", "medium", "low"];
        this.achievements = [
            {"id": "first_task", "name": "First Steps", "description": "Complete your first task", "icon": "🎯", "unlocked": false},
            {"id": "week_streak", "name": "Week Warrior", "description": "Complete tasks for 7 days in a row", "icon": "🔥", "unlocked": false},
            {"id": "subject_master", "name": "Subject Master", "description": "Complete 10 tasks in one subject", "icon": "🏆", "unlocked": false},
            {"id": "priority_master", "name": "Priority Master", "description": "Complete 20 high priority tasks", "icon": "⭐", "unlocked": false},
            {"id": "task_creator", "name": "Task Creator", "description": "Create 50 tasks", "icon": "📝", "unlocked": false},
            {"id": "level_master", "name": "Level Master", "description": "Reach level 10", "icon": "👑", "unlocked": false}
        ];
        this.userStats = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            totalTasks: 0,
            completedTasks: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastCompletionDate: null
        };
        this.currentView = 'dashboard';
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.initEventListeners();
        this.populateSubjects();
        this.renderCurrentView();
        this.updateStats();
        this.checkAchievements();
        
        // Load sample data if no tasks exist
        if (this.tasks.length === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleTasks = [
            {
                "id": "1",
                "title": "Complete Math Assignment",
                "description": "Solve problems 1-20 from Chapter 5",
                "subject": "Mathematics",
                "priority": "high",
                "dueDate": "2025-08-20",
                "completed": false,
                "createdAt": "2025-08-15",
                "subtasks": ["Review formulas", "Solve odd problems", "Check answers"]
            },
            {
                "id": "2", 
                "title": "Read History Chapter",
                "description": "Chapter 12: World War II",
                "subject": "History",
                "priority": "medium",
                "dueDate": "2025-08-22",
                "completed": true,
                "createdAt": "2025-08-14",
                "subtasks": ["Read chapter", "Take notes", "Create summary"]
            }
        ];
        
        this.tasks = sampleTasks;
        this.userStats.totalTasks = 2;
        this.userStats.completedTasks = 1;
        this.userStats.xp = 50;
        this.saveData();
        this.updateStats();
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', this.toggleTheme.bind(this));

        // FAB and Add Task buttons
        document.getElementById('fab-add-task').addEventListener('click', () => this.openTaskModal());
        document.getElementById('add-task-btn').addEventListener('click', () => this.openTaskModal());

        // Modal controls
        document.getElementById('modal-close').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancel-task').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('task-form').addEventListener('submit', this.handleTaskSubmit.bind(this));

        // Subtask management
        document.getElementById('add-subtask').addEventListener('click', this.addSubtaskField.bind(this));

        // Search and filters
        document.getElementById('task-search').addEventListener('input', this.filterTasks.bind(this));
        document.getElementById('subject-filter').addEventListener('change', this.filterTasks.bind(this));
        document.getElementById('priority-filter').addEventListener('change', this.filterTasks.bind(this));

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));

        // Close modal when clicking outside
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') {
                this.closeTaskModal();
            }
        });
    }

    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;
        this.renderCurrentView();
    }

    renderCurrentView() {
        switch(this.currentView) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'tasks':
                this.renderTasks();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'achievements':
                this.renderAchievements();
                break;
        }
    }

    renderDashboard() {
        this.updateStatsCards();
        this.renderUpcomingTasks();
        this.renderProgressChart();
    }

    updateStatsCards() {
        const now = new Date();
        const overdueTasks = this.tasks.filter(task => 
            !task.completed && new Date(task.dueDate) < now
        ).length;

        document.getElementById('total-tasks').textContent = this.userStats.totalTasks;
        document.getElementById('completed-tasks').textContent = this.userStats.completedTasks;
        document.getElementById('overdue-tasks').textContent = overdueTasks;
        document.getElementById('current-streak').textContent = this.userStats.currentStreak;
        document.getElementById('dashboard-level').textContent = this.userStats.level;
        document.getElementById('current-xp').textContent = this.userStats.xp;
        document.getElementById('next-level-xp').textContent = this.userStats.xpToNextLevel;

        // Update XP progress bar
        const progressPercent = (this.userStats.xp / this.userStats.xpToNextLevel) * 100;
        document.getElementById('xp-progress').style.width = `${progressPercent}%`;
    }

    renderUpcomingTasks() {
        const upcomingContainer = document.getElementById('upcoming-tasks');
        const upcomingTasks = this.tasks
            .filter(task => !task.completed)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        if (upcomingTasks.length === 0) {
            upcomingContainer.innerHTML = '<p style="color: var(--color-text-secondary);">No upcoming tasks. Great job!</p>';
            return;
        }

        upcomingContainer.innerHTML = upcomingTasks.map(task => `
            <div class="upcoming-task">
                <div class="upcoming-task-header">
                    <h4 class="upcoming-task-title">${task.title}</h4>
                    <span class="upcoming-task-subject">${task.subject}</span>
                </div>
                <p class="upcoming-task-due">Due: ${this.formatDate(task.dueDate)}</p>
            </div>
        `).join('');
    }

    renderProgressChart() {
        const ctx = document.getElementById('completionChart').getContext('2d');
        
        if (this.charts.completion) {
            this.charts.completion.destroy();
        }

        const completionRate = this.userStats.totalTasks > 0 
            ? Math.round((this.userStats.completedTasks / this.userStats.totalTasks) * 100)
            : 0;

        this.charts.completion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [this.userStats.completedTasks, this.userStats.totalTasks - this.userStats.completedTasks],
                    backgroundColor: ['#21bf06', '#f0f0f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    }

    renderTasks() {
        this.filterTasks();
    }

    filterTasks() {
        const searchTerm = document.getElementById('task-search').value.toLowerCase();
        const subjectFilter = document.getElementById('subject-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;

        let filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                task.description.toLowerCase().includes(searchTerm);
            const matchesSubject = !subjectFilter || task.subject === subjectFilter;
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;

            return matchesSearch && matchesSubject && matchesPriority;
        });

        // Sort tasks: incomplete first, then by due date
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        this.renderTaskList(filteredTasks);
    }

    renderTaskList(tasks) {
        const container = document.getElementById('tasks-container');
        
        if (tasks.length === 0) {
            container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">No tasks found.</p>';
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');

        // Add event listeners to task actions
        container.querySelectorAll('.btn-icon.complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                this.toggleTaskComplete(taskId);
            });
        });

        container.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                this.editTask(taskId);
            });
        });

        container.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    createTaskHTML(task) {
        const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
        const dueDateClass = isOverdue ? 'overdue' : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-subject">${task.subject}</span>
                    <span class="task-due-date ${dueDateClass}">Due: ${this.formatDate(task.dueDate)}</span>
                </div>
                ${task.subtasks && task.subtasks.length > 0 ? `
                    <div class="subtasks">
                        ${task.subtasks.map(subtask => `<span class="subtask">• ${subtask}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="task-actions">
                    <button class="btn-icon complete" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="btn-icon edit" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        document.getElementById('current-month').textContent = 
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let calendarHTML = '';
        
        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-day-header" style="font-weight: bold; text-align: center; padding: 8px; color: var(--color-text-secondary);">${day}</div>`;
        });
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const tasksForDay = this.tasks.filter(task => task.dueDate === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (tasksForDay.length > 0) classes += ' has-tasks';
            
            calendarHTML += `
                <div class="${classes}">
                    <div style="font-weight: ${isToday ? 'bold' : 'normal'};">${day}</div>
                    ${tasksForDay.length > 0 ? `<div style="font-size: 10px; color: var(--app-accent);">${tasksForDay.length} task${tasksForDay.length > 1 ? 's' : ''}</div>` : ''}
                </div>
            `;
        }
        
        document.getElementById('calendar-grid').innerHTML = calendarHTML;
    }

    renderAnalytics() {
        this.renderSubjectChart();
        this.renderPriorityChart();
        this.renderWeeklyChart();
        this.updateAnalyticsMetrics();
    }

    renderSubjectChart() {
        const ctx = document.getElementById('subjectChart').getContext('2d');
        
        if (this.charts.subject) {
            this.charts.subject.destroy();
        }

        const subjectCounts = {};
        this.subjects.forEach(subject => subjectCounts[subject] = 0);
        
        this.tasks.forEach(task => {
            if (subjectCounts.hasOwnProperty(task.subject)) {
                subjectCounts[task.subject]++;
            }
        });

        this.charts.subject = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(subjectCounts),
                datasets: [{
                    label: 'Tasks by Subject',
                    data: Object.values(subjectCounts),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderPriorityChart() {
        const ctx = document.getElementById('priorityChart').getContext('2d');
        
        if (this.charts.priority) {
            this.charts.priority.destroy();
        }

        const priorityCounts = { high: 0, medium: 0, low: 0 };
        this.tasks.forEach(task => {
            priorityCounts[task.priority]++;
        });

        this.charts.priority = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['High Priority', 'Medium Priority', 'Low Priority'],
                datasets: [{
                    data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
                    backgroundColor: ['#ff4d6b', '#ff9500', '#21bf06']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderWeeklyChart() {
        const ctx = document.getElementById('weeklyChart').getContext('2d');
        
        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        // Generate last 7 days data
        const last7Days = [];
        const completionData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            // Count completed tasks for this day
            const completedThisDay = this.tasks.filter(task => 
                task.completed && task.completedDate === dateStr
            ).length;
            
            completionData.push(completedThisDay);
        }

        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Tasks Completed',
                    data: completionData,
                    borderColor: '#3b86d1',
                    backgroundColor: 'rgba(59, 134, 209, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateAnalyticsMetrics() {
        const topSubject = this.getTopSubject();
        document.getElementById('top-subject').textContent = topSubject || 'None';
        document.getElementById('best-streak').textContent = this.userStats.bestStreak;
        document.getElementById('total-xp').textContent = this.userStats.xp;
    }

    getTopSubject() {
        const subjectCounts = {};
        this.tasks.forEach(task => {
            if (task.completed) {
                subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
            }
        });
        
        return Object.keys(subjectCounts).reduce((a, b) => 
            subjectCounts[a] > subjectCounts[b] ? a : b, null);
    }

    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        
        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
                ${achievement.unlocked ? '<div class="achievement-status" style="color: var(--app-success); font-weight: bold; margin-top: 8px;">✓ Unlocked</div>' : ''}
            </div>
        `).join('');
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const title = document.getElementById('modal-title');
        
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-subject').value = task.subject;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-due-date').value = task.dueDate;
            
            // Populate subtasks
            const container = document.getElementById('subtasks-container');
            container.innerHTML = '';
            if (task.subtasks) {
                task.subtasks.forEach(subtask => {
                    this.addSubtaskField(subtask);
                });
            }
        } else {
            title.textContent = 'Add New Task';
            form.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('subtasks-container').innerHTML = '';
        }
        
        modal.classList.remove('hidden');
    }

    closeTaskModal() {
        document.getElementById('task-modal').classList.add('hidden');
    }

    addSubtaskField(value = '') {
        const container = document.getElementById('subtasks-container');
        const subtaskDiv = document.createElement('div');
        subtaskDiv.className = 'subtask-item';
        subtaskDiv.innerHTML = `
            <input type="text" class="form-control subtask-input" placeholder="Enter subtask..." value="${value}">
            <button type="button" class="subtask-remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        subtaskDiv.querySelector('.subtask-remove').addEventListener('click', () => {
            subtaskDiv.remove();
        });
        
        container.appendChild(subtaskDiv);
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            id: document.getElementById('task-id').value || this.generateId(),
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            subject: document.getElementById('task-subject').value,
            priority: document.getElementById('task-priority').value,
            dueDate: document.getElementById('task-due-date').value,
            completed: false,
            createdAt: new Date().toISOString().split('T')[0],
            subtasks: Array.from(document.querySelectorAll('.subtask-input'))
                .map(input => input.value.trim())
                .filter(value => value)
        };
        
        const existingTaskIndex = this.tasks.findIndex(task => task.id === taskData.id);
        
        if (existingTaskIndex >= 0) {
            // Update existing task
            taskData.completed = this.tasks[existingTaskIndex].completed;
            taskData.createdAt = this.tasks[existingTaskIndex].createdAt;
            this.tasks[existingTaskIndex] = taskData;
            this.showToast('Task updated successfully!', 'success');
        } else {
            // Add new task
            this.tasks.push(taskData);
            this.userStats.totalTasks++;
            this.showToast('Task created successfully!', 'success');
        }
        
        this.saveData();
        this.updateStats();
        this.checkAchievements();
        this.renderCurrentView();
        this.closeTaskModal();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        
        if (task.completed) {
            task.completedDate = new Date().toISOString().split('T')[0];
            this.userStats.completedTasks++;
            this.addXP(this.getXPForPriority(task.priority));
            this.updateStreak();
            this.showToast(`Task completed! +${this.getXPForPriority(task.priority)} XP`, 'success');
        } else {
            delete task.completedDate;
            this.userStats.completedTasks--;
            this.showToast('Task marked as incomplete', 'warning');
        }
        
        this.saveData();
        this.updateStats();
        this.checkAchievements();
        this.renderCurrentView();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.openTaskModal(task);
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex >= 0) {
                const task = this.tasks[taskIndex];
                if (task.completed) {
                    this.userStats.completedTasks--;
                }
                this.tasks.splice(taskIndex, 1);
                this.userStats.totalTasks--;
                this.saveData();
                this.updateStats();
                this.renderCurrentView();
                this.showToast('Task deleted', 'warning');
            }
        }
    }

    getXPForPriority(priority) {
        const xpValues = { high: 30, medium: 20, low: 10 };
        return xpValues[priority] || 10;
    }

    addXP(amount) {
        this.userStats.xp += amount;
        
        while (this.userStats.xp >= this.userStats.xpToNextLevel) {
            this.userStats.xp -= this.userStats.xpToNextLevel;
            this.userStats.level++;
            this.userStats.xpToNextLevel = Math.floor(this.userStats.xpToNextLevel * 1.2);
            this.showToast(`Level up! You are now level ${this.userStats.level}!`, 'success');
        }
        
        // Update header level display
        document.getElementById('user-level').textContent = this.userStats.level;
    }

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (this.userStats.lastCompletionDate === yesterday || !this.userStats.lastCompletionDate) {
            if (this.userStats.lastCompletionDate !== today) {
                this.userStats.currentStreak++;
            }
        } else if (this.userStats.lastCompletionDate !== today) {
            this.userStats.currentStreak = 1;
        }
        
        this.userStats.lastCompletionDate = today;
        
        if (this.userStats.currentStreak > this.userStats.bestStreak) {
            this.userStats.bestStreak = this.userStats.currentStreak;
        }
    }

    checkAchievements() {
        let newAchievements = [];
        
        // First task achievement
        if (!this.achievements.find(a => a.id === 'first_task').unlocked && this.userStats.completedTasks >= 1) {
            this.unlockAchievement('first_task');
            newAchievements.push('First Steps');
        }
        
        // Week streak achievement
        if (!this.achievements.find(a => a.id === 'week_streak').unlocked && this.userStats.currentStreak >= 7) {
            this.unlockAchievement('week_streak');
            newAchievements.push('Week Warrior');
        }
        
        // Subject master achievement
        const subjectCounts = {};
        this.tasks.forEach(task => {
            if (task.completed) {
                subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
            }
        });
        
        if (!this.achievements.find(a => a.id === 'subject_master').unlocked && 
            Object.values(subjectCounts).some(count => count >= 10)) {
            this.unlockAchievement('subject_master');
            newAchievements.push('Subject Master');
        }
        
        // Priority master achievement
        const highPriorityCompleted = this.tasks.filter(task => 
            task.completed && task.priority === 'high').length;
        
        if (!this.achievements.find(a => a.id === 'priority_master').unlocked && highPriorityCompleted >= 20) {
            this.unlockAchievement('priority_master');
            newAchievements.push('Priority Master');
        }
        
        // Task creator achievement
        if (!this.achievements.find(a => a.id === 'task_creator').unlocked && this.userStats.totalTasks >= 50) {
            this.unlockAchievement('task_creator');
            newAchievements.push('Task Creator');
        }
        
        // Level master achievement
        if (!this.achievements.find(a => a.id === 'level_master').unlocked && this.userStats.level >= 10) {
            this.unlockAchievement('level_master');
            newAchievements.push('Level Master');
        }
        
        // Show achievement notifications
        newAchievements.forEach(achievement => {
            setTimeout(() => {
                this.showToast(`🎉 Achievement Unlocked: ${achievement}!`, 'success');
            }, 500);
        });
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.unlocked = true;
            this.addXP(50); // Bonus XP for achievement
        }
    }

    updateStats() {
        document.getElementById('user-level').textContent = this.userStats.level;
        this.updateStatsCards();
    }

    populateSubjects() {
        const subjectSelects = [
            document.getElementById('task-subject'),
            document.getElementById('subject-filter')
        ];
        
        subjectSelects.forEach(select => {
            if (select.id === 'subject-filter' && select.children.length <= 1) {
                this.subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    select.appendChild(option);
                });
            } else if (select.id === 'task-subject') {
                select.innerHTML = this.subjects.map(subject => 
                    `<option value="${subject}">${subject}</option>`
                ).join('');
            }
        });
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.dataset.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-toggle i');
        themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    changeMonth(direction) {
        // Simple implementation - could be enhanced
        this.renderCalendar();
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type] || icons.success}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveData() {
        localStorage.setItem('taskmaster_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskmaster_stats', JSON.stringify(this.userStats));
        localStorage.setItem('taskmaster_achievements', JSON.stringify(this.achievements));
    }

    loadData() {
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
        const themeIcon = document.querySelector('.theme-toggle i');
        themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Load tasks
        const savedTasks = localStorage.getItem('taskmaster_tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        // Load stats
        const savedStats = localStorage.getItem('taskmaster_stats');
        if (savedStats) {
            this.userStats = { ...this.userStats, ...JSON.parse(savedStats) };
        }
        
        // Load achievements
        const savedAchievements = localStorage.getItem('taskmaster_achievements');
        if (savedAchievements) {
            const saved = JSON.parse(savedAchievements);
            this.achievements.forEach(achievement => {
                const savedAchievement = saved.find(a => a.id === achievement.id);
                if (savedAchievement) {
                    achievement.unlocked = savedAchievement.unlocked;
                }
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});