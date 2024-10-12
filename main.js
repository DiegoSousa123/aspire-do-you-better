import { getDataTask } from "./js/addnew-task.js";
import { createIcons, Pencil, Trash2, CircleEllipsis, CircleAlert, Info, CircleX, X, Filter, Search } from "lucide";
import { addAllClick } from "./js/item-actions.js";
import { createMessagePopup, MESSAGE__ERROR, MESSAGE__NORMAL } from "./js/message-popup.js";

export const ACTION_DELETE = "delete";
export const ACTION_CONCLUDE = "conclude";
export const ACTION_NEW = "new";
export const ACTION_UPDATE = "update";
/*
	task list object
*/
class TaskList {
	#task_list;
	#task_filtered;
	#search_result;
	constructor(arr = []) {
		this.#task_list = arr;
		this.#task_filtered = [];
		this.#search_result = [];
	}
	#findTaskItem(id) {
		for (let item of this.#task_list) {
			if (item.id === id) {
				return item;
			}
		}
	}
	setNewTask(newObj) {
		this.#task_list.push(newObj);
	}
	setListFromStorage(list) {
		if (list) this.#task_list = list;
	}
	getTaskList() {
		return this.#task_list.map((task) => ({ ...task }));
	}
	getTaskItem(id) {
		return this.#findTaskItem(id);
	}
	getTaskIndex(id) {
		return this.#task_list.findIndex((item) => item.id === id);
	}
	validateIfExists(task) {
		return this.#task_list.some((item) => item.task === task);
	}
	deleteTask(taskId) {
		const index = this.getTaskIndex(taskId);
		if (index === -1) {
			throw new Error (`Task ID ${taskId} not found.`);
		}
		this.#task_list.splice(index, 1);
	}
	updateTask(newTask, newDate, newCateg, currentId) {
		const auxId = this.getTaskIndex(currentId);
		if(auxId === -1) throw new Error(`Task ID ${currentId} not found.`);
		const auxTarget = getDataTask(newTask, newDate, newCateg);
		auxTarget.id = currentId;
		this.#task_list.splice(auxId, 1, auxTarget);
	}
	filterTasks(query){ //filter by category
		this.#task_filtered = this.#task_list.filter((item)=> item.category === query);
		if(this.#task_filtered.length <= 0) throw new Error("No tasks found");
		return this.#task_filtered.map((i)=> ({...i}));
	}
	searchTask(input, currFilter){
		let listToSearch;
		currFilter === "all" ? listToSearch = this.#task_list : listToSearch = this.#task_filtered;
		this.#search_result = listToSearch.filter((t)=>{
			if(t.task.toLowerCase().includes(input.toLowerCase().trim())){
				return true;
			}
		});
		if(this.#search_result.length <= 0) throw new Error("No results found");
		return this.#search_result.map((i)=>({...i}));
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

/* elements */
const template = document.querySelector("#template-items");
const list = document.querySelector("#inconplete-list");
const listComplete = document.querySelector("#complete-list");
const dialogAdd = document.querySelector("#newtask-dialog");
const btnAdd = document.querySelector("#btn-add-new");
const btnCancel = document.querySelector("#close-dialog");
const filterOptions = document.querySelectorAll(".category__item");
const btnToggleSearch = document.getElementById("btn-toggle-search");
const btnSearchClose = document.getElementById("btn-search");
const searchWrapper = document.getElementById("search-wrapper");
const searchInput = document.getElementById("search-input");
/*******/
/* listeners */
document.addEventListener("DOMContentLoaded", () => {
		addAllClick();
});
/*
	search related codes
*/
btnToggleSearch.addEventListener("click", ()=>{
	if(!searchWrapper.matches(".search__wrapper--visible")){
		searchWrapper.classList.add("search__wrapper--visible");
	}
});
btnSearchClose.addEventListener("click", ()=>{
	if(searchWrapper.matches(".search__wrapper--visible")){
		searchWrapper.classList.remove("search__wrapper--visible");
		if(searchInput.value !== ""){
			searchInput.value = "";
			renderTasks(taskListClass.getTaskList());
		}
	}
});
searchInput.addEventListener("input", (e)=>{
	try{
		let currentFilter
		for(let item of filterOptions.values()){
			if(item.matches(".category__item--selected")){
				currentFilter = item.dataset.filterOption;
				break;
			}
		}
		renderTasks(taskListClass.searchTask(e.target.value, currentFilter));
	}catch(e){
		console.log(e);
		list.innerHTML = "";
		listComplete.innerHTML = "";
		renderTasks([]);
		//createMessagePopup(e, {messageType: MESSAGE__ERROR});
	}
});

/*
 open and close modal dialog
*/
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

/*
 filter related code
*/
filterOptions.forEach((item)=>{
	if(item.matches(".category__item--selected") && item.dataset.filterOption === "all"){
		renderTasks(taskListClass.getTaskList());
	}
	item.addEventListener("click", (e)=>{
		filterOptions.forEach((i)=>{
			i.classList.remove("category__item--selected");
		})
		item.classList.add("category__item--selected");
		try{
			if(item.dataset.filterOption === "all"){
				renderTasks(taskListClass.getTaskList());
			}else{
				renderTasks(taskListClass.filterTasks(item.dataset.filterOption));
			}
		}catch(e){
			createMessagePopup("No tasks found in this category.", {messageType: MESSAGE__ERROR});
		}
	});
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
				renderTasks(taskListClass.getTaskList());
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
/******/
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
//save changes to localStorage
function saveTaskArrayToStorage() {
	if (localStorage.getItem("tasks")) {
		localStorage.removeItem("tasks");
	}
	localStorage.setItem("tasks", JSON.stringify(taskListClass.getTaskList()));
}
//get data from localStorage
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
export function renderTasks(targetList) {
	if (targetList.length != 0) {
		list.innerHTML = "";
		listComplete.innerHTML = "";
		for (let i of targetList) {
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
	/*try{
		console.log(JSON.stringify(taskListClass.filterTasks("learn"), null, 4));
	}catch(e){
		console.error(e);
	} */
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
			element.remove()
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
			X,
			Filter,
			Search
		}
	});
}
// renderTasks(taskListClass.getTaskList());
