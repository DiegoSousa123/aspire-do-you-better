import { getDataTask } from "./js/addnew-task.js";
import {
	createIcons,
	Pencil,
	Trash2,
	CircleEllipsis,
	CircleAlert,
	Info,
	CircleX,
	X,
	Filter,
	Search,
	Plus,
	Check,
	ChevronRight,
	Percent
} from "lucide";
import { addAllClick } from "./js/item-actions.js";
import { createMessagePopup, MESSAGE__ERROR, MESSAGE__NORMAL } from "./js/message-popup.js";
import { handleProgress } from "./js/progress-manager.js";
export const ACTION_DELETE = "delete";
export const ACTION_CONCLUDE = "conclude";
export const ACTION_NEW = "new";
export const ACTION_UPDATE = "update";
const FILTER_SELECTED = { filter: "all" };
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
		let temp = this.#task_list.map((task) => ({ ...task }));
		return temp.length != 0 ? temp.sort(sortByNewest) : temp;
	}
	getTaskItem(id) {
		return this.#findTaskItem(id);
	}
	getTaskIndex(id) {
		return this.#task_list.findIndex((item) => item.id === id);
	}
	get completedStats() {
		if (this.#task_list.length <= 0) return 0;
		return this.#task_list.filter((item) => item.done).length;
	}
	get getTaskCompletionStats() {
		return {
			complete: this.completedStats,
			total: this.#task_list.length
		};
	}
	validateIfExists(task) {
		return this.#task_list.some((item) => item.task === task);
	}
	deleteTask(taskId) {
		const index = this.getTaskIndex(taskId);
		if (index === -1) {
			throw new Error(`Task ID ${taskId} not found.`);
		}
		this.#task_list.splice(index, 1);
	}
	deleteAllComplete() {
		this.#task_list = this.#task_list.filter((i) => i.done != true);
	}
	updateTask(newTask, newDate, newCateg, currentId) {
		const auxId = this.getTaskIndex(currentId);
		if (auxId === -1) throw new Error(`Task ID ${currentId} not found.`);
		const auxTarget = getDataTask(newTask, newDate, newCateg);
		auxTarget.id = currentId;
		this.#task_list.splice(auxId, 1, auxTarget);
	}
	filterTasks(query) {
		//filter by category
		this.#task_filtered = this.#task_list.filter((item) => item.category === query);
		if (this.#task_filtered.length <= 0) throw new Error("No tasks found");
		return this.#task_filtered.map((i) => ({ ...i }));
	}
	searchTask(input, currFilter) {
		let listToSearch;
		currFilter === "all" ? (listToSearch = this.#task_list) : (listToSearch = this.#task_filtered);
		this.#search_result = listToSearch.filter((t) => {
			if (t.task.toLowerCase().includes(input.toLowerCase().trim())) {
				return true;
			}
		});
		if (this.#search_result.length <= 0) throw new Error("No results found");
		return this.#search_result.map((i) => ({ ...i }));
	}
}
function sortByNewest(a, b) {
	let sA = a.id.substring(0, 8);
	let sB = b.id.substring(0, 8);
	if (sA > sB) {
		return -1;
	} else if (sA < sB) {
		return 1;
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

const headerDimen = document.querySelector(".header__top").getBoundingClientRect();
rootElement.style.setProperty("--header-height", `${headerDimen.bottom + headerDimen.height / 3}px`);
//*************

/* elements */
const template = document.querySelector("#template-items");
const list = document.querySelector("#inconplete-list");
const listComplete = document.querySelector("#complete-list");
const dialogAdd = document.querySelector("#newtask-dialog");
const btnAdd = document.querySelector("#btn-add-new");
const btnClearAllComplete = document.getElementById("btn-clear-complete");
const btnCancel = document.querySelector("#close-dialog");
const filterOptions = document.getElementById("categories");
const btnToggleSearch = document.getElementById("btn-toggle-search");
const btnSearchClose = document.getElementById("btn-search");
const searchWrapper = document.getElementById("search-wrapper");
const searchInput = document.getElementById("search-input");
const logoImage = document.getElementById("logo");
const categoryContainer = document.getElementById("category-container");
const categoryToggle = document.getElementById("category-toggle");
const progressContainer = document.getElementById("progress-container");
const btnProgressToggle = document.getElementById("btn-toggle-progress");

/*
	matchMedia 
*/
const mediaQueryColor = window.matchMedia("(prefers-color-scheme: light)");
const matchMediaCategory = window.matchMedia("(min-width: 1024px)");
const changeLogo = (e) => {
	//handle logo version
	if (e.matches) {
		logoImage.src = "/aspire_icon_purple.webp";
	} else {
		logoImage.src = "/apire_icon_white (1).webp";
	}
};
const handleCategoryFilterExpand = (e) => {
	//handle if filter must be expanded
	if (e.matches) {
		categoryContainer.classList.add("category--expanded");
	} else {
		categoryContainer.classList.remove("category--expanded");
	}
};

changeLogo(mediaQueryColor);
handleCategoryFilterExpand(matchMediaCategory);
mediaQueryColor.addEventListener("change", changeLogo);
matchMediaCategory.addEventListener("change", handleCategoryFilterExpand);
/*******/

const handleClearCompleteVisibility = () => {
	if (taskListClass.completedStats > 1) {
		btnClearAllComplete.style.display = "flex";
	} else {
		btnClearAllComplete.style.display = "none";
	}
};
/* listeners */
document.addEventListener("DOMContentLoaded", () => {
	addAllClick();
});

/*
	search related codes
*/
btnToggleSearch.addEventListener("click", () => {
	if (!searchWrapper.matches(".search__wrapper--visible")) {
		searchWrapper.classList.add("search__wrapper--visible");
	}
});
btnSearchClose.addEventListener("click", () => {
	if (searchWrapper.matches(".search__wrapper--visible")) {
		searchWrapper.classList.remove("search__wrapper--visible");
		if (searchInput.value !== "") {
			searchInput.value = "";
			FILTER_SELECTED.filter !== "all"
				? renderTasks(taskListClass.filterTasks(FILTER_SELECTED.filter))
				: renderTasks(taskListClass.getTaskList());
		}
	}
});
/* search event listener
 */
const debounceSearch = debounce(renderTasks, 500);
searchInput.addEventListener("input", (e) => {
	try {
		debounceSearch(taskListClass.searchTask(e.target.value, FILTER_SELECTED.filter));
	} catch (e) {
		list.innerHTML = "";
		listComplete.innerHTML = "";
		renderTasks([]);
	}
});
//delay function call
function debounce(func, delay) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), delay);
	};
}

