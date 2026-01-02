// ========================================
// Dr. Carlos E. Cortés - Timeline Application
// Interactive Bibliography Timeline with Modal Navigation
// ========================================

// Configuration
const CONFIG = {
    dataUrl: 'assets/data/timeline-data.json',
    markerRadius: 45, // Compact for viewport fit
    decades: [
        { key: '1970s', range: '1970-1979', theme: 'Chicano Studies Pioneer', color: '#1e3a5f' },
        { key: '1980s', range: '1980-1989', theme: 'Multicultural Education Leader', color: '#8b2942' },
        { key: '1990s', range: '1990-1999', theme: 'Media & Diversity Scholar', color: '#1e3a5f' },
        { key: '2000s', range: '2000-2009', theme: 'Creative Consulting', color: '#8b2942' },
        { key: '2010s', range: '2010-2019', theme: 'Creative Works & Memoirs', color: '#1e3a5f' },
        { key: '2020s', range: '2020-2025', theme: 'Anti-Racism & Renewal', color: '#8b2942' }
    ],
    categoryColors: {
        'Books - Scholarly': '#1976d2',
        'Books - Edited Works': '#0288d1',
        'Articles': '#00796b',
        'Blogs': '#f57c00',
        'Plays': '#c2185b',
        'Novels': '#7b1fa2',
        'Books - Poetry': '#512da8',
        'Biography/Memoir': '#d32f2f',
        'Consulting Projects': '#0097a7',
        'Curriculum Development': '#388e3c',
        'Videos': '#e64a19',
        'Teaching Materials': '#5d4037',
        'Administrative Work': '#455a64',
        'Papers': '#689f38',
        'Books - Textbook Contributions': '#00838f'
    }
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
                bio: "Pioneering figure in multicultural education, ethnic studies, and diversity scholarship with a career spanning over five decades.",
                careerStart: 1968,
                totalWorks: "400+",
                awards: [
                    {
                        year: 1974,
                        award: "Hubert Herring Memorial Award",
                        description: "Pacific Coast Council on Latin American Studies for Gaúcho Politics in Brazil"
                    },
                    {
                        year: 2009,
                        award: "NAACP Image Award",
                        description: "Creative/Cultural Advisory work for Nickelodeon"
                    },
                    {
                        year: 2017,
                        award: "Honorable Mention - International Latino Book Awards",
                        description: "Best Book of Poetry for Fourth Quarter"
                    },
                    {
                        year: 2020,
                        award: "Constantine Panunzio Distinguished Emeriti Award",
                        description: "University of California (first from UCR)"
                    }
                ]
            },
            decades: {
                '1970s': {
                    theme: 'Chicano Studies Pioneer',
                    totalWorks: 8,
                    categories: {
                        'Books - Scholarly': [
                            {
                                title: "Gaúcho Politics in Brazil",
                                year: 1974,
                                category: "Books - Scholarly",
                                description: "Scholarly monograph examining regional politics in Rio Grande do Sul, Brazil.",
                                awards: "Hubert Herring Memorial Award",
                                isbn: "082630303X",
                                url: "https://www.amazon.com/Gaucho-Politics-Brazil-Grande-1930-1964/dp/082630303X"
                            },
                            {
                                title: "Three Perspectives on Ethnicity",
                                year: 1976,
                                category: "Books - Scholarly",
                                description: "Comparative analysis of Black, Chicano, and Native American ethnic experiences.",
                                isbn: "9780399503696"
                            }
                        ],
                        'Articles': [
                            {
                                title: "Teaching the Chicano Experience",
                                year: 1973,
                                category: "Articles",
                                description: "Foundational chapter on Chicano Studies pedagogy in James Banks' influential volume.",
                                url: "https://eric.ed.gov/?id=ED079204"
                            }
                        ]
                    }
                },
                '1980s': {
                    theme: 'Multicultural Education Leader',
                    totalWorks: 12,
                    categories: {
                        'Books - Edited Works': [
                            {
                                title: "Hispanics in the United States (30 volumes)",
                                year: 1980,
                                category: "Books - Edited Works",
                                description: "Monumental 30-volume series of Hispanic scholarship reprints.",
                                significance: "Major reference work in Hispanic studies"
                            }
                        ]
                    }
                },
                '1990s': {
                    theme: 'Media & Diversity Scholar',
                    totalWorks: 15,
                    categories: {
                        'Articles': [
                            {
                                title: "Media & Values Magazine Columns",
                                year: 1994,
                                category: "Articles",
                                description: "Series of articles on media treatment of diversity."
                            }
                        ]
                    }
                },
                '2000s': {
                    theme: 'Creative Consulting',
                    totalWorks: 10,
                    categories: {
                        'Books - Scholarly': [
                            {
                                title: "The Children Are Watching",
                                year: 2000,
                                category: "Books - Scholarly",
                                description: "Groundbreaking book analyzing how media teaches about diversity.",
                                isbn: "9780807739372",
                                url: "https://www.amazon.com/Children-Are-Watching-Diversity-Multicultural/dp/0807739375"
                            },
                            {
                                title: "The Making—and Remaking—of a Multiculturalist",
                                year: 2002,
                                category: "Books - Scholarly",
                                description: "Autobiographical educational memoir tracing the multicultural education movement.",
                                isbn: "9780807742518"
                            }
                        ]
                    }
                },
                '2010s': {
                    theme: 'Creative Works & Memoirs',
                    totalWorks: 8,
                    categories: {
                        'Biography/Memoir': [
                            {
                                title: "Rose Hill: An Intermarriage before Its Time",
                                year: 2012,
                                category: "Biography/Memoir",
                                description: "Memoir about growing up in an interracial, interfaith family in Kansas City.",
                                isbn: "9781597141888",
                                url: "https://www.heydaybooks.com/catalog/rose-hill-an-intermarriage-before-its-time/"
                            }
                        ],
                        'Books - Poetry': [
                            {
                                title: "Fourth Quarter: Reflections of a Cranky Old Man",
                                year: 2016,
                                category: "Books - Poetry",
                                description: "Poetry collection reflecting on aging and cultural change.",
                                awards: "Honorable Mention - 2017 International Latino Book Awards",
                                url: "https://www.amazon.com/Fourth-Quarter-Reflections-Cranky-Old/dp/1945378042"
                            }
                        ]
                    }
                },
                '2020s': {
                    theme: 'Anti-Racism & Renewal',
                    totalWorks: 4,
                    categories: {
                        'Novels': [
                            {
                                title: "Scouts' Honor",
                                year: 2025,
                                category: "Novels",
                                description: "Debut novel at age 91 - mystery set at Boy Scout Camp Matulia.",
                                significance: "First novel after career in academic scholarship"
                            }
                        ],
                        'Articles': [
                            {
                                title: "Renewing Multicultural Education: An Ancient Mariner's Manifesto",
                                year: 2025,
                                category: "Articles",
                                description: "Keynote address on three bad habits in multicultural education.",
                                url: "https://doi.org/10.1080/15210960.2025.2558492"
                            }
                        ]
                    }
                }
            }
        };
    }

    getAllWorks() {
        if (!state.data?.decades) return [];

        const works = [];
        for (const decade of Object.values(state.data.decades)) {
            if (decade.categories) {
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
                work.category.toLowerCase().includes(lowerQuery) ||
                work.description.toLowerCase().includes(lowerQuery) ||
                work.year.toString().includes(query)
            );
        });
    }
}

