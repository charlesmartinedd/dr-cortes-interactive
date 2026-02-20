// ========================================
// Dr. Carlos E. Cortes — Storytelling Timeline
// Scroll-driven narrative experience
// ========================================

// Configuration
const CONFIG = {
    dataUrl: 'assets/data/timeline-data.json',
    markerRadius: 38,
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

// Decade narrative intros (We → You → I voice progression)
const DECADE_INTROS = {
    '1950s': 'In post-war America, a young man from Kansas City set out on a path that would shape how a nation thinks about diversity. From UC Berkeley to Columbia Journalism, from Fort Gordon to a Phoenix newsroom — every step was preparation for the road ahead.',
    '1960s': 'You might say the sixties made Carlos Cort\u00e9s a historian. A Ford Foundation fellowship took him to Brazil. A Ph.D. from New Mexico gave him the tools. And in 1968, UC Riverside gave him a stage that would last fifty-seven years.',
    '1970s': 'The classroom expanded. A chapter in James Banks\u2019 Teaching Ethnic Studies launched a national speaking career. Reprint series preserved voices that textbooks ignored. And a new idea emerged: that society itself is a curriculum, teaching lessons no school ever planned.',
    '1980s': 'By now, the world was calling. PBS wanted documentaries. Harvard wanted lectures. Japan wanted perspective. The Distinguished California Humanist Award in 1980 signaled what everyone already knew: Carlos Cort\u00e9s had become the all-purpose multiculturalist.',
    '1990s': 'I took early retirement from UC in 1994 — and then the real work began. Harvard summer institutes, the Federal Executive Institute, Australian universities, and Riverside\u2019s own Multicultural Forum. Retirement was just a word.',
    '2000s': 'I discovered that children\u2019s television could reach millions. When Nickelodeon asked me to advise on Dora the Explorer, I saw an opportunity to shape how an entire generation understood cultural difference. The NAACP Image Award in 2009 confirmed that the work mattered.',
    '2010s': 'They called it \u201cWinding Down,\u201d but I wasn\u2019t finished. A memoir about growing up interracial. A four-volume encyclopedia. A city naming an award in my honor. Poetry. A column on American diversity. The fourth quarter has its own rhythm.',
    '2020s': 'Zombie Time — because I refuse to stop. A pandemic vision statement for Riverside. A consulting role at the Cheech museum. Cultural work on Puss in Boots: The Last Wish. A debut novel at 91. And now, the Multilingual Educator Hall of Fame. The story continues.'
};

// (All works now shown — no filter needed)

// Global state
const state = {
    data: null,
    activeModal: null
};

// ========== DATA LOADER ==========
class DataLoader {
    async load() {
        try {
            const response = await fetch(CONFIG.dataUrl);
            if (!response.ok) throw new Error(`Failed to load data: ${response.statusText}`);
            const data = await response.json();
            state.data = data;
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            const mockData = this.getMockData();
            state.data = mockData;
            return mockData;
        }
    }

    getMockData() {
        return {
            biography: {
                name: "Dr. Carlos E. Cort\u00e9s",
                title: "Edward A. Dickson Emeritus Professor of History",
                institution: "University of California, Riverside",
                bio: "Pioneering figure in multicultural education, ethnic studies, and diversity scholarship with a career spanning seven decades.",
                careerStart: 1955,
                totalWorks: "85",
                awards: [
                    { year: 1974, award: "Hubert Herring Memorial Award", description: "For Ga\u00facho Politics in Brazil" },
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
                    { title: "Ga\u00facho Politics in Brazil", year: "1974", description: "Award-winning first book on Brazilian politics." }
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
                    { title: "Scouts\u2019 Honor", year: "2025", description: "Debut novel at age 91." }
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

// ========== TIMELINE RENDERER (Horizontal SVG — kept) ==========
class TimelineRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.width = 1200;
        this.height = 420;
    }

    render() {
        const padding = { left: 65, right: 65 };
        const timelineY = 200;
        const lineLength = this.width - padding.left - padding.right;
        const decadeSpacing = lineLength / (CONFIG.decades.length - 1);

        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

        this.drawHorizontalLine(padding.left, timelineY, lineLength);

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

        const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerRing.setAttribute('cx', x);
        outerRing.setAttribute('cy', y);
        outerRing.setAttribute('r', radius + 6);
        outerRing.classList.add('decade-marker-ring');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.classList.add('decade-marker-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 5);
        text.classList.add('decade-marker-text');
        text.textContent = decade.key;

        const theme = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        theme.setAttribute('x', x);
        theme.setAttribute('y', y + radius + 30);
        theme.classList.add('decade-theme-text');
        theme.textContent = decade.theme;

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

        // Click scrolls to vertical narrative decade
        group.addEventListener('click', () => {
            const target = document.getElementById(`decade-${decade.key}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        this.svg.appendChild(group);

        gsap.set(group, { opacity: 0 });
        gsap.to(group, {
            opacity: 1,
            duration: 0.5,
            delay: 1.4 + (index * 0.1),
            ease: 'back.out(1.7)'
        });
    }
}

// ========== NARRATIVE TIMELINE (new — vertical storytelling) ==========
class NarrativeTimeline {
    constructor(container) {
        this.container = container;
    }

    render() {
        if (!state.data?.decades) return;

        const decades = state.data.decades;
        const html = [];

        for (const decadeConfig of CONFIG.decades) {
            const decadeData = decades[decadeConfig.key];
            if (!decadeData) continue;

            const entries = decadeData.entries || [];
            const intro = DECADE_INTROS[decadeConfig.key] || '';

            html.push(`
                <div id="decade-${decadeConfig.key}" class="decade-block">
                    <div class="decade-header scroll-reveal">
                        <h2>${decadeConfig.key}</h2>
                        <p class="decade-theme">"${decadeConfig.theme}"</p>
                        <p class="decade-intro">${intro}</p>
                    </div>
                    <div class="vertical-timeline">
                        ${entries.map(entry => `
                            <div class="timeline-entry scroll-reveal">
                                <div class="entry-year">${entry.year}</div>
                                <div class="entry-card">
                                    <h3>${entry.title}</h3>
                                    <p>${entry.description || ''}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `);
        }

        this.container.innerHTML = html.join('');
    }
}

// ========== SCROLL MANAGER ==========
class ScrollManager {
    constructor() {
        this.sections = [];
        this.navLinks = [];
    }

    init() {
        this.sections = Array.from(document.querySelectorAll('.section'));
        this.navLinks = Array.from(document.querySelectorAll('.nav-link'));

        // Section highlighting
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    this.navLinks.forEach(link => {
                        link.classList.toggle('active', link.dataset.section === id);
                    });
                }
            });
        }, {
            rootMargin: '-40% 0px -60% 0px',
            threshold: 0
        });

        this.sections.forEach(section => sectionObserver.observe(section));

        // Scroll-reveal for entry cards
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            revealObserver.observe(el);
        });
    }
}

// ========== TIMELINE NARRATOR (auto-voice on scroll) ==========
class TimelineNarrator {
    constructor() {
        this.narrated = new Set(); // decades already narrated
        this.isPlaying = false;
        this.queue = [];
        this.audio = new Audio();
        this.enabled = true;
        this.indicator = null; // will be created in init
    }

    init() {
        // Create a floating narrator indicator
        this.indicator = document.createElement('div');
        this.indicator.className = 'narrator-indicator';
        this.indicator.innerHTML = `
            <div class="narrator-wave"><span></span><span></span><span></span></div>
            <span class="narrator-label">Narrating...</span>
            <button class="narrator-mute" aria-label="Mute narration" title="Mute narration">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            </button>
        `;
        document.body.appendChild(this.indicator);

        // Mute button
        this.indicator.querySelector('.narrator-mute').addEventListener('click', () => {
            this.enabled = !this.enabled;
            this.indicator.classList.toggle('muted', !this.enabled);
            if (!this.enabled) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.isPlaying = false;
                this.queue = [];
                this.indicator.classList.remove('active');
            }
            // Update mute icon
            const svg = this.indicator.querySelector('.narrator-mute svg');
            if (!this.enabled) {
                svg.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
            } else {
                svg.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
            }
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.indicator.classList.remove('active');
            // Play next in queue if any
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.playNarration(next);
            }
        });

        // Observe decade headers
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const decade = entry.target.closest('.decade-block')?.id?.replace('decade-', '');
                    if (decade && !this.narrated.has(decade) && this.enabled) {
                        this.narrated.add(decade);
                        const intro = DECADE_INTROS[decade];
                        if (intro) {
                            if (this.isPlaying) {
                                this.queue.push(intro);
                            } else {
                                this.playNarration(intro);
                            }
                        }
                    }
                }
            });
        }, {
            rootMargin: '0px 0px -30% 0px',
            threshold: 0.5
        });

        document.querySelectorAll('.decade-header').forEach(header => {
            observer.observe(header);
        });
    }

    async playNarration(text) {
        if (!this.enabled) return;
        this.isPlaying = true;
        this.indicator.classList.add('active');

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, lang: currentLang })
            });

            if (!res.ok) {
                console.error('Narrator TTS error:', res.status);
                this.isPlaying = false;
                this.indicator.classList.remove('active');
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            this.audio.src = url;
            this.audio.play().catch(err => {
                console.log('Narrator autoplay blocked:', err);
                this.isPlaying = false;
                this.indicator.classList.remove('active');
            });

            this.audio.onended = () => {
                URL.revokeObjectURL(url);
                this.isPlaying = false;
                this.indicator.classList.remove('active');
                if (this.queue.length > 0) {
                    const next = this.queue.shift();
                    this.playNarration(next);
                }
            };
        } catch (err) {
            console.error('Narrator error:', err);
            this.isPlaying = false;
            this.indicator.classList.remove('active');
        }
    }
}

