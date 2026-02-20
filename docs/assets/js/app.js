// ========================================
// Dr. Carlos E. Cortés - Timeline Application
// Interactive Bibliography Timeline with Modal Navigation
// ========================================

// Configuration
const CONFIG = {
    dataUrl: 'assets/data/timeline-data.json',
    markerRadius: 38, // Compact for 8 decade markers
    decades: [
        { key: '1950s', range: '1950-1961', theme: 'The Road to Riverside', color: '#1e3a5f' },
        { key: '1960s', range: '1962-1969', theme: 'Becoming a Historian', color: '#8b2942' },
        { key: '1970s', range: '1970-1979', theme: 'Lurching into K-12 Education', color: '#1e3a5f' },
        { key: '1980s', range: '1980-1989', theme: 'The All-Purpose Multiculturalist', color: '#8b2942' },
        { key: '1990s', range: '1990-1999', theme: "Everybody's Adjunct", color: '#1e3a5f' },
        { key: '2000s', range: '2000-2009', theme: 'Curtain Going Up', color: '#8b2942' },
        { key: '2010s', range: '2010-2019', theme: 'Winding Down', color: '#1e3a5f' },
        { key: '2020s', range: '2020-2026', theme: 'Zombie Time', color: '#8b2942' }
    ]
};

// Global state
const state = {
    data: null,
    activeModal: null,
    parentModal: null, // Track parent modal for navigation back
    selectedDecade: null,
    selectedWork: null,
    activeFilters: new Set()
};