// ========== TIMELINE RENDERER ==========
class TimelineRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.width = 960; // Compact for ~900px viewports
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

        // Works count badge (positioned below theme)
        if (state.data?.decades?.[decade.key]) {
            const decadeData = state.data.decades[decade.key];
            const worksCount = decadeData.totalWorks || 0;

            const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            count.setAttribute('x', x);
            count.setAttribute('y', y + radius + 50);
            count.classList.add('category-indicator');
            count.textContent = `${worksCount} works`;
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

        // Get works list - show ALL works, no limit
        const allWorks = [];
        if (decade.categories) {
            for (const works of Object.values(decade.categories)) {
                allWorks.push(...works);
            }
        }

        // Display ALL works - no limit
        const displayWorks = allWorks;

        // Truncate summary to first 2 sentences for compact display
        const summaryText = decade.summary ?
            decade.summary.split('. ').slice(0, 2).join('. ') + '.' : '';

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
                            <span class="header-stat-number">${decade.totalWorks}</span>
                            <span class="header-stat-label">Works</span>
                        </div>
                        <div class="header-stat">
                            <span class="header-stat-number">${Object.keys(decade.categories || {}).length}</span>
                            <span class="header-stat-label">Categories</span>
                        </div>
                    </div>
                </div>

                <!-- Sidebar with summary and achievements -->
                <div class="decade-sidebar">
                    ${summaryText ? `
                        <div class="decade-summary-card">
                            <h4>Overview</h4>
                            <p>${summaryText}</p>
                        </div>
                    ` : ''}

                    ${decade.key_achievements && decade.key_achievements.length > 0 ? `
                        <div class="decade-achievements-card">
                            <h4>Key Achievements</h4>
                            <ul class="achievements-list">
                                ${decade.key_achievements.slice(0, 4).map(a => `<li>${a}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <!-- Works grid section -->
                <div class="decade-works-section">
                    <div class="works-header">
                        <h4>All Works (${displayWorks.length})</h4>
                    </div>
                    <div class="works-compact-grid" id="works-grid-inner">
                        ${displayWorks.map(work => `
                            <div class="work-card-compact" data-title="${work.title}">
                                <div class="work-card-header">
                                    <span class="work-year-badge">${work.year}</span>
                                    <span class="work-category-tag">${work.category}</span>
                                </div>
                                <h5 class="work-card-title">${work.title}</h5>
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
    }

    createWorkCard(work) {
        const card = document.createElement('div');
        card.classList.add('work-card');

        const categoryColor = CONFIG.categoryColors[work.category] || '#1976d2';
        card.style.setProperty('--card-color', categoryColor);

        card.innerHTML = `
            <div class="work-card-category">${work.category}</div>
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

        const categoryColor = CONFIG.categoryColors[work.category] || '#1976d2';
        const content = document.getElementById('work-detail');

        content.innerHTML = `
            <div class="work-category-badge" style="background: ${categoryColor}">
                ${work.category}
            </div>
            <h2 class="work-title">${work.title}</h2>

            <div class="work-meta">
                <div class="work-meta-item">
                    <span class="work-meta-label">Year:</span>
                    <span class="work-meta-value">${work.year}</span>
                </div>
                ${work.isbn ? `
                    <div class="work-meta-item">
                        <span class="work-meta-label">ISBN:</span>
                        <span class="work-meta-value">${work.isbn}</span>
                    </div>
                ` : ''}
                ${work.significance ? `
                    <div class="work-meta-item">
                        <span class="work-meta-label">Significance:</span>
                        <span class="work-meta-value">${work.significance}</span>
                    </div>
                ` : ''}
            </div>

            <div class="work-description">
                ${work.description || 'No description available.'}
            </div>

            ${work.enhanced_description ? `
                <div class="work-enhanced">
                    <h4>In-Depth Context</h4>
                    <p>${work.enhanced_description}</p>
                </div>
            ` : ''}

            ${work.related_themes && work.related_themes.length > 0 ? `
                <div class="work-themes">
                    ${work.related_themes.map(theme => `
                        <span class="theme-tag">${theme}</span>
                    `).join('')}
                </div>
            ` : ''}

            ${work.awards ? `
                <div class="work-awards">
                    <div class="work-awards-title">Awards & Recognition</div>
                    <div>${work.awards}</div>
                </div>
            ` : ''}

            ${work.url ? `
                <div class="work-links">
                    <a href="${work.url}" target="_blank" class="work-link">
                        View External Link →
                    </a>
                </div>
            ` : ''}
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
                    <div class="search-result-meta">${work.year} • ${work.category}</div>
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
        this.openModal('modal-filter');

        const container = document.getElementById('filter-categories');
        const allWorks = dataLoader.getAllWorks();

        // Count works per category
        const categoryCounts = {};
        allWorks.forEach(work => {
            categoryCounts[work.category] = (categoryCounts[work.category] || 0) + 1;
        });

        // Render categories
        container.innerHTML = Object.keys(CONFIG.categoryColors).map(category => `
            <div class="filter-category" data-category="${category}">
                <div class="filter-checkbox ${state.activeFilters.has(category) ? 'checked' : ''}"></div>
                <div class="filter-label">${category}</div>
                <div class="filter-count">${categoryCounts[category] || 0}</div>
            </div>
        `).join('');

        // Add toggle handlers
        container.querySelectorAll('.filter-category').forEach(item => {
            item.addEventListener('click', () => {
                const checkbox = item.querySelector('.filter-checkbox');
                const category = item.dataset.category;

                checkbox.classList.toggle('checked');

                if (state.activeFilters.has(category)) {
                    state.activeFilters.delete(category);
                } else {
                    state.activeFilters.add(category);
                }
            });
        });
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

        // Animate stats counters
        animateStatsCounters();

        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
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
