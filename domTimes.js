
window.addEventListener('load', sendTimes, false);

function sendTimes() {
	/* safe check */
	if(!chrome.loadTimes) {
		return
	}
	window.setTimeout(getPerfTimes, 500)
}

function getPerfTimes() {
	/* If chrome times is not been populated yet, try again */
	if(!chrome.loadTimes().firstPaintTime) {
		setTimeout(getPerfTimes, 2000);
		return;
	}
	chrome.runtime.sendMessage({
		pageLoad: window.performance && window.performance.timing,
		paints: window.chrome && window.chrome.loadTimes(),
		resources: window.performance.getEntriesByType("resource"),
		memoryInitial: window.performance.memory && performance.memory.usedJSHeapSize,
		memoryMax: window.performance.memory && window.performance.memory.jsHeapSizeLimit
	});
}
