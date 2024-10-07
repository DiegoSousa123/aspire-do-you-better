import { getDataTask } from "./addnew-task.js";
import { createIcons, Pencil, Trash2, CircleEllipsis, CircleAlert, Info, CircleX, X } from "lucide";
import { addAllClick } from "./item-actions.js";
import { createMessagePopup, MESSAGE__ERROR, MESSAGE__NORMAL } from "./message-popup.js";

export const ACTION_DELETE = "delete";
export const ACTION_CONCLUDE = "conclude";
export const ACTION_NEW = "new";
export const ACTION_UPDATE = "update";

class TaskList {
	#task__list;
	constructor(arr = []) {
		this.#task__list = arr;
	}
	#findTaskItem(id) {
		for (let item of this.#task__list) {
			if (item.id === id) {
				return item;
			}
		}
	}
	setNewTask(newObj) {
		this.#task__list.push(newObj);
	}
	setListFromStorage(list) {
		if (list) this.#task__list = list;
	}
	getTaskList() {
		return this.#task__list.map((task) => ({ ...task }));
	}
	getTaskItem(id) {
		return this.#findTaskItem(id);
	}
	getTaskIndex(id) {
		return this.#task__list.findIndex((item) => item.id === id);
	}
	validateIfExists(task) {
		return this.#task__list.some((item) => item.task === task);
	}
	deleteTask(taskId) {
		const index = this.getTaskIndex(taskId);
		if (index === -1) {
			throw new Error (`Task ID ${taskId} not found.`);
		}
		this.#task__list.splice(index, 1);
	}
	updateTask(newTask, newDate, newCateg, currentId) {
		const auxId = this.getTaskIndex(currentId);
		if(auxId === -1) throw new Error(`Task ID ${currentId} not found.`);
		const auxTarget = getDataTask(newTask, newDate, newCateg);
		auxTarget.id = currentId;
		this.#task__list.splice(auxId, 1, auxTarget);
	}
}

export const taskListClass = new TaskList(getStorageTaskArray());

//**************
const rootElement = document.documentElement;
const mainColor = getComputedStyle(rootElement).getPropertyValue("--bg-color");
let metaThemeColor = document.querySelector("meta[name=theme-color]");
if (!metaThemeColor) {
	metaThemeColor = document.createElement("meta");
	metaThemeColor.name = "theme-color";
	document.head.appendChild(metaThemeColor);
}
metaThemeColor.content = mainColor;
//*************

const template = document.querySelector("#template-items");
const list = document.querySelector("#inconplete-list");
const listComplete = document.querySelector("#complete-list");

//botao para abrir o dialog de nova meta
const dialogAdd = document.querySelector("#newtask-dialog");
const btnAdd = document.querySelector("#btn-add-new");
const btnCancel = document.querySelector("#close-dialog");

document.addEventListener("DOMContentLoaded", () => {
		addAllClick();
});
btnAdd.addEventListener("click", () => {
	document.getElementById("dialog-title").textContent = "New Task";
	dialogAdd.showModal();
	handleForm("new");
});
btnCancel.addEventListener("click", (e) => {
	e.preventDefault();
	if (dialogAdd instanceof HTMLDialogElement && dialogAdd.open) dialogAdd.close();
	clearInputs();
});
function clearInputs(){
	document.body.querySelector("#input-task").value = "";
	document.body.querySelector("#date-task").value = "";
	document.body.querySelector("input[type=radio][value=normal]").checked = true;
}
//FORM TO ADD | EDIT 
const form = document.getElementById("form");
let currentFormMode = "new";
let currentUpdateId = 0;
form.addEventListener("submit", function formHandle(e) {
		e.preventDefault();
		const data = new FormData(form);
		const [title, date, category] = data;
		if (dialogAdd instanceof HTMLDialogElement && dialogAdd.open) dialogAdd.close();
		if(!validateInputs(title[1], date[1])){
				clearInputs();
				createMessagePopup("The fields may be filled in.", {messageType:MESSAGE__ERROR});
				return;
			}
		if (currentFormMode === "new") {
			addNew(getDataTask(title[1], date[1], category[1]));
		} else if (currentFormMode === "update") { 
			try{
				taskListClass.updateTask(title[1], date[1], category[1], currentUpdateId);
				saveTaskArrayToStorage();
				renderTasks();
				createMessagePopup("The task has been edited.")
			}catch(e){
				createMessagePopup(e, {messageType: MESSAGE__ERROR});
			}
		}
	});
function handleForm(mode, id = 0) {
	currentFormMode = mode;
	currentUpdateId = id;
}

/*funcao para validar entrada de dados*/
function validateInputs(task, date) {
	if (task != "" && date != "") {
		return true;
	}else{
		return false;
	}
}

//funcao para adicionar nova meta
function addNew(props) {
	if (taskListClass.validateIfExists(props.task)) {
		createMessagePopup(`The task "${props.task}" already exists.`);
		return;
	}

	taskListClass.setNewTask(props);
	const created = createItem(props).querySelector(".list__item");
	saveTaskArrayToStorage();
	update(created, 0, ACTION_NEW);
}

