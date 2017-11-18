var firstPaintTime;
chrome.runtime.onMessage.addListener(function(res, sender, sendResponse) {
	chrome.storage.local.get('loadTimes', function(data) {

		data.loadTimes = data.loadTimes || {};

		data.loadTimes['tab' + sender.tab.id] = {
			pageLoad: res.pageLoad,
			chromeData: res.paints,
			resources: res.resources,
			memoryInitial: res.memoryInitial,
			memoryMax: res.memoryMax
		}

		firstPaintTime = String((((res.paints.firstPaintTime * 1000) - res.pageLoad.navigationStart) /1000).toFixed(2));
		chrome.storage.local.set(data);
		chrome.browserAction.setBadgeText({text: firstPaintTime, tabId: sender.tab.id});
	});
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	chrome.storage.local.get('loadTimes', function(data) {
		if (data.loadTimes) delete data.loadTimes['tab' + tabId];
		chrome.storage.local.set(data);
	});
});
