import { taskArray, findTask, renderTasks, update, ACTION_DELETE, ACTION_CONCLUDE} from "./main.js";

const listIncomplete = document.querySelector("#inconplete-list");
const listComplete = document.querySelector("#complete-list");

export function addAllClick() {
	listIncomplete.removeEventListener("click", handleListClick, false);
	listComplete.removeEventListener("click", handleListClick, false);
	listIncomplete.addEventListener("click", handleListClick, false);
	listComplete.addEventListener("click", handleListClick, false);
}
//funcao para tratar o clique
//nos items da lista
function handleListClick(event) {
	event.stopPropagation();
	const target = event.target;

	if (!target.classList.contains("action__button")) {
		if(!target.classList.contains("empty__disclaimer")){
			const targetElement = target.closest(".list__item");
			if(targetElement){ 
				toggleStateTask(targetElement, targetElement.dataset.id);
			}
		}
	} else {
		itemAction(target.closest(".list__item"));
	}
}
/*Funcao para abrir e gerenciar
as opcoes do menu popup 
*/
function itemAction(element) {
	const pos = element.getBoundingClientRect();
	const menu = element.querySelector(".action__menu");
	const menuItem = menu.querySelector(".menu__list");
	menu.style.top = `${pos.offsetHeight}px`;
	menu.style.right = `0`;
	if (!menu.classList.contains("action__menu--show")) {
		closeOtherPopups();
	}
	menu.classList.toggle("action__menu--show");
	menuItem.removeEventListener("click", handleItemAction);
	document.removeEventListener("click", closeOtherPopups);
	menuItem.addEventListener("click", handleItemAction);
	document.addEventListener("click", closeOtherPopups);
}
//Funcao para fechar outros menus
//ao clicar no botao
function closeOtherPopups() {
	const actMenu = document.querySelectorAll(".action__menu");
	actMenu.forEach((item) => {
		if (item.classList.contains("action__menu--show")) {
			item.classList.toggle("action__menu--show");
		}
	});
}
//Checar clique fora do menu
//para fechar o menu
/*function handleClickOutsideMenu(e) {
	const actMenu = document.querySelectorAll(".action__menu");
	actMenu.forEach((item) => {
		if (item.classList.contains("action__menu--show")) {
			item.classList.toggle("action__menu--show");
		}
	});
} */
//funcao para tratar o evento de clique
//no menu de acao dos items
function handleItemAction(e) {
	const eTarget = findTheElement(e);
	e.stopPropagation();
	const target = e.target;
	if (target.dataset.function === "edit") {
		!isDone(eTarget.querySelector(".data__title").textContent)
			? console.log(`Clicked edit on: ${JSON.stringify(taskArray[findTask(taskArray, eTarget.dataset.id)])}`)
			: console.log(`Clicked edit on: ${JSON.stringify(taskArray[findTask(taskArray, eTarget.dataset.id)])} that is complete`);
	} else if (target.dataset.function === "delete") {
		removeTask(eTarget, findTask(taskArray, eTarget.dataset.id));
	}
	target.closest(".action__menu").classList.toggle("action__menu--show");
}
//Funcao para remover meta
function removeTask(element, taskToRemove) {
	taskArray.splice(taskToRemove, 1);
	update(element, 0, ACTION_DELETE);
}
//Funcao para pegar o titulo
//no elemento da lista
export function findTheElement(origin) {
	if (!origin) return;
	return origin.target.closest(".list__item");
}
export function isDone(element) {
	for (let i of taskArray) {
		if (i.task === element && i.done === true) {
			return true;
		}
	}
}

//marcar meta como concluida ou nao
function toggleStateTask(element, targetId) {
	const taskId = findTask(taskArray, targetId);
	taskArray[taskId].done = !taskArray[taskId].done;
	update(element, taskId, ACTION_CONCLUDE);
}