function saveTaskArrayToStorage() {
	if (localStorage.getItem("tasks")) {
		localStorage.removeItem("tasks");
	}
	localStorage.setItem("tasks", JSON.stringify(taskListClass.getTaskList()));
}

function getStorageTaskArray() {
	if (!localStorage.getItem("tasks")) return [];
	console.log(JSON.parse(localStorage.getItem("tasks")));
	return JSON.parse(localStorage.getItem("tasks"));
}

//funcao para criar items da lista
function createItem({ task, date, day, id, done, category }) {
	const listItem = template.content.cloneNode(true);
	const listContent = listItem.querySelector(".item__content");
	const listTitle = listItem.querySelector(".item__data .data__title");
	const listDate = listItem.querySelector(".item__data .data__date");
	const colorElement = listItem.querySelector(".data__color");
	listTitle.textContent = task;
	const localeDate = new Date(date).toLocaleDateString('en', {timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric"});
	listDate.textContent = `${day}, ${localeDate}`;
	listItem.querySelector(".list__item").dataset.id = id;
	colorElement.style.backgroundColor = getColorByCategory(category);
	return listItem;
}
function getColorByCategory(cat) {
	const root = document.documentElement;
	const color = getComputedStyle(root).getPropertyValue(`--category-${cat.toLowerCase()}-color`);
	return color;
}
//listar metas
export function renderTasks() {
	if (taskListClass.getTaskList().length != 0) {
		list.innerHTML = "";
		listComplete.innerHTML = "";
		for (let i of taskListClass.getTaskList()) {
			const listItem = createItem(i);
			listItem.querySelector(".list__item").querySelector(".item__content").classList.add("list__item--show");
			switch (i.done) {
				case true:
					listComplete.appendChild(listItem);
					setStyleDone();
					break;
				default:
					list.appendChild(listItem);
			}
		}
	}
	isEmpty("incomplete");
	isEmpty("complete");
	recreateLucideIcons();
}

//funcao para atualizar o estado
//das metas (adicionar, remover e concluir)
export function update(element, taskId = 0, action = "") {
	switch (action) {
		case ACTION_UPDATE:
			const { task, date, category } = taskListClass.getTaskItem(taskId);
			document.getElementById("dialog-title").textContent = "Edit Task";
			document.querySelector("#input-task").value = task;
			document.querySelector("#date-task").value = `${date}`;
			const radio = document.querySelector(`input[type=radio][value=${category}]`);
			radio.checked = true;
			dialogAdd.showModal();
			handleForm("update", taskId);
			//createMessagePopup("The task was been edited.");
			break;

		case ACTION_DELETE:
			saveTaskArrayToStorage();
			element.remove();
			createMessagePopup("The task has been removed.");
			break;

		case ACTION_CONCLUDE:
			saveTaskArrayToStorage();
			handleConcludeAction(element, taskId);
			break;

		case ACTION_NEW:
			list.appendChild(element);
			recreateLucideIcons();
			element.querySelector(".item__content").classList.add("list__item--show");
			createMessagePopup("New task added.", {messageType: MESSAGE__NORMAL});
			break;
	}
	isEmpty("incomplete");
	isEmpty("complete");
}

//funcao para gerenciar a funcao de
//marcar como concluida ou não concluida.
function handleConcludeAction(element, taskId) {
	if (taskListClass.getTaskItem(taskId).done) {
		element.remove();
		listComplete.appendChild(element);
		setStyleDone();
		createMessagePopup("Task complete!");
	} else {
		element.querySelector(".item__content").classList.remove("list__item--done");
		element.remove();
		list.appendChild(element);
	}
	element.querySelector(".item__content").classList.add("list__item--show");
}
function setStyleDone() {
	listComplete.querySelectorAll(".item__content").forEach((item) => {
		item.classList.add("list__item--done");
	});
}

function createEmptyDisclaimer(info) {
	const disclaimer = document.createElement("div");
	disclaimer.classList.add("empty__disclaimer");
	disclaimer.innerHTML = `<i data-lucide="circle-alert"></i> <p>${info}</p>`;
	return disclaimer;
}
//funcao para verificar se as listas estao vazias
function isEmpty(listToCheck) {
	let listTarget, disclaimerText;
	if (listToCheck === "incomplete") {
		listTarget = document.querySelector("#inconplete-list");
		disclaimerText = "No task added.";
	}
	if (listToCheck === "complete") {
		listTarget = document.querySelector("#complete-list");
		disclaimerText = "No task completed.";
	}
	const hasItems = listTarget.querySelectorAll(".list__item").length;
	const hasDisclaimer = listTarget.querySelector(".empty__disclaimer");

	if (hasItems <= 0 && !hasDisclaimer) {
		const ele = createEmptyDisclaimer(disclaimerText);
		listTarget.appendChild(ele);
		recreateLucideIcons();
	} else if (hasItems > 0 && hasDisclaimer) {
		const el = listTarget.querySelector(".empty__disclaimer");
		if (el) listTarget.removeChild(el);
	}
}

export function recreateLucideIcons() {
	createIcons({
		icons: {
			Pencil,
			Trash2,
			CircleEllipsis,
			CircleAlert,
			Info,
			CircleX,
			X
		}
	});
}
renderTasks();