// ========== SELECTED WORKS RENDERER ==========
class WorksRenderer {
    renderPublications(container) {
        if (!state.data?.decades) return;

        const allWorks = dataLoader.getAllWorks();

        container.innerHTML = allWorks.map(work => `
            <div class="publication-card scroll-reveal">
                <div class="publication-year">${work.year}</div>
                <div class="publication-title">${work.title}</div>
                <div class="publication-desc">${work.description || ''}</div>
            </div>
        `).join('');
    }

    renderAwards(container) {
        const awards = state.data?.biography?.awards;
        if (!awards) return;

        container.innerHTML = awards.map(award => `
            <div class="award-card scroll-reveal">
                <div class="award-card-year">${award.year}</div>
                <div class="award-card-name">${award.award}</div>
                <div class="award-card-desc">${award.description}</div>
            </div>
        `).join('');
    }
}

// ========== SEARCH (kept from original) ==========
class SearchManager {
    constructor() {
        this.modal = document.getElementById('modal-search');
    }

    open() {
        if (!this.modal) return;
        this.modal.classList.add('active');
        state.activeModal = this.modal;
        document.body.style.overflow = 'hidden';

        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        input.value = '';
        results.innerHTML = '';
        setTimeout(() => input.focus(), 100);

        // Live search
        input.oninput = (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                results.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">Type at least 2 characters to search...</p>';
                return;
            }

            const matches = dataLoader.searchWorks(query);
            if (matches.length === 0) {
                results.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">No results found.</p>';
                return;
            }

            results.innerHTML = matches.map(work => `
                <div class="search-result-item" data-work-title="${work.title}">
                    <div class="search-result-title">${work.title}</div>
                    <div class="search-result-meta">${work.year}</div>
                </div>
            `).join('');

            results.querySelectorAll('.search-result-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.close();
                    // Find the entry in the vertical timeline and scroll to it
                    const entryCards = document.querySelectorAll('.entry-card h3');
                    for (const h3 of entryCards) {
                        if (h3.textContent === matches[index].title) {
                            h3.closest('.timeline-entry').scrollIntoView({ behavior: 'smooth', block: 'center' });
                            h3.closest('.entry-card').style.borderColor = 'var(--color-gold)';
                            setTimeout(() => {
                                h3.closest('.entry-card').style.borderColor = '';
                            }, 3000);
                            break;
                        }
                    }
                });
            });
        };
    }

    close() {
        if (state.activeModal) {
            state.activeModal.classList.remove('active');
            state.activeModal = null;
            document.body.style.overflow = '';
        }
    }
}