// ========== DATA LOADER ==========
class DataLoader {
    async load() {
        try {
            const response = await fetch(CONFIG.dataUrl);
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.statusText}`);
            }
            const data = await response.json();
            state.data = data;
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            // Use mock data if file doesn't exist or CORS blocks it
            const mockData = this.getMockData();
            state.data = mockData;
            return mockData;
        }
    }

    getMockData() {
        return {
            biography: {
                name: "Dr. Carlos E. Cortés",
                title: "Edward A. Dickson Emeritus Professor of History",
                institution: "University of California, Riverside",
                bio: "Pioneering figure in multicultural education, ethnic studies, and diversity scholarship with a career spanning seven decades.",
                careerStart: 1955,
                totalWorks: "85",
                awards: [
                    { year: 1974, award: "Hubert Herring Memorial Award", description: "For Gaúcho Politics in Brazil" },
                    { year: 2009, award: "NAACP Image Award", description: "Nickelodeon advisory work" },
                    { year: 2021, award: "Constantine Panunzio Distinguished Emeriti Award", description: "First from UCR" }
                ]
            },
            decades: {
                '1950s': { theme: 'The Road to Riverside', totalEntries: 7, entries: [
                    { title: "B.A., Communications and Public Policy, UC Berkeley", year: "1956", description: "Graduated Phi Beta Kappa from UC Berkeley." }
                ]},
                '1960s': { theme: 'Becoming a Historian', totalEntries: 6, entries: [
                    { title: "Began Career as History Professor at UCR", year: "1968", description: "Launched a 57-year association with UC Riverside." }
                ]},
                '1970s': { theme: 'Lurching into K-12 Education', totalEntries: 12, entries: [
                    { title: "Gaúcho Politics in Brazil", year: "1974", description: "Award-winning first book on Brazilian politics." }
                ]},
                '1980s': { theme: 'The All-Purpose Multiculturalist', totalEntries: 12, entries: [
                    { title: "Beyond Language", year: "1986", description: "Influential bilingual education publication." }
                ]},
                '1990s': { theme: "Everybody's Adjunct", totalEntries: 12, entries: [
                    { title: "Took Early Retirement from UC", year: "1994", description: "Post-retirement career proved most productive." }
                ]},
                '2000s': { theme: 'Curtain Going Up', totalEntries: 12, entries: [
                    { title: "The Children Are Watching", year: "2000", description: "Landmark book on media and diversity." }
                ]},
                '2010s': { theme: 'Winding Down', totalEntries: 12, entries: [
                    { title: "Rose Hill", year: "2012", description: "Memoir about growing up in an interracial family." }
                ]},
                '2020s': { theme: 'Zombie Time', totalEntries: 12, entries: [
                    { title: "Scouts' Honor", year: "2025", description: "Debut novel at age 91." }
                ]}
            }
        };
    }

    getAllWorks() {
        if (!state.data?.decades) return [];

        const works = [];
        for (const decade of Object.values(state.data.decades)) {
            if (decade.entries) {
                works.push(...decade.entries);
            } else if (decade.categories) {
                for (const category of Object.values(decade.categories)) {
                    works.push(...category);
                }
            }
        }
        return works;
    }

    searchWorks(query) {
        const allWorks = this.getAllWorks();
        const lowerQuery = query.toLowerCase();

        return allWorks.filter(work => {
            return (
                work.title.toLowerCase().includes(lowerQuery) ||
                (work.description || '').toLowerCase().includes(lowerQuery) ||
                work.year.toString().includes(query)
            );
        });
    }
}

// ========== TIMELINE RENDERER ==========
class TimelineRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.width = 1200; // Wider for 8 decade markers
        this.height = 420;
    }

    render() {
        // Horizontal timeline - 1970s on left
        // Minimal padding - circles near edges
        const padding = { left: 65, right: 65 };
        const timelineY = 200; // Y position of the horizontal line
        const lineLength = this.width - padding.left - padding.right;
        const decadeSpacing = lineLength / (CONFIG.decades.length - 1);

        // Update SVG viewBox for horizontal layout
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

        // Draw horizontal timeline line
        this.drawHorizontalLine(padding.left, timelineY, lineLength);

        // Draw decade markers (left to right, 1970s first)
        CONFIG.decades.forEach((decade, index) => {
            const x = padding.left + (index * decadeSpacing);
            this.drawDecadeMarker(x, timelineY, decade, index);
        });
    }

    drawHorizontalLine(startX, y, length) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', y);
        line.setAttribute('x2', startX + length);
        line.setAttribute('y2', y);
        line.classList.add('timeline-line');

        this.svg.appendChild(line);

        // Animate line drawing (left to right)
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;

        gsap.to(line, {
            strokeDashoffset: 0,
            duration: 1.5,
            delay: 0.8,
            ease: 'power2.inOut'
        });
    }

    drawDecadeMarker(x, y, decade, index) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('decade-marker');
        group.setAttribute('data-decade', decade.key);

        const radius = CONFIG.markerRadius;

        // Outer ring (decorative)
        const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerRing.setAttribute('cx', x);
        outerRing.setAttribute('cy', y);
        outerRing.setAttribute('r', radius + 6);
        outerRing.classList.add('decade-marker-ring');

        // Main circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.classList.add('decade-marker-circle');

        // Decade label (inside circle)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 5);
        text.classList.add('decade-marker-text');
        text.textContent = decade.key;

        // Theme label (positioned below marker)
        const theme = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        theme.setAttribute('x', x);
        theme.setAttribute('y', y + radius + 30);
        theme.classList.add('decade-theme-text');
        theme.textContent = decade.theme;

        // Entry count badge (positioned below theme)
        if (state.data?.decades?.[decade.key]) {
            const decadeData = state.data.decades[decade.key];
            const entryCount = decadeData.totalEntries || decadeData.totalWorks || 0;

            const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            count.setAttribute('x', x);
            count.setAttribute('y', y + radius + 50);
            count.classList.add('category-indicator');
            count.textContent = `${entryCount} entries`;
            group.appendChild(count);
        }

        group.appendChild(outerRing);
        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(theme);

        // Click handler
        group.addEventListener('click', () => {
            modalManager.openDecadeModal(decade.key);
        });

        this.svg.appendChild(group);

        // Simple fade-in animation (no scale/movement)
        gsap.set(group, {
            opacity: 0
        });

        // Fade in only - circles stay in place
        gsap.to(group, {
            opacity: 1,
            duration: 0.5,
            delay: 1.4 + (index * 0.1),
            ease: 'back.out(1.7)'
        });
    }
}

// ========== MODAL MANAGER ==========
class ModalManager {
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Close any open modal first
        this.closeModal(true);

        modal.classList.add('active');
        state.activeModal = modal;
        document.body.style.overflow = 'hidden';

        // Focus trap
        modal.querySelector('.modal-close')?.focus();
    }

    closeModal(suppressParentNav = false) {
        if (state.activeModal) {
            state.activeModal.classList.remove('active');
            state.activeModal = null;

            // Stop narration when leaving a section
            if (window.narration) window.narration.onSectionLeave();

            // If there's a parent modal, return to it instead of main page
            if (state.parentModal && !suppressParentNav) {
                const parentModalId = state.parentModal;
                state.parentModal = null;
                this.openModal(parentModalId);
                return;
            }

            document.body.style.overflow = '';
        }
    }

    openBiographyModal() {
        const content = document.getElementById('bio-content');
        const bio = state.data?.biography;

        if (!bio) return;

        const careerYears = new Date().getFullYear() - bio.careerStart;

        // Select top 6 timeline highlights for compact display
        const topHighlights = bio.timeline_highlights ? bio.timeline_highlights.slice(0, 6) : [];

        content.innerHTML = `
            <div class="bio-modal-layout">
                <!-- Sidebar with photo and stats -->
                <div class="bio-sidebar">
                    <div class="bio-photo-container">
                        <img src="assets/images/carlos-cortes.jpg" alt="Dr. Carlos E. Cortés" class="bio-photo-img" onerror="this.parentElement.innerHTML='<div class=\\'bio-photo-placeholder\\'><span class=\\'initials\\'>CEC</span></div>'">
                    </div>
                    <div class="bio-stats">
                        <div class="bio-stat">
                            <span class="bio-stat-number">${careerYears}+</span>
                            <span class="bio-stat-label">Years in Academia</span>
                        </div>
                        <div class="bio-stat">
                            <span class="bio-stat-number">${bio.totalWorks}</span>
                            <span class="bio-stat-label">Published Works</span>
                        </div>
                        <div class="bio-stat">
                            <span class="bio-stat-number">${bio.awards?.length || 0}</span>
                            <span class="bio-stat-label">Major Awards</span>
                        </div>
                    </div>
                </div>

                <!-- Main content area -->
                <div class="bio-main">
                    <div class="bio-intro">
                        <p class="bio-lead">${bio.bio}</p>
                    </div>

                    ${bio.personal_background ? `
                        <div class="bio-background">
                            <h4>Personal Background</h4>
                            <p>${bio.personal_background}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Timeline highlights row -->
                ${topHighlights.length > 0 ? `
                    <div class="bio-timeline-section">
                        <h4>Career Milestones</h4>
                        <div class="bio-timeline-grid">
                            ${topHighlights.map(item => `
                                <div class="bio-milestone">
                                    <span class="milestone-year">${item.year}</span>
                                    <span class="milestone-event">${item.event}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Awards row -->
                <div class="bio-awards-section">
                    <h4>Awards & Recognition</h4>
                    <div class="bio-awards-grid">
                        ${bio.awards.map(award => `
                            <div class="bio-award-card">
                                <span class="award-year-badge">${award.year}</span>
                                <span class="award-name">${award.award}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.openModal('modal-biography');
    }

    openDecadeModal(decadeKey) {
        const decade = state.data?.decades?.[decadeKey];
        const decadeConfig = CONFIG.decades.find(d => d.key === decadeKey);

        if (!decade || !decadeConfig) return;

        state.selectedDecade = decadeKey;

        // Get entries list - supports both flat entries and legacy categories
        const allWorks = [];
        if (decade.entries) {
            allWorks.push(...decade.entries);
        } else if (decade.categories) {
            for (const works of Object.values(decade.categories)) {
                allWorks.push(...works);
            }
        }

        const displayWorks = allWorks;
        const entryCount = decade.totalEntries || decade.totalWorks || displayWorks.length;

        // Use decade-stats container for the entire new layout
        const statsContainer = document.getElementById('decade-stats');

        statsContainer.innerHTML = `
            <div class="decade-modal-layout">
                <!-- Header spanning full width -->
                <div class="decade-header-section">
                    <div class="decade-header-content">
                        <h2 class="decade-range">${decadeConfig.range}</h2>
                        <p class="decade-theme-label">${decadeConfig.theme}</p>
                    </div>
                    <div class="decade-header-stats">
                        <div class="header-stat">
                            <span class="header-stat-number">${entryCount}</span>
                            <span class="header-stat-label">Entries</span>
                        </div>
                    </div>
                </div>

                <!-- Chronological entries list -->
                <div class="decade-works-section">
                    <div class="works-compact-grid" id="works-grid-inner">
                        ${displayWorks.map(work => `
                            <div class="work-card-compact" data-title="${work.title}">
                                <div class="work-card-header">
                                    <span class="work-year-badge">${work.year}</span>
                                </div>
                                <h5 class="work-card-title">${work.title}</h5>
                                <p class="work-card-description">${work.description || ''}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Hide the old header elements (we're using our own in the layout)
        document.getElementById('decade-title').style.display = 'none';
        document.getElementById('decade-theme').style.display = 'none';
        document.getElementById('works-grid').style.display = 'none';

        // Add click handlers to work cards
        statsContainer.querySelectorAll('.work-card-compact').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.openWorkModal(displayWorks[index], true); // true = from decade modal
            });

            // Stagger animation
            gsap.from(card, {
                opacity: 0,
                y: 15,
                duration: 0.25,
                delay: index * 0.05,
                ease: 'power2.out'
            });
        });

        this.openModal('modal-decade');

        // Trigger narration for this decade
        if (window.narration) window.narration.onDecadeOpen(decadeKey);
    }

