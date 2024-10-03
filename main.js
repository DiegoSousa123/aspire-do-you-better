import { getDataTask } from "./addnew-task.js";
import { createIcons, Pencil, Trash2, CircleEllipsis, CircleAlert, Info, CircleX, X } from "lucide";
import { addAllClick, isDone } from "./item-actions.js";
import { createMessagePopup, MESSAGE__ERROR, MESSAGE__NORMAL } from "./message-popup.js";

export const ACTION_DELETE = "delete";
export const ACTION_CONCLUDE = "conclude";
export const ACTION_NEW = "new";
export const taskArray = getStorageTaskArray() || [];

//************** 
const rootElement = document.documentElement;
const mainColor = getComputedStyle(rootElement).getPropertyValue("--bg-color");
let metaThemeColor = document.querySelector("meta[name=theme-color]");
if(!metaThemeColor){
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

btnAdd.addEventListener("click", () => {
	dialogAdd.showModal();
});
btnCancel.addEventListener("click", (e) => {
	e.preventDefault();
	if(dialogAdd instanceof HTMLDialogElement && dialogAdd.open) dialogAdd.close();
	document.body.querySelector("#input-task").value = "";
	document.body.querySelector("#date-task").value = "";
});
//const form = document.querySelector(".dialog__container");
const form = document.getElementById("form");
form.addEventListener("submit", function (e) {
	e.preventDefault();
	const data = new FormData(form);
	const [title, date, color] = data;
	if (dialogAdd instanceof HTMLDialogElement && dialogAdd.open) dialogAdd.close();
	addNew(getDataTask(title[1], date[1], color[1]));
});

/*funcao para validar entrada de dados*/
function validateInputs(props) {
	if (props.task && props.date) {
		return true;
	}
}

//funcao para adicionar nova meta
function addNew(props) {
	if (!validateInputs(props)) {
		createMessagePopup("The input fields must be filled in.", { messageType: MESSAGE__ERROR });
		return;
	}
	if (validateIfExists(props.task)) {
		createMessagePopup(`The task "${props.task}" already exists.`, { messageType: MESSAGE__NORMAL });
		return;
	}
	taskArray.push(props);
	const created = createItem(props.task, props.date, props.id, false, props.color).querySelector(".list__item");
	saveTaskArrayToStorage();
	update(created, 0, ACTION_NEW, {});
}

function saveTaskArrayToStorage() {
	if (localStorage.getItem("tasks")) {
		localStorage.removeItem("tasks");
	}
	localStorage.setItem("tasks", JSON.stringify(taskArray));
}

function getStorageTaskArray() {
	if (!localStorage.getItem("tasks")) return;
	console.log(JSON.parse(localStorage.getItem("tasks")));
	return JSON.parse(localStorage.getItem("tasks"));
}
/*funcao para verificar 
se a meta ja existe */
function validateIfExists(t) {
	for (let i of taskArray) {
		if (i.task === t) return true;
	}
}
//funcao para criar items da lista
function createItem(task, date, id, done = false, color) {
	const listItem = template.content.cloneNode(true);
	const listContent = listItem.querySelector(".item__content");
	const listTitle = listItem.querySelector(".item__data .data__title");
	const listDate = listItem.querySelector(".item__data .data__date");
	const colorElement = listItem.querySelector(".data__color");
	listTitle.textContent = task;
	listDate.textContent = date;
	listItem.querySelector(".list__item").dataset.id = id;
	colorElement.style.backgroundColor = color;
	return listItem;
}

//listar metas
export function renderTasks() {
	if (taskArray.length != 0) {
		list.innerHTML = "";
		listComplete.innerHTML = "";
		for (let i of taskArray) {
			const listItem = createItem(i.task, i.date, i.id, i.done, i.color);

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
	document.addEventListener("DOMContentLoaded", ()=>{
		addAllClick();
	});
}
function animateItemList(targetList) {
	const targetItem = targetList.lastElementChild.querySelector(".item__content");
	requestAnimationFrame(() => {
		targetItem.classList.add("list__item--show");
	});
}
//funcao para atualizar o estado
//das metas (adicionar, remover e concluir)
export function update(element, taskId = 0, action = "", obj = {}) {
	switch (action) {
		case "delete":
			saveTaskArrayToStorage();
			element.remove();
			createMessagePopup("The task has been removed.");
			break;
		case "conclude":
			saveTaskArrayToStorage();
			handleConcludeAction(element, taskId);
			break;
		case "new":
			list.appendChild(element);
			recreateLucideIcons();
			element.querySelector(".item__content").classList.add("list__item--show");
			createMessagePopup("New task added.");
			break;
	}
	isEmpty("incomplete");
	isEmpty("complete");
}

//funcao para gerenciar a funcao de
//marcar como concluida ou não concluida.
function handleConcludeAction(element, taskId) {
	let elementState = taskArray[taskId].done;
	if (elementState) {
		//list.removeChild(element);
		element.remove();
		listComplete.appendChild(element);
		setStyleDone();
		createMessagePopup("Task complete!");
	} else {
		element.querySelector(".item__content").classList.remove("list__item--done");
		//listComplete.removeChild(element);
		element.remove();
		list.appendChild(element);
		//createMessagePopup("");
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
	
	if(hasItems <= 0 && !hasDisclaimer){
		const ele = createEmptyDisclaimer(disclaimerText);
		listTarget.appendChild(ele);
		recreateLucideIcons();
	}else if(hasItems > 0 && hasDisclaimer){
		const el = listTarget.querySelector(".empty__disclaimer");
		if(el) listTarget.removeChild(el);
	}
}
//retorna o indice do elemento buscado
export function findTask(arr, targetTaskId) {
	if (arr.length === 0) return;
	return arr.findIndex((item) => item.id === targetTaskId);
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
