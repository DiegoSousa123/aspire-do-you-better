const isTotalZero = (total) => {
	return total === 0;
};

/*expected: getTaskCompletionStats method of taskListClass*/
export function handleProgress({complete, total}){
 //If the popover is already open at this point, we should not recalculate
 //the progress
 const progressContainer = document.getElementById("progress-container");
 const isPopoverHidden = progressContainer.getAttribute("aria-hidden") === 'true';
	if(progressContainer.matches(":popover-open")){
		progressContainer.setAttribute("aria-hidden", `${!isPopoverHidden}`);
		document.getElementById("btn-toggle-search").setAttribute("aria-expanded", `${isPopoverHidden}`);
		return;
	}
	const progress = document.getElementById("progress");
	const progressText = document.getElementById("progress-text");
	const radius = progress.r.baseVal.value;
	const circunferenceCircle = 2 * Math.PI * radius;
	progress.style.strokeDasharray = `${circunferenceCircle}`;
	if(isTotalZero(total)){
		progress.style.strokeDashoffset = `${circunferenceCircle}`;
		progressText.textContent = "0%";
		return;
	}
	const percentage = ((complete * 100 / total) / 100);
	const offsetPercentage = circunferenceCircle - (percentage	* circunferenceCircle);
	progressText.textContent = `${Number(percentage * 100).toFixed()}%`;
	progress.style.strokeDashoffset = `${offsetPercentage}`;
	
	document.getElementById("btn-toggle-search").setAttribute("aria-expanded", `${isPopoverHidden}`);
	progressContainer.setAttribute("aria-hidden", `${!isPopoverHidden}`);
}
