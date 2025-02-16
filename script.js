async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
        alert("User registered successfully");
    } else {
        alert("Registration failed");
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("task-section").style.display = "block";
        fetchTasks();
    } else {
        alert("Login failed");
    }
}

async function createTask() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const userId = localStorage.getItem("userId");
    
    const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, userId })
    });
    
    if (res.ok) {
        fetchTasks();
    } else {
        alert("Task creation failed");
    }
}

async function fetchTasks() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:5000/tasks/${userId}`);
    const tasks = await res.json();
    
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `<strong>${task.title}</strong><p>${task.description}</p><p>Priority: ${task.priority}</p>`;
        taskList.appendChild(taskItem);
    });
}
