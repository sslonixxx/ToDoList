class Case {
    constructor(description, isDone = false) {
        this.id = Date.now();
        this.description = description;
        this.isDone = isDone;
    }
}

let todoArray = [];

function saveToJsonFile() {
    if (todoArray[0] != null) {
        const jsonString = JSON.stringify(todoArray, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        var currentdate = new Date();
        a.download = 'todoList ' + currentdate.getDate() + '.' + (currentdate.getMonth() + 1) + '.' + currentdate.getFullYear() + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

function loadFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const loadedTodos = JSON.parse(e.target.result);
            if (Array.isArray(loadedTodos)) {
                todoArray = [];
                loadedTodos.forEach(todo => {
                    if (todo && typeof todo.description === 'string' && typeof todo.isDone === 'boolean') {
                        todoArray.push(new Case(todo.description, todo.isDone));
                        todoArray[todoArray.length - 1].id = todo.id;
                    }
                });
                displayLoadedTodoList();
            } else {
                alert("Неправильная структура JSON файла!");
            }
        } catch (err) {
            alert("Ошибка при загрузке файла!");
            console.error(err);
        }
    };
    reader.readAsText(file);
}

function addCaseToList() {
    const inputBox = document.getElementById("inputBox");
    const todoDescription = inputBox.value.trim();

    if (todoDescription === "") {
        alert("Введите описание дела!");
        return;
    }

    const newTodo = new Case(todoDescription);
    todoArray.push(newTodo);
    inputBox.value = '';

    displayNewTodoItem(newTodo);
}

function displayNewTodoItem(todo) {
    const todoListElement = document.getElementById('listContainer');

    const li = document.createElement('li');
    const descriptionSpan = document.createElement('span');
    descriptionSpan.textContent = todo.description;
    descriptionSpan.classList.add('description-span');
    li.setAttribute('data-id', todo.id);

    if (todo.isDone) {
        li.classList.add('checked');
    }
    li.appendChild(descriptionSpan);

    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');

    const spanEdit = document.createElement("span");
    const imgEdit = document.createElement("img");
    imgEdit.src = "images/edit.png";
    imgEdit.alt = "Edit";
    imgEdit.classList.add('edit-icon');
    spanEdit.appendChild(imgEdit);

    const spanClose = document.createElement("span");
    const imgDelete = document.createElement("img");
    imgDelete.src = "images/delete.png";
    imgDelete.alt = "Delete";
    imgDelete.classList.add('delete-icon');
    spanClose.appendChild(imgDelete);

    iconContainer.appendChild(spanEdit);
    iconContainer.appendChild(spanClose);

    li.appendChild(iconContainer);

    todoListElement.prepend(li);
}

function displayLoadedTodoList() {
    const todoListElement = document.getElementById('listContainer');
    todoListElement.innerHTML = '';

    todoArray.forEach(todo => {
        displayNewTodoItem(todo);
    });
}

document.getElementById('addButton').addEventListener('click', addCaseToList);
document.getElementById('saveButton').addEventListener('click', saveToJsonFile);
document.getElementById('loadButton').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});
document.getElementById('fileInput').addEventListener('change', loadFromJsonFile);

listContainer.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    const todoId = li.getAttribute('data-id');

    if (e.target.tagName === "IMG" && e.target.classList.contains("delete-icon")) {
        const todoIndex = todoArray.findIndex(todo => todo.id == todoId);
        if (todoIndex > -1) {
            todoArray.splice(todoIndex, 1);
            li.remove();
        }
    } else if (e.target.tagName === "IMG" && e.target.classList.contains("edit-icon")) {
        const descriptionSpan = li.querySelector('.description-span');
        const currentDescription = descriptionSpan.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentDescription;
        input.classList.add('edit-input');

        descriptionSpan.replaceWith(input);
        input.focus();

        const finishEditing = () => {
            const newDescription = input.value.trim();
            if (newDescription !== "") {
                const todo = todoArray.find(todo => todo.id == todoId);
                if (todo) {
                    todo.description = newDescription;
                    descriptionSpan.textContent = newDescription;
                }
            }
            input.replaceWith(descriptionSpan);
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                finishEditing();
            }
        });
    } else if (e.target.tagName === "LI" || e.target.closest("li")) {
        const todo = todoArray.find(todo => todo.id == todoId);
        if (todo) {
            todo.isDone = !todo.isDone;
            li.classList.toggle("checked");
        }
    }
}, false);