    createWorkCard(work) {
        const card = document.createElement('div');
        card.classList.add('work-card');

        card.innerHTML = `
            <h3 class="work-card-title">${work.title}</h3>
            <div class="work-card-year">${work.year}</div>
            <div class="work-card-description">${work.description || ''}</div>
        `;

        card.addEventListener('click', () => {
            this.openWorkModal(work);
        });

        return card;
    }

    openWorkModal(work, fromDecadeModal = false) {
        state.selectedWork = work;

        // If opening from decade modal, track it as parent for navigation back
        if (fromDecadeModal && state.selectedDecade) {
            state.parentModal = 'modal-decade';
        }

        const content = document.getElementById('work-detail');

        content.innerHTML = `
            <h2 class="work-title">${work.title}</h2>

            <div class="work-meta">
                <div class="work-meta-item">
                    <span class="work-meta-label">Year:</span>
                    <span class="work-meta-value">${work.year}</span>
                </div>
            </div>

            <div class="work-description">
                ${work.description || 'No description available.'}
            </div>
        `;

        this.openModal('modal-work');
    }

    openSearchModal() {
        this.openModal('modal-search');

        const searchInput = document.getElementById('search-input');
        const resultsContainer = document.getElementById('search-results');

        searchInput.value = '';
        resultsContainer.innerHTML = '';

        // Focus input
        setTimeout(() => searchInput.focus(), 100);

        // Live search
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                resultsContainer.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">Type at least 2 characters to search...</p>';
                return;
            }