// ========== STATS COUNTER ==========
function animateStatsCounters() {
    const statNumbers = document.querySelectorAll('.hero-stat-number');
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

// ========== THEME TOGGLE ==========
function setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // Restore from localStorage
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('light');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

// ========== INTERNATIONALIZATION ==========
const I18N = {
    en: {
        hero_hook: 'We live in a world shaped by how we understand each other.',
        hero_subtitle: 'This is the story of one man who spent seven decades building bridges.',
        stat_years: 'Years',
        stat_milestones: 'Milestones',
        stat_decades: 'Decades',
        scroll_explore: 'Scroll to explore',
        timeline_intro: "You're about to travel through 70 years of scholarship, storytelling, and bridge-building.",
        ask_title: 'Ask Dr. Cort\u00e9s',
        ask_subtitle: "Have a question about equity, curriculum design, or ethnic studies? I've spent my career in conversation \u2014 let's continue it here.",
        works_title: 'Complete Works & Recognition',
        works_intro: '85 milestones across seven decades of learning to live together.',
        awards_title: 'Awards & Honors',
        chat_status: 'Ready to chat',
        reconnect: 'Reconnect'
    },
    es: {
        hero_hook: 'Vivimos en un mundo moldeado por c\u00f3mo nos entendemos unos a otros.',
        hero_subtitle: 'Esta es la historia de un hombre que pas\u00f3 siete d\u00e9cadas construyendo puentes.',
        stat_years: 'A\u00f1os',
        stat_milestones: 'Hitos',
        stat_decades: 'D\u00e9cadas',
        scroll_explore: 'Despl\u00e1zate para explorar',
        timeline_intro: 'Est\u00e1s a punto de recorrer 70 a\u00f1os de erudici\u00f3n, narraci\u00f3n y construcci\u00f3n de puentes.',
        ask_title: 'Preg\u00fantale al Dr. Cort\u00e9s',
        ask_subtitle: '\u00bfTienes una pregunta sobre equidad, dise\u00f1o curricular o estudios \u00e9tnicos? He pasado mi carrera en conversaci\u00f3n \u2014 contin\u00faemosla aqu\u00ed.',
        works_title: 'Obras Completas y Reconocimientos',
        works_intro: '85 hitos a lo largo de siete d\u00e9cadas de aprender a vivir juntos.',
        awards_title: 'Premios y Honores',
        chat_status: 'Listo para chatear',
        reconnect: 'Reconectar'
    },
    pt: {
        hero_hook: 'Vivemos em um mundo moldado por como nos entendemos.',
        hero_subtitle: 'Esta \u00e9 a hist\u00f3ria de um homem que passou sete d\u00e9cadas construindo pontes.',
        stat_years: 'Anos',
        stat_milestones: 'Marcos',
        stat_decades: 'D\u00e9cadas',
        scroll_explore: 'Role para explorar',
        timeline_intro: 'Voc\u00ea est\u00e1 prestes a percorrer 70 anos de erudi\u00e7\u00e3o, narrativa e constru\u00e7\u00e3o de pontes.',
        ask_title: 'Pergunte ao Dr. Cort\u00e9s',
        ask_subtitle: 'Tem uma pergunta sobre equidade, design curricular ou estudos \u00e9tnicos? Passei minha carreira em conversa\u00e7\u00e3o \u2014 vamos continu\u00e1-la aqui.',
        works_title: 'Obras Completas e Reconhecimento',
        works_intro: '85 marcos ao longo de sete d\u00e9cadas de aprendizado sobre viver juntos.',
        awards_title: 'Pr\u00eamios e Honras',
        chat_status: 'Pronto para conversar',
        reconnect: 'Reconectar'
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    const strings = I18N[lang];
    if (!strings) return;

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (strings[key]) {
            el.textContent = strings[key];
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Notify chat module
    if (typeof window.setChatLanguage === 'function') {
        window.setChatLanguage(lang);
    }
}

function setupLanguageSwitcher() {
    const switcher = document.getElementById('lang-switcher');
    if (!switcher) return;

    switcher.addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-btn');
        if (!btn) return;
        setLanguage(btn.dataset.lang);
    });
}

// ========== EVENT HANDLERS ==========
function setupEventHandlers() {
    // Search button
    document.getElementById('btn-search')?.addEventListener('click', () => {
        searchManager.open();
    });

    // Modal close buttons and overlays
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            searchManager.close();
        });
    });

    // Prevent modal container clicks from closing
    document.querySelectorAll('.modal-container').forEach(container => {
        container.addEventListener('click', (e) => e.stopPropagation());
    });

    // ESC closes search modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.activeModal) {
            searchManager.close();
        }
    });

    // Theme and language
    setupThemeToggle();
    setupLanguageSwitcher();
}

// ========== INITIALIZATION ==========
const dataLoader = new DataLoader();
const searchManager = new SearchManager();

async function init() {
    try {
        await dataLoader.load();

        // Render horizontal SVG timeline
        const timelineSvg = document.getElementById('timeline-svg');
        const timelineRenderer = new TimelineRenderer(timelineSvg);
        timelineRenderer.render();

        // Render vertical narrative timeline
        const narrativeContainer = document.getElementById('narrative-timeline');
        const narrativeTimeline = new NarrativeTimeline(narrativeContainer);
        narrativeTimeline.render();

        // Render selected works + awards
        const worksRenderer = new WorksRenderer();
        worksRenderer.renderPublications(document.getElementById('publications-grid'));
        worksRenderer.renderAwards(document.getElementById('awards-grid'));

        // Setup scroll manager (after DOM is populated)
        const scrollManager = new ScrollManager();
        scrollManager.init();

        // Setup timeline narrator (voice on scroll)
        const narrator = new TimelineNarrator();
        narrator.init();
        // Expose narrator globally so chat module can pause it
        window.narrator = narrator;

        // Setup event handlers
        setupEventHandlers();

        // Animate hero stats
        animateStatsCounters();

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 1200);

    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
