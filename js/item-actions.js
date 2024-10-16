import {taskListClass, renderTasks, update, ACTION_DELETE, ACTION_CONCLUDE, ACTION_UPDATE} from "../main.js";
import {createMessagePopup, MESSAGE__ERROR} from './message-popup.js';
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
			const targetElement = findTheElement(event);
			if(targetElement){ 
				toggleStateTask(targetElement, targetElement.dataset.id);
			}
		}
	} else {
		itemAction(findTheElement(event));
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

//funcao para tratar o evento de clique
//no menu de acao dos items
function handleItemAction(e) {
	const eTarget = findTheElement(e);
	e.stopPropagation();
	const target = e.target;
	if (target.dataset.function === "edit") {
		update(eTarget, eTarget.dataset.id, ACTION_UPDATE);
	} else if (target.dataset.function === "delete") {
		removeTask(eTarget, eTarget.dataset.id);
	}
	target.closest(".action__menu").classList.toggle("action__menu--show");
}
//Funcao para remover meta
function removeTask(element, taskId) {
	try{
		taskListClass.deleteTask(taskId);
		update(element, 0, ACTION_DELETE);
	}catch(e){
		createMessagePopup(e, {messageType: MESSAGE__ERROR});
	}
}
//Funcao para pegar o titulo
//no elemento da lista
export function findTheElement(origin) {
	if (!origin) return;
	return origin.target.closest(".list__item");
}

//marcar meta como concluida ou nao
function toggleStateTask(element, targetId) {
	const curr = taskListClass.getTaskItem(targetId);
	curr.done = !curr.done;
	update(element, targetId, ACTION_CONCLUDE);
}