            const results = dataLoader.searchWorks(query);

            if (results.length === 0) {
                resultsContainer.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">No results found.</p>';
                return;
            }

            resultsContainer.innerHTML = results.map(work => `
                <div class="search-result-item" data-work-title="${work.title}">
                    <div class="search-result-title">${work.title}</div>
                    <div class="search-result-meta">${work.year}</div>
                </div>
            `).join('');

            // Add click handlers
            resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.openWorkModal(results[index]);
                });
            });
        });
    }

    openFilterModal() {
        // Filter modal removed - data now uses flat chronological entries
    }
}

// ========== STATS COUNTER ==========
function animateStatsCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.target);

        gsap.to(stat, {
            textContent: target,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            delay: 1
        });
    });
}

// ========== DECADE NAVIGATION ==========
function setupDecadeNav() {
    const nav = document.querySelector('.decade-nav');

    CONFIG.decades.forEach(decade => {
        const dot = document.createElement('div');
        dot.classList.add('decade-dot');
        dot.setAttribute('data-decade', decade.key);
        dot.addEventListener('click', () => {
            modalManager.openDecadeModal(decade.key);
        });
        nav.appendChild(dot);
    });
}

// ========== THEME TOGGLE ==========
function setupThemeToggle() {
    const saved = localStorage.getItem('dr-cortes-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('dr-cortes-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('dr-cortes-theme', 'dark');
        }
    });
}

// ========== LANGUAGE SWITCHER ==========
function setupLanguageSwitcher() {
    // Initialize from i18n manager
    if (window.i18n) {
        window.i18n.updateDOM();
        window.i18n.updateLangButtons();
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (window.i18n) {
                window.i18n.setLanguage(lang);
            }
        });
    });
}

// ========== EVENT HANDLERS ==========
function setupEventHandlers() {
    // Navigation buttons
    document.getElementById('btn-about')?.addEventListener('click', () => {
        modalManager.openBiographyModal();
    });

    document.getElementById('btn-search')?.addEventListener('click', () => {
        modalManager.openSearchModal();
    });

    document.getElementById('btn-filter')?.addEventListener('click', () => {
        modalManager.openFilterModal();
    });

    // Modal close buttons and overlays
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            modalManager.closeModal();
        });
    });

    // Prevent modal container clicks from closing
    document.querySelectorAll('.modal-container').forEach(container => {
        container.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.activeModal) {
            modalManager.closeModal();
        }
    });
}

// ========== INITIALIZATION ==========
const dataLoader = new DataLoader();
const modalManager = new ModalManager();

async function init() {
    try {
        // Setup theme toggle (early for no flash)
        setupThemeToggle();

        // Load data
        await dataLoader.load();

        // Initialize timeline
        const timelineSvg = document.getElementById('timeline-svg');
        const timelineRenderer = new TimelineRenderer(timelineSvg);
        timelineRenderer.render();

        // Setup navigation
        setupDecadeNav();

        // Setup event handlers
        setupEventHandlers();

        // Setup language switcher
        setupLanguageSwitcher();

        // Animate stats counters
        animateStatsCounters();

        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');

            // Start landing narration after page loads
            if (window.narration) window.narration.onLandingVisible();
        }, 1500);

    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
