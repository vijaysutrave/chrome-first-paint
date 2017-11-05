window.addEventListener('load', sendTimes, false);

function sendTimes() {
	window.setTimeout(function() {
		chrome.runtime.sendMessage({
			pageLoad: window.performance && window.performance.timing,
			paints: window.chrome && window.chrome.loadTimes(),
			resources: window.performance.getEntriesByType("resource"),
			memoryInitial: window.performance.memory && performance.memory.usedJSHeapSize,
			memoryMax: window.performance.memory && window.performance.memory.jsHeapSizeLimit
		});
	}, 500)
}
