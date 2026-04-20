/**
 * ELITE INSIGHT GALLERY - SCRIPT.JS
 * Dynamically handles Gallery vs Detail view
 */

document.addEventListener('DOMContentLoaded', () => {
    setupThemeSwitcher();
    initNavigation();
});

const themes = [
    { name: 'NIKE_DYNAMISM', file: 'nike.css', icon: '👟' },
    { name: 'AURUM_EDITORIAL', file: 'aurum.css', icon: '⚜️' },
    { name: 'CYBER_CRIMSON', file: 'cyber.css', icon: '👾' },
    { name: 'EMBER_COZY', file: 'ember.css', icon: '🔥' },
    { name: 'TOKYO_NEON', file: 'tokyo.css', icon: '🏮' },
    { name: 'INDUSTRIAL_V2.0', file: 'style.css', icon: '⚡' },
    { name: 'SWISS_ULTRA', file: 'swiss.css', icon: '📐' },
    { name: 'PREMIUM_FUTURE', file: 'premium.css', icon: '✨' },
    { name: 'SOLAR_MISSION', file: 'solar.css', icon: '🚀' },
    { name: 'BRUTAL_STRENGTH', file: 'brutalist.css', icon: '🔨' },
    { name: 'BLUEPRINT_DRAFT', file: 'blueprint.css', icon: '📏' },
    { name: 'RETRO_MAC_OS', file: 'retro.css', icon: '🕹️' }
];

