const iconStar = '<svg aria-label="Stars" class="octicon octicon-star" height="16" role="img" version="1.1" viewBox="0 0 14 16" width="14"><path d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"></path></svg>';
const iconRepo = '<svg aria-label="Repository" class="octicon octicon-repo repo-icon" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"></path></svg>';

const newsFeed = document.querySelector('.news');

function fromHTML(html, all) {
	const helper = document.createElement('div');
	helper.innerHTML = html;
	if (all) {
		all = document.createDocumentFragment();
		Array.from(helper.childNodes).map(all.appendChild, all);
		return all;
	}
	return helper.firstElementChild;
}

function usersHTML(users) {
	return Array.from(users)
	.map(user => `<a href="/${user}" style="color:inherit">${user}</a>`)
	.join(', ');
}

function groupRepos({action, selector, title, sidebarHolder, mainHolder, actors}) {
	if (action === 'off') {
		return;
	}
	const events = Array.from(document.querySelectorAll(selector));
	if (action === 'hide') {
		events.forEach(event => event.remove());
		return;
	}

	const holder = action === 'group-sidebar' ? sidebarHolder : mainHolder;
	const map = events.reduce((repos, item) => {
		const user = item.querySelector('.title a:nth-child(1)').textContent;
		const repo = item.querySelector('.title a:nth-child(2)').textContent;
		if (!repos.has(repo)) {
			repos.set(repo, new Set());
		}
		repos.get(repo).add(user);
		return repos;
	}, new Map());
	if (map.size) {
		const groupEl = fromHTML(`
			<div class="boxed-group flush">
				<h3>${title}</h3>
				<ul class="boxed-group-inner mini-repo-list"></ul>
			</div>`);
		const listEl = groupEl.querySelector('.mini-repo-list');
		map.forEach((users, repoUrl) => {
			const [owner, repo] = repoUrl.split('/');
			listEl.appendChild(fromHTML(`
				<li class="public source ghgn-actors-${actors}">
					<div class="mini-repo-list-item">
						<a href="/${repoUrl}" class="css-truncate">
						${iconRepo}
						<span class="repo-and-owner css-truncate-target">
							<span class="owner css-truncate-target">${owner}</span>/<span class="repo">${repo}</span>
						</span>
					</a>
					<span class="stars ghgn-stars">
						${users.size > 1 ? users.size : ''}
						${iconStar}
					</span>
					<div class="ghgn-actors">${actors === 'none' ? '' : usersHTML(users)}</div>
				</div>
			</li>`));
		});
		holder.appendChild(groupEl);
		events.forEach(event => event.remove());
	}
}

function init(options) {
	const sidebarHolder = document.createElement('div');
	const mainHolder = document.createElement('div');

	// handle stars
	groupRepos({
		selector: '.alert.watch_started',
		title: 'Starred repositories',
		action: options.starredRepos,
		actors: options.actors,
		sidebarHolder,
		mainHolder
	});

	// handle forks
	groupRepos({
		selector: '.alert.fork',
		title: 'Forked repositories',
		action: options.forkedRepos,
		actors: options.actors,
		sidebarHolder,
		mainHolder
	});

	// add spawn points to document
	const firstSideBox = document.querySelector('.dashboard-sidebar .boxed-group');
	firstSideBox.parentNode.insertBefore(sidebarHolder, firstSideBox);

	const accountSwitcher = document.querySelector('.account-switcher');
	newsFeed.insertBefore(mainHolder, newsFeed.children[accountSwitcher ? 1 : 0]);
}

chrome.storage.sync.get(init);
