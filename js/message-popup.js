import {recreateLucideIcons} from "../main.js";
export const MESSAGE__NORMAL = "normal";
export const MESSAGE__ERROR = "error";
//Criar mensagem de erro/info

export function createMessagePopup(message, config = {messageType: MESSAGE__NORMAL}){
	const popupContainer = document.getElementById("message-popup");
	const iconMessage = document.getElementById("popup-icon");
	const textElement = document.getElementById("popup-text");
	textElement.textContent = message;
	handleMessageType(popupContainer, iconMessage , config);
	recreateLucideIcons();
	popupContainer.showPopover();
	
	let tOut1 = setTimeout(function() {
		popupContainer.hidePopover();
		clearTimeout(tOut1);
	}, 2800);
}
function handleMessageType(container , icon ,objectToReceive){
	const listOfClass = container.classList;
	let dataLucideType = "";
	if(objectToReceive.messageType === MESSAGE__NORMAL){
		if(listOfClass.contains("error__message")) listOfClass.remove("error__message");
		listOfClass.add("normal__message");
		dataLucideType = "info";
	}
	if(objectToReceive.messageType === MESSAGE__ERROR){
		if(listOfClass.contains("normal__message")) listOfClass.remove("normal__message");
		listOfClass.add("error__message");
		dataLucideType = "circle-x";
	}
	icon.dataset.lucide = dataLucideType;
}