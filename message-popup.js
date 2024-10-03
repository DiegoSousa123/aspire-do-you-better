import {recreateLucideIcons} from "./main.js";
export const MESSAGE__NORMAL = "normal";
export const MESSAGE__ERROR = "error";
//Criar mensagem de erro/info
export function createMessagePopup(message, config = {messageType: MESSAGE__NORMAL}){
	removeExistentMessage();
	const popupContainer = document.createElement("div");
	popupContainer.setAttribute("class", "popup__message");
	popupContainer.setAttribute("data-identifier", Date.now().toString(16) + Math.random().toString(16).substring(2, 10));
	const popupText = document.createElement("p");
	const iconMessage = document.createElement("i");
	iconMessage.setAttribute("data-lucide", "");
	iconMessage.setAttribute("class", "message__icon");
	popupText.textContent = message;
	
	handleMessageType(popupContainer, iconMessage , config);
	
	popupContainer.appendChild(iconMessage);
	popupContainer.appendChild(popupText);
	document.body.appendChild(popupContainer);
	recreateLucideIcons();
	
	let tOut = setTimeout(function() {
		popupContainer.style.top = "10px";
		clearTimeout(tOut);
	}, 0);
	
	let tOut1 = setTimeout(function() {
		popupContainer.style.top = "-50%";
		let tO = setTimeout(()=>{
			if(popupContainer)document.body.removeChild(popupContainer);
			clearTimeout(tO);
		}, 500);
		clearTimeout(tOut1);
	}, 2800);
}
//try to remove another messages (is bugged)
function removeExistentMessage(){
	const currTarget = document.body.querySelectorAll(".popup__message");
	if(currTarget.length >= 1){
		currTarget.forEach((pop)=>{
			pop.remove();
	});
	}

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