btnAdd.addEventListener("click", () => {
	document.getElementById("dialog-title").textContent = "New task";
	dialogAdd.setAttribute("aria-label", "Create new task");
	dialogAdd.showModal();
	handleForm("new");
});
btnClearAllComplete.addEventListener("click", () => {
		if (!listComplete.querySelector(".list__item")) return;
		listComplete.innerHTML = "";
		update();
		taskListClass.deleteAllComplete();
		saveTaskArrayToStorage();
		handleClearCompleteVisibility();
		createMessagePopup("The completed tasks have been cleaned.");
});
btnCancel.addEventListener("click", (e) => {
	e.preventDefault();
	if (dialogAdd instanceof HTMLDialogElement && dialogAdd.open) dialogAdd.close();
	clearInputs();
});

btnProgressToggle.addEventListener("click", () => {
	handleProgress(taskListClass.getTaskCompletionStats);
});

//show/hide the filter
categoryToggle.addEventListener("click", () => {
	if (categoryContainer.matches(".category--expanded")) {
		categoryContainer.classList.remove("category--expanded");
		categoryToggle.setAttribute("aria-expanded", "false");
		filterOptions.setAttribute("aria-hidden", "true");
	} else {
		categoryContainer.classList.add("category--expanded");
		categoryToggle.setAttribute("aria-expanded", "true");
		filterOptions.setAttribute("aria-hidden", "false");
	}
});
//filter listener
filterOptions.addEventListener("click", (e) => {
	if (e.target.nodeName !== "BUTTON") return;
	const targetElement = e.target;
	document.querySelectorAll(".category__item").forEach((i) => {
		i.classList.remove("category__item--selected");
	});
	targetElement.classList.add("category__item--selected");
	try {
		FILTER_SELECTED.filter = targetElement.dataset.filterOption;
		if (targetElement.dataset.filterOption === "all") {
			renderTasks(taskListClass.getTaskList());
		} else {
			renderTasks(taskListClass.filterTasks(targetElement.dataset.filterOption));
		}
	} catch (e) {
		list.innerHTML = "";
		listComplete.innerHTML = "";
		renderTasks([]);
		//createMessagePopup("No tasks found in this category.", {messageType: MESSAGE__ERROR});
	}
});

