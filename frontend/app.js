let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const todoList = document.getElementById("todo-list");

// Xử lý sự kiện khi form được submit
function handleSubmit(event) {
  if (event) event.preventDefault();

  const todoInput = document.getElementById("todo-input");
  const todoValue = todoInput.value.trim();
  const todoDate = document.getElementById("todo-date").value;
  const todoPriority = document.getElementById("todo-priority").value;

  if (
    todoValue &&
    todoDate &&
    todoDate > new Date().toISOString().split("T")[0]
  ) {
    // Thêm task mới vào DOM
    addTodoToList(todoValue, todoPriority, todoDate);

    // Thêm task mới vào mảng tasks
    tasks.push({
      text: todoValue,
      priority: todoPriority,
      date: todoDate,
      completed: false,
    });

    // Lưu vào localStorage
    saveTasks();

    // Reset form
    todoInput.value = "";
  }
}

// Thêm task vào danh sách
function addTodoToList(text, priority, date) {
  // Đảm bảo todoList hiển thị
  todoList.style.display = "block";

  // Tạo phần tử li mới
  const li = document.createElement("li");
  li.className = `todo-item priority-${priority}`;

  // Tạo nội dung HTML bên trong li
  li.innerHTML = `
    <div class="todo-item-content">
      <span class="task-text">${text}</span>
      <span class="task-date">${date}</span>
      <div class="button-container">
        <button class="complete-button" onclick="toggleComplete(this.closest('li'))">✅</button>
        <button class="edit-button" onclick="editTodo(this.closest('li'))">✏️</button>
        <button class="delete-button" onclick="deleteTodo(this.closest('li'))">❌</button>
      </div>
    </div>
  `;

  // Thêm li vào todoList
  todoList.appendChild(li);
}

// Đánh dấu task là hoàn thành
function toggleComplete(li) {
  // Thay đổi trạng thái hoàn thành
  li.classList.toggle("completed");

  // Cập nhật trong mảng tasks
  const taskText = li.querySelector(".task-text");
  li.appendChild(document.createTextNode(" ✅"));

  // Tìm task trong mảng tasks
  const completedButton = li.querySelector(".complete-button");
  if (completedButton) {
    completedButton.remove();
  }

  const task = tasks.find((item) => item.text === taskText);
  if (task) {
    task.completed = !task.completed;
  }

  // Lưu vào localStorage
  saveTasks();
}

// Xóa task
function deleteTodo(li) {
  // Xóa khỏi DOM
  todoList.removeChild(li);

  // Xóa khỏi mảng tasks
  const taskText = li.querySelector(".task-text").textContent;
  tasks = tasks.filter((item) => item.text !== taskText);

  // Lưu vào localStorage
  saveTasks();
}

// Chỉnh sửa task
function editTodo(li) {
  // Lấy các phần tử cần thiết
  const taskTextElement = li.querySelector(".task-text");
  const taskDateElement = li.querySelector(".task-date");

  // Lưu giá trị hiện tại
  const currentText = taskTextElement.textContent;
  const currentDate = taskDateElement.textContent;

  // Ẩn nội dung hiện tại
  const todoItemContent = li.querySelector(".todo-item-content");
  todoItemContent.style.display = "none";

  // Tạo form chỉnh sửa
  const editForm = document.createElement("div");
  editForm.className = "edit-form";
  editForm.innerHTML = `
    <input type="text" class="edit-input" value="${currentText}">
    <input type="date" class="edit-date" value="${currentDate}">
    <div class="edit-buttons">
      <button class="save-button">💾</button>
      <button class="cancel-button">❌</button>
    </div>
  `;

  // Thêm form chỉnh sửa vào li
  li.appendChild(editForm);

  // Focus vào input
  const editInput = editForm.querySelector(".edit-input");
  editInput.focus();

  // Xử lý sự kiện khi nhấn nút lưu
  const saveButton = editForm.querySelector(".save-button");
  saveButton.addEventListener("click", function () {
    saveTodo(li, editForm, todoItemContent);
  });

  // Xử lý sự kiện khi nhấn nút hủy
  const cancelButton = editForm.querySelector(".cancel-button");
  cancelButton.addEventListener("click", function () {
    // Xóa form chỉnh sửa
    li.removeChild(editForm);
    // Hiện lại nội dung cũ
    todoItemContent.style.display = "flex";
  });

  // Xử lý sự kiện khi nhấn Enter
  editInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      saveTodo(li, editForm, todoItemContent);
    }
  });
}

// Lưu task đã chỉnh sửa
function saveTodo(li, editForm, todoItemContent) {
  // Lấy các giá trị mới
  const newText = editForm.querySelector(".edit-input").value.trim();
  const newDate = editForm.querySelector(".edit-date").value;

  if (newText) {
    // Cập nhật giao diện
    const taskTextElement = todoItemContent.querySelector(".task-text");
    const taskDateElement = todoItemContent.querySelector(".task-date");

    taskTextElement.textContent = newText;
    taskDateElement.textContent = newDate;

    // Cập nhật trong mảng tasks
    const index = Array.from(todoList.children).indexOf(li);
    if (index !== -1 && tasks[index]) {
      tasks[index].text = newText;
      tasks[index].date = newDate;

      // Lưu vào localStorage
      saveTasks();
    }
  }

  // Xóa form chỉnh sửa
  li.removeChild(editForm);

  // Hiện lại nội dung đã cập nhật
  todoItemContent.style.display = "flex";
}

// Lưu tasks vào localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Hiển thị tất cả tasks
function renderTasks() {
  // Xóa tất cả tasks hiện tại
  todoList.innerHTML = "";

  // Thêm lại từ mảng tasks
  tasks.forEach((task) => {
    addTodoToList(task.text, task.priority, task.date);
  });
}

// Khởi tạo ứng dụng khi trang tải xong
document.addEventListener("DOMContentLoaded", function () {
  // Hiển thị tasks từ localStorage
  renderTasks();

  // Thêm event listener cho form
  const todoForm = document.getElementById("todo-form");
  todoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleSubmit();
  });

  // Thêm event listener cho bộ lọc
  const filterComplete = document.getElementById("filter-complete");
  if (filterComplete) {
    filterComplete.addEventListener("change", filterTasks);
  }

  const filterPriority = document.getElementById("filter-priority");
  if (filterPriority) {
    filterPriority.addEventListener("change", filterTasks);
  }
});

// Lọc tasks
function filterTasks() {
  const filterComplete = document.getElementById("filter-complete").value;
  const filterPriority = document.getElementById("filter-priority").value;

  // Hiển thị tất cả tasks
  const allItems = todoList.querySelectorAll("li");
  allItems.forEach((item) => {
    let shouldShow = true;

    // Lọc theo trạng thái hoàn thành
    if (filterComplete !== "all") {
      const isCompleted = item.classList.contains("completed");
      if (
        (filterComplete === "completed" && !isCompleted) ||
        (filterComplete === "not-completed" && isCompleted)
      ) {
        shouldShow = false;
      }
    }

    // Lọc theo mức độ ưu tiên
    if (filterPriority !== "all" && shouldShow) {
      const hasPriority = item.classList.contains(`priority-${filterPriority}`);
      if (!hasPriority) {
        shouldShow = false;
      }
    }

    // Hiển thị hoặc ẩn task
    item.style.display = shouldShow ? "flex" : "none";
  });
}
