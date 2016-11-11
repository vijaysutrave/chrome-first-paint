window.addEventListener('load', function() {
	window.setTimeout(function() {
		chrome.runtime.sendMessage({
			pageLoad: window.performance && window.performance.timing,
			paints: window.chrome && window.chrome.loadTimes(),
			resources: window.performance.getEntriesByType("resource"),
			memoryInitial: window.performance.memory && performance.memory.usedJSHeapSize,
			memoryMax: window.performance.memory && window.performance.memory.jsHeapSizeLimit
		});
		console.log(performance.memory);
	}, 1000);
	}, false);