function setupThemeSwitcher() {
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeModal = document.getElementById('close-modal');
    const themeGrid = modal.querySelector('.theme-grid');
    const themeLink = document.getElementById('theme-link');

    const savedThemeFile = localStorage.getItem('insight-theme') || 'nike.css';
    themeLink.href = savedThemeFile;

    settingsBtn.addEventListener('click', () => {
        renderThemeOptions();
        modal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    function renderThemeOptions() {
        themeGrid.innerHTML = '';
        themes.forEach(theme => {
            const option = document.createElement('div');
            option.className = `theme-option ${themeLink.getAttribute('href') === theme.file ? 'active' : ''}`;
            option.innerHTML = `
                <span class="theme-icon">${theme.icon}</span>
                <span class="theme-name">${theme.name}</span>
            `;
            
            option.addEventListener('click', () => {
                themeLink.href = theme.file;
                localStorage.setItem('insight-theme', theme.file);
                modal.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                setTimeout(() => modal.classList.add('hidden'), 200);
            });
            themeGrid.appendChild(option);
        });
    }
}

/**
 * NAVIGATION SYSTEM
 */
function initNavigation() {
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();
}

function handleNavigation() {
    const hash = window.location.hash;
    const container = document.getElementById('insight-cards');
    
    if (hash.startsWith('#card-')) {
        const cardId = hash.replace('#', '');
        const cardData = INSIGHT_CARDS.find(c => c.id === cardId);
        if (cardData) {
            renderCardDetail(cardData);
            document.body.classList.add('is-detail-view');
            window.scrollTo(0, 0);
        } else {
            renderGallery();
        }
    } else {
        renderGallery();
        document.body.classList.remove('is-detail-view');
    }
}

/**
 * GALLERY VIEW
 */
function renderGallery() {
    const container = document.getElementById('insight-cards');
    container.innerHTML = '';
    // Always ensure correct classes are set for gallery layout
    container.classList.remove('detail-active');
    container.classList.add('gallery-grid');
    
    INSIGHT_CARDS.forEach(cardData => {
        const thumb = createThumbnail(cardData);
        container.appendChild(thumb);
    });
}

function createThumbnail(data) {
    const card = document.createElement('div');
    card.className = 'card-thumbnail';
    card.innerHTML = `
        <span class="thumb-category">${data.category}</span>
        <h3 class="thumb-title">${data.title}</h3>
        <p class="thumb-snippet">${data.shortDescription.substring(0, 100)}...</p>
        <div class="thumb-action">Otevřít kartu ➔</div>
    `;
    card.addEventListener('click', () => {
        window.location.hash = data.id;
    });
    return card;
}

/**
 * DETAIL VIEW
 */
function renderCardDetail(data) {
    const container = document.getElementById('insight-cards');
    container.innerHTML = '';
    container.classList.add('detail-active');
    container.classList.remove('gallery-grid');

    const backBtn = document.createElement('button');
    backBtn.className = 'back-to-gallery';
    backBtn.innerHTML = '← Zpět do galerie';
    backBtn.onclick = () => {
        document.body.classList.remove('is-detail-view');
        // BUGFIX: Clear the URL hash using pushState, which does NOT fire a hashchange event.
        // If we left the hash (e.g. #card-streak) in the URL, clicking that same card
        // again would not change the hash → no hashchange event → card never loads.
        // window.location.hash = '' would also fire hashchange and leave a trailing #.
        history.pushState(null, '', location.pathname + location.search);
        container.classList.remove('detail-active');
        container.classList.add('gallery-grid');
        renderGallery();
    };

    const backWrapper = document.createElement('div');
    backWrapper.className = 'back-wrapper';
    backWrapper.appendChild(backBtn);

    const detailWrapper = document.createElement('div');
    detailWrapper.className = 'detail-container';

    const cardElement = createFullCardHTML(data);
    detailWrapper.appendChild(cardElement);
    
    container.appendChild(backWrapper);
    container.appendChild(detailWrapper);
    
    // Attach events (actions & smart-links)
    attachCardEvents(cardElement, data);
}

function createFullCardHTML(data) {
    const article = document.createElement('article');
    article.className = 'expandable-card detail-mode';
    article.id = `card-${data.id}`;

    const longDescHTML = data.longDescription.map(p => `<p>${p}</p>`).join('');
    
    const sourcesHTML = data.sources.map(source => {
        const links = source.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`).join(' | ');
        return `<li>${source.type} <strong>${source.name}</strong> [${links}]</li>`;
    }).join('');

    const relatedHTML = data.nextCards.map(nc => `<li>${nc}</li>`).join('');

    article.innerHTML = `
        <div class="card-header">
            <div class="card-info">
                <span class="card-category">${data.category}</span>
                <h2 class="card-title">${data.title}</h2>
            </div>
            <button class="expand-btn" aria-label="Toggle Details">
                <span class="icon">▼</span>
            </button>
        </div>
        
        <div class="card-content">
            <p class="short-description">${data.shortDescription}</p>
            
            <div class="long-description-wrapper">
                <div class="long-description">
                    <div class="card-main-content">
                        ${longDescHTML}
                    </div>
                    
                    <div class="card-meta-block">
                        <div class="meta-section">
                            <h3>Zdroje:</h3>
                            <ul>${sourcesHTML}</ul>
                        </div>
                        
                        <div class="meta-section">
                            <h3>Navazující:</h3>
                            <ul>${relatedHTML}</ul>
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn elite-btn-secondary primary-action">Uložit do oblíbených</button>
                        <button class="btn elite-btn-tertiary secondary-action">Sdílet kartu</button>
                        <div class="action-feedback hidden"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return article;
}

function attachCardEvents(element, data) {
    const primaryBtn = element.querySelector('.primary-action');
    const secondaryBtn = element.querySelector('.secondary-action');
    const expandBtn = element.querySelector('.expand-btn');
    const feedback = element.querySelector('.action-feedback');

    // Toggle expansion
    if (expandBtn) {
        expandBtn.onclick = () => {
            element.classList.toggle('is-expanded');
            const icon = expandBtn.querySelector('.icon');
            if (icon) {
                icon.textContent = element.classList.contains('is-expanded') ? '▲' : '▼';
            }
        };
    }

    // Smart Links
    element.querySelectorAll('.smart-link').forEach(btn => {
        btn.onclick = () => {
            window.location.hash = btn.dataset.target;
        };
    });

    // Primary action
    primaryBtn.addEventListener('click', () => {
        showFeedback(feedback, data.primaryAction.feedback, true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#000000', '#ffaa00']
        });
    });

    // Secondary action
    secondaryBtn.addEventListener('click', () => {
        showFeedback(feedback, data.secondaryAction.feedback, false);
    });
}

function showFeedback(element, text, isMain) {
    if (!element) return;
    element.textContent = text;
    element.classList.remove('hidden', 'fade-in');
    void element.offsetWidth;
    element.classList.add('fade-in');
    
    if (isMain) {
        element.style.color = 'var(--accent-orange, var(--swiss-accent, var(--accent-primary)))';
    } else {
        element.style.color = 'inherit';
        element.style.opacity = '0.7';
    }
}
