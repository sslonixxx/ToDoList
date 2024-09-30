class Case {
    constructor(description, isDone = false) {
        this.description = description;
        this.isDone = isDone;
        this.id = null; 
    }

    setId(id) {
        this.id = id;
    }
}


let todoArray = [];

function loadAllTasksFromServer() {
    fetch('http://localhost:8081/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при загрузке задач: ' + response.statusText);
            }
            return response.json();
        })
        .then(tasks => {
            todoArray = [];
            tasks.forEach(task => {
                let newTask = new Case(task.description, task.isDone);
                newTask.setId(task.id); 
                todoArray.push(newTask);
                displayNewTodoItem(newTask);
            });
        })
        .catch((error) => {
            console.error('Ошибка при загрузке задач:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    loadAllTasksFromServer();
});

function addCaseToList() {
    const inputBox = document.getElementById("inputBox");
    const todoDescription = inputBox.value.trim();

    if (todoDescription === "") {
        alert("Введите описание дела!");
        return;
    }

    const newTodo = new Case(todoDescription);

    fetch('http://localhost:8081/api/tasks/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            description: newTodo.description, 
            isDone: newTodo.isDone
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при добавлении задачи: ' + response.statusText);
        }
    
        return response.json();
    })
    .then(serverTask => {
        newTodo.id = serverTask.id;

        todoArray.push(newTodo);
        inputBox.value = '';
        displayNewTodoItem(newTodo);

        console.log('Задача успешно добавлена:', serverTask);
    })
    .catch((error) => {
        console.error('Ошибка при добавлении задачи:', error);
    });
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

            fetch(`http://localhost:8081/api/tasks/${todoId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Ошибка при удалении задачи:', response.status);
                }
            })
            .catch((error) => {
                console.error('Ошибка при удалении задачи:', error);
            });
        }
    }
    else if (e.target.tagName === "IMG" && e.target.classList.contains("edit-icon")) {
        const descriptionSpan = li.querySelector('.description-span');
        const currentDescription = descriptionSpan.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentDescription;
        input.classList.add('edit-input');

        descriptionSpan.replaceWith(input);
        input.focus();

        let isEditing = true;

        const finishEditing = () => {
            if (!isEditing) return;
            isEditing = false;

            const newDescription = input.value.trim();
            if (newDescription !== "") {
                const todo = todoArray.find(todo => todo.id == todoId);
                if (todo) {
                    todo.description = newDescription;
                    descriptionSpan.textContent = newDescription;

                    fetch(`http://localhost:8081/api/tasks/${todoId}/description`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ description: newDescription })
                    })
                    .then(response => {
                        if (!response.ok) {
                            console.error('Ошибка при обновлении описания:', response.status);
                        }
                    })
                    .catch((error) => {
                        console.error('Ошибка при обновлении описания:', error);
                    });
                }
            }

            if (input.parentNode) {
                input.replaceWith(descriptionSpan);
            }
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                finishEditing();
            }
        });
    }
    else if (e.target.tagName === "LI" || e.target.closest("li")) {
        const todo = todoArray.find(todo => todo.id == todoId);
        if (todo) {
            todo.isDone = !todo.isDone;
            li.classList.toggle("checked");

            fetch(`http://localhost:8081/api/tasks/${todoId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isDone: todo.isDone })
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Ошибка при обновлении статуса:', response.status);
                }
            })
            .catch((error) => {
                console.error('Ошибка при обновлении статуса:', error);
            });
        }
    }
}, false);