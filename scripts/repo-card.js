const username = 'MZRCode'; // Your GitHub username

function saveToCache(data) {
    localStorage.setItem('githubRepos', JSON.stringify(data));
    localStorage.setItem('cacheTimestamp', Date.now());
}

function getFromCache() {
    const data = localStorage.getItem('githubRepos');
    const timestamp = localStorage.getItem('cacheTimestamp');
    if (data && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp, 10);
        const oneDay = 24 * 60 * 60 * 1000;
        if (cacheAge < oneDay) {
            return JSON.parse(data);
        };
    };
    return null;
}

async function fetchGitHubRepos() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) return;

        const data = await response.json();
        saveToCache(data);

        return data;
    } catch { }
}

async function getGitHubRepos() {
    const cachedData = getFromCache();
    if (cachedData) {
        return cachedData;
    } else {
        const data = await fetchGitHubRepos();
        return data;
    };
}

async function get(url) {
    const CACHE_TIMEOUT = 60000;
    const now = new Date().getTime();
    const prevResp = JSON.parse(localStorage.getItem(url));
    if (prevResp && Math.abs(now - prevResp.time) < CACHE_TIMEOUT) {
        return prevResp.data;
    }
    const resp = await fetch(url);
    const json = await resp.json();
    localStorage.setItem(url, JSON.stringify({ time: now, data: json }));
    return json;
}

async function reloadRepoCards() {
    const emojis = await get('https://api.github.com/emojis');
    const colors = await get('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json');

    const themes = {
        'light-default': {
            background: 'white',
            borderColor: '#e1e4e8',
            color: '#586069',
            linkColor: '#0366d6',
        },
        'dark-theme': {
            background: 'rgb(13, 17, 23)',
            borderColor: 'rgb(48, 54, 61)',
            color: 'rgb(139, 148, 158)',
            linkColor: 'rgb(88, 166, 255)',
        }
    };

    const repos = await getGitHubRepos();

    const container = document.getElementById('repos-container');
    container.innerHTML = '';

    const oneSVG = '/public/icons/repo.svg';
    const twoSVG = '/public/icons/star.svg';
    const threeSVG = '/public/icons/fork.svg';

    for (let i = 0; i < repos.length; i++) {
        const data = repos[i];

        const theme = themes['dark-theme'];

        data.description = (data.description || '').replace(/:\w+:/g, function (match) {
            const name = match.substring(1, match.length - 1);
            const emoji = emojis[name];
            if (emoji) {
                return `<span><img src="${emoji}" style="width: 1rem; height: 1rem; vertical-align: -0.2rem;" alt="${name}"></span>`;
            };

            return match;
        });

        const repoCard = document.createElement('div');
        repoCard.classList.add('repo-card');
        repoCard.setAttribute('data-repo', data.name);
        repoCard.setAttribute('data-theme', 'dark-theme');

        repoCard.innerHTML = `
        <div style="font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji; border: 1px solid ${theme.borderColor}; border-radius: 6px; background: ${theme.background}; padding: 16px; font-size: 14px; line-height: 1.5; color: #24292e;">
          <div style="display: flex; align-items: center;">
            <img src="${oneSVG}" style="fill: ${theme.color}; margin-right: 8px; width: 16px; height: 16px;" alt="One SVG"/>
            <span style="font-weight: 600; color: ${theme.linkColor};">
              <a style="text-decoration: none; color: inherit;" href="${data.html_url}">${data.name}</a>
            </span>
          </div>
          <div style="display: ${data.fork ? 'block' : 'none'}; font-size: 12px; color: ${theme.color};">Forked from <a style="color: inherit; text-decoration: none;" href="${data.fork ? data.html_url : ''}">${data.fork ? data.full_name : ''}</a></div>
          <div style="font-size: 12px; margin-bottom: 16px; margin-top: 8px; color: ${theme.color};">${data.description}</div>
          <div style="font-size: 12px; color: ${theme.color}; display: flex;">
            <div style="${data.language ? '' : 'display: none;'} margin-right: 16px;">
              <span style="width: 12px; height: 12px; border-radius: 100%; background-color: ${data.language ? colors[data.language].color : ''}; display: inline-block; top: 1px; position: relative;"></span>
              <span>${data.language}</span>
            </div>
            <div style="display: ${data.stargazers_count === 0 ? 'none' : 'flex'}; align-items: center; margin-right: 16px;">
              <a href="https://www.github.com/${data.full_name}/stargazers" style="display: flex; align-items: center; text-decoration: none; color: inherit;">
                <img src="${twoSVG}" style="fill: ${theme.color}; width: 16px; height: 16px;" alt="Stars"/>
               &nbsp; <span>${data.stargazers_count}</span>
              </a>
            </div>
            <div style="display: ${data.forks === 0 ? 'none' : 'flex'}; align-items: center;">
               <a href="https://www.github.com/${data.full_name}/network/members" style="display: flex; align-items: center; text-decoration: none; color: inherit;">
                <img src="${threeSVG}" style="fill: ${theme.color}; width: 16px; height: 16px;" alt="Forks"/>
                &nbsp; <span>${data.forks}</span>
              </a>
            </div>
          </div>
        </div>`;

        container.appendChild(repoCard);
    }
};

window.addEventListener('DOMContentLoaded', reloadRepoCards);