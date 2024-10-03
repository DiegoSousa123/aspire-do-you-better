//Sanitiza o titulo da meta
function sanitizeInputTask(task){
	const regex = /[<>\"'%;()&+/$,=[\]{}:^~?|`]/g;
	return task.replace(regex, "");
}
//Cria um ID único para a meta
function createUniqueID() {
	return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
export function getDataTask(inputTask, inputDate, inputColor){
	if(!inputTask || !inputDate) return "";
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	let sanitizedTask = sanitizeInputTask(inputTask);
	const handleDate = new Date(inputDate);
	const day = String(handleDate.getUTCDate()).padStart(2, '0');
	const month = String(handleDate.getMonth() + 1).padStart(2, '0');
	const year = String(handleDate.getFullYear());
	const obj = {
		id: createUniqueID(),
		task: sanitizedTask,
		date: `${daysOfWeek[handleDate.getUTCDay()]}, ${day}/${month}/${year}`,
		done: false,
		color: inputColor,
	}
	document.querySelector("#input-task").value = "";
	document.querySelector("#date-task").value = "";
	return obj;
}