function clearInputs() {
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
	if (!validateInputs(title[1])) {
		clearInputs();
		createMessagePopup("The fields may be filled in.", { messageType: MESSAGE__ERROR });
		return;
	}
	if (currentFormMode === "new") {
		addNew(getDataTask(title[1], date[1], category[1]));
	} else if (currentFormMode === "update") {
			taskListClass.updateTask(title[1], date[1], category[1], currentUpdateId);
			saveTaskArrayToStorage();
			renderTasks(taskListClass.getTaskList());
			createMessagePopup("The task has been edited.");
	}
});
function handleForm(mode, id = 0) {
	currentFormMode = mode;
	currentUpdateId = id;
}
/******/
/*funcao para validar entrada de dados*/
function validateInputs(task) {
	return task != "";
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
	const localeDate = new Date(date).toLocaleDateString("en", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
	listDate.textContent = `${day}, ${localeDate}`;
	listItem.querySelector(".list__item").dataset.id = id;
	listContent.setAttribute("draggable", "true");
	colorElement.style.backgroundColor = getColorByCategory(category);
	colorElement.setAttribute("aria-label", `Task category: ${category}`);
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
	handleClearCompleteVisibility();
	recreateLucideIcons();
}

//funcao para atualizar o estado
//das metas (adicionar, remover e concluir)
export function update(element = null, taskId = 0, action = "") {
	switch (action) {
		case ACTION_UPDATE:
			const { task, date, category } = taskListClass.getTaskItem(taskId);
			document.getElementById("dialog-title").textContent = "Edit task";
			document.querySelector("#input-task").value = task;
			document.querySelector("#date-task").value = `${date}`;
			const radio = document.querySelector(`input[type=radio][value=${category}]`);
			radio.checked = true;
			dialogAdd.setAttribute("aria-label", "Edit a task");
			dialogAdd.showModal();
			handleForm("update", taskId);
			break;

		case ACTION_DELETE:
			saveTaskArrayToStorage();
			element.remove();
			handleClearCompleteVisibility();
			createMessagePopup("The task was removed.");
			break;

		case ACTION_CONCLUDE:
			saveTaskArrayToStorage();
			handleConcludeAction(element, taskId);
			handleClearCompleteVisibility();
			break;

		case ACTION_NEW:
			list.prepend(element);
			recreateLucideIcons();
			element.querySelector(".item__content").classList.add("list__item--show");
			createMessagePopup("New task added successfully.");
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
		listComplete.prepend(element);
		setStyleDone();
		createMessagePopup("Task completed!");
	} else {
		element.querySelector(".item__content").classList.remove("list__item--done");
		element.remove();
		list.prepend(element);
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
		disclaimerText = "No tasks were added.";
	}
	if (listToCheck === "complete") {
		listTarget = document.querySelector("#complete-list");
		disclaimerText = "No tasks were completed.";
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
			Search,
			Plus,
			Check,
			ChevronRight,
			Percent
		}
	});
}

if (FILTER_SELECTED.filter === "all") {
	renderTasks(taskListClass.getTaskList());
}
