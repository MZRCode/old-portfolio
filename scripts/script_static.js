const userID = '701518625760346172'; // Your Discord user ID

const elements = {
	statusBox: document.getElementById('status'),
	statusImage: document.getElementById('status-image'),
	avatarImage: document.getElementById('avatar-image'),
	avaterDecoration: document.getElementById('avatar-decoration'),
	bannerImage: document.getElementById('banner-image'),
	bannerColor: document.querySelector('.banner'),
	displayName: document.querySelector('.display-name'),
	username: document.querySelector('.username'),
	badges: document.querySelector('.badges-left'),
	customStatus: document.querySelector('.custom-status'),
	customStatusText: document.querySelector('.custom-status-text'),
	customStatusEmoji: document.getElementById('custom-status-emoji'),
};

async function fetchDiscordStatus() {
	try {
		const [lanyardResponse] = await Promise.all([
			fetch(`https://api.lanyard.rest/v1/users/${userID}`).then((response) =>
				response.json()
			),
		]);

		const lanyardData = lanyardResponse.data;

		const { discord_status, activities, discord_user, emoji, spotify } = lanyardData;

		elements.displayName.innerHTML = discord_user.display_name;
		elements.username.innerHTML = discord_user.username;

		const activityDisplay = document.getElementById('activity-display');
		const activitiesDivider = document.querySelector('.activites-divider');
		const activitiesTitle = document.querySelector('.activites-title');
		const activitiesSection = document.querySelector('.activities-section');
		activityDisplay.innerHTML = '';
		let hasActivity = false;

		if (spotify) {
			const artist = spotify.artist.replace(/;/g, ',');

			const spotifyHtml = `
            <div class='activity-item'>
                <div class='activity-icon'>
                    <img src='${spotify.album_art_url}' alt='Spotify Album Art' />
                </div>
                <div class='activity-details'>
                    <div class='activity-title'>
                        <a class='activity-href' href='https://open.spotify.com/intl-tr/track/${spotify.track_id}' target='_blank'>
                            ${spotify.song}
                        </a>
                    </div>
                    <div class='activity-subtitle'>by ${artist}</div>
                    <div class='activity-album'>on ${spotify.album}</div>
                </div>
            </div>`;

			activityDisplay.innerHTML = spotifyHtml;
			hasActivity = true;
		} else {
			const codingActivity = activities.find(activity => activity.name === 'Visual Studio Code');
			if (codingActivity) {
				const startIdx = codingActivity.assets.large_image.indexOf('https/raw');
				let resim = 'https://cdn.discordapp.com/emojis/1081709209932005498.png'; // TypeScript logo

				if (startIdx !== -1) resim = codingActivity.assets.large_image.substring(startIdx).replace('https/raw', 'https://raw');

				const codingHtml = `
                <div class='activity-item'>
                    <div class='activity-icon'>
                        <img src='${resim}' alt='Coding in VS Code' />
                    </div>
                    <div class='activity-details'>
                        <div class='activity-title'>Visual Studio Code</div>
                        <div class='activity-subtitle'>${codingActivity.details}</div>
                        <div class='activity-subtitle'>${codingActivity.state ? codingActivity.state : 'AFK'}</div>
                    </div>
                </div>`;

				activityDisplay.innerHTML = codingHtml;
				hasActivity = true;
			} else {
				hasActivity = false;
			};
		};

		if (hasActivity) {
			activitiesDivider.style.display = 'block';
			activitiesTitle.style.display = 'block';
			activitiesSection.style.display = 'block';
		} else {
			activitiesDivider.style.display = 'none';
			activitiesTitle.style.display = 'none';
			activitiesSection.style.display = 'none';
		};

		let imagePath;
		switch (discord_status) {
			case 'online':
				imagePath = './public/status/online.svg';
				break;
			case 'idle':
				imagePath = './public/status/idle.svg';
				break;
			case 'dnd':
				imagePath = './public/status/dnd.svg';
				break;
			case 'offline':
				imagePath = './public/status/offline.svg';
				break;
			default:
				imagePath = './public/status/offline.svg';
				break;
		}

		if (
			activities.find(
				(activity) =>
					activity.type === 1 &&
					(activity.url.includes('twitch.tv') ||
						activity.url.includes('youtube.com'))
			)
		) {
			imagePath = './public/status/streaming.svg';
		}

		elements.statusImage.src = imagePath;
		elements.statusImage.alt = `Discord status: ${discord_status}`;


		elements.customStatusText.innerHTML =
			activities[0].state != null ? activities[0].state : 'Not doing anything!';

		if (activities[0].emoji == null) {
			elements.customStatusEmoji.style.display = 'none';
		} else {
			elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${activities[0].emoji.id}?format=webp&size=20&quality=lossless`;
			elements.customStatusEmoji.style.marginRight = '5px';
		}

		if (activities[0].state == null && activities[0].emoji == null) {
			elements.customStatus.style.display = 'none';
			elements.customStatusEmoji.style.display = 'none';
			elements.customStatusText.style.display = 'none';
			elements.customStatus.removeAttribute('style');
			elements.customStatusEmoji.removeAttribute('style');
			elements.customStatusText.removeAttribute('style');
		} else {
			elements.customStatus.style.display = 'flex';
		};
	} catch (error) {
		console.error('Unable to retrieve Discord status:', error);
	}
}

const tooltips = document.querySelectorAll('.tooltip');
tooltips.forEach((tooltip) => {
	tooltip.addEventListener('mouseenter', () => {
		const ariaLabel = tooltip.getAttribute('aria-label');
		tooltip.setAttribute('data-tooltip-content', ariaLabel);
	});

	tooltip.addEventListener('mouseleave', () => {
		tooltip.removeAttribute('data-tooltip-content');
	});
});

const anchors = document.getElementsByTagName('a');

for (let i = 0; i < anchors.length; i++) {
	const anchor = anchors[i];
	const href = anchor.getAttribute('href');
	if (href) {
		anchor.setAttribute('title', href);
	}
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 6000);