// http://stackoverflow.com/a/14957674/288906
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.get(existingOptions => {
		const defaults = {
			starredReposInSidebar: false,
			forkedReposInSidebar: false,
			stargazers: 'hover',
			starredRepos: 'group',
			forkedRepos: 'group'
		};
		const newOptions = Object.assign(defaults, existingOptions);
		chrome.storage.sync.set(newOptions);
	});
});
