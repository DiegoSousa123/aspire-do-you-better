const isTotalZero = (total)=>{
	return total === 0;
}
/*expected: getTaskCompletionStats method of taskListClass*/
export function handleProgress({complete, total}){
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
}