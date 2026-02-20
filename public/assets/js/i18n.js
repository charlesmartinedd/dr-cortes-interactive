// ========================================
// Internationalization (i18n) Module
// Supports: EN, ES, PT
// ========================================

const translations = {
    en: {
        // Header
        'site.title': 'Dr. Carlos E. Cortés',
        'site.subtitle': 'Interactive Timeline',
        'nav.about': 'About',
        'nav.search': 'Search',
        'nav.chat': 'Video Chat',

        // Stats
        'stats.years': 'Years Active',
        'stats.entries': 'Timeline Entries',
        'stats.decades': 'Decades',

        // Loading
        'loading.text': 'Loading Timeline...',

        // Search
        'search.placeholder': 'Search by title, category, year...',
        'search.hint': 'Type at least 2 characters to search...',
        'search.noResults': 'No results found.',

        // Chat
        'chat.welcome': 'Start a conversation with Dr. Cortés about his life\'s work in multicultural education.',
        'chat.placeholder': 'Ask Dr. Cortés a question...',
        'chat.connecting': 'Connecting...',
        'chat.textMode': 'Text Mode',
        'chat.avatarMode': 'Avatar Mode',
        'chat.disconnected': 'Disconnected',
        'chat.reconnect': 'Reconnect',
        'chat.readyToChat': 'Ready to chat',

        // Bio Modal
        'bio.title': 'Dr. Carlos E. Cortés',
        'bio.subtitle': 'Edward A. Dickson Emeritus Professor of History \u2022 UC Riverside',
        'bio.yearsInAcademia': 'Years in Academia',
        'bio.publishedWorks': 'Published Works',
        'bio.majorAwards': 'Major Awards',
        'bio.personalBackground': 'Personal Background',
        'bio.careerMilestones': 'Career Milestones',
        'bio.awardsRecognition': 'Awards & Recognition',

        // Decade Modal
        'decade.entries': 'Entries',
        'decade.works': 'Works',

        // Work Modal
        'work.year': 'Year:',
        'work.noDescription': 'No description available.',

        // Common
        'entries': 'entries'
    },

    es: {
        // Header
        'site.title': 'Dr. Carlos E. Cortés',
        'site.subtitle': 'Línea de Tiempo Interactiva',
        'nav.about': 'Acerca de',
        'nav.search': 'Buscar',
        'nav.chat': 'Video Chat',

        // Stats
        'stats.years': 'Años Activo',
        'stats.entries': 'Entradas',
        'stats.decades': 'Décadas',

        // Loading
        'loading.text': 'Cargando Línea de Tiempo...',

        // Search
        'search.placeholder': 'Buscar por título, categoría, año...',
        'search.hint': 'Escribe al menos 2 caracteres para buscar...',
        'search.noResults': 'No se encontraron resultados.',

        // Chat
        'chat.welcome': 'Inicia una conversación con el Dr. Cortés sobre su trabajo en educación multicultural.',
        'chat.placeholder': 'Hazle una pregunta al Dr. Cortés...',
        'chat.connecting': 'Conectando...',
        'chat.textMode': 'Modo Texto',
        'chat.avatarMode': 'Modo Avatar',
        'chat.disconnected': 'Desconectado',
        'chat.reconnect': 'Reconectar',
        'chat.readyToChat': 'Listo para conversar',

        // Bio Modal
        'bio.title': 'Dr. Carlos E. Cortés',
        'bio.subtitle': 'Profesor Emérito de Historia Edward A. Dickson \u2022 UC Riverside',
        'bio.yearsInAcademia': 'Años en la Academia',
        'bio.publishedWorks': 'Obras Publicadas',
        'bio.majorAwards': 'Premios Principales',
        'bio.personalBackground': 'Antecedentes Personales',
        'bio.careerMilestones': 'Hitos Profesionales',
        'bio.awardsRecognition': 'Premios y Reconocimientos',

        // Decade Modal
        'decade.entries': 'Entradas',
        'decade.works': 'Obras',

        // Work Modal
        'work.year': 'Año:',
        'work.noDescription': 'Descripción no disponible.',

        // Common
        'entries': 'entradas'
    },

    pt: {
        // Header
        'site.title': 'Dr. Carlos E. Cortés',
        'site.subtitle': 'Linha do Tempo Interativa',
        'nav.about': 'Sobre',
        'nav.search': 'Buscar',
        'nav.chat': 'Vídeo Chat',

        // Stats
        'stats.years': 'Anos Ativo',
        'stats.entries': 'Entradas',
        'stats.decades': 'Décadas',

        // Loading
        'loading.text': 'Carregando Linha do Tempo...',

        // Search
        'search.placeholder': 'Buscar por título, categoria, ano...',
        'search.hint': 'Digite pelo menos 2 caracteres para buscar...',
        'search.noResults': 'Nenhum resultado encontrado.',

        // Chat
        'chat.welcome': 'Inicie uma conversa com o Dr. Cortés sobre seu trabalho em educação multicultural.',
        'chat.placeholder': 'Faça uma pergunta ao Dr. Cortés...',
        'chat.connecting': 'Conectando...',
        'chat.textMode': 'Modo Texto',
        'chat.avatarMode': 'Modo Avatar',
        'chat.disconnected': 'Desconectado',
        'chat.reconnect': 'Reconectar',
        'chat.readyToChat': 'Pronto para conversar',

        // Bio Modal
        'bio.title': 'Dr. Carlos E. Cortés',
        'bio.subtitle': 'Professor Emérito de História Edward A. Dickson \u2022 UC Riverside',
        'bio.yearsInAcademia': 'Anos na Academia',
        'bio.publishedWorks': 'Obras Publicadas',
        'bio.majorAwards': 'Prêmios Principais',
        'bio.personalBackground': 'Contexto Pessoal',
        'bio.careerMilestones': 'Marcos da Carreira',
        'bio.awardsRecognition': 'Prêmios e Reconhecimento',

        // Decade Modal
        'decade.entries': 'Entradas',
        'decade.works': 'Obras',

        // Work Modal
        'work.year': 'Ano:',
        'work.noDescription': 'Descrição não disponível.',

        // Common
        'entries': 'entradas'
    }
};

// i18n Manager
class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('dr-cortes-lang') || 'en';
        document.documentElement.lang = this.currentLang;
    }

    t(key) {
        return translations[this.currentLang]?.[key] || translations.en[key] || key;
    }

    setLanguage(lang) {
        if (!translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('dr-cortes-lang', lang);
        document.documentElement.lang = lang;
        this.updateDOM();
        this.updateLangButtons();

        // Dispatch event for other modules (e.g., chat.js)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateDOM() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Update all elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update all elements with data-i18n-aria
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });

        // Update dynamic content - entry counts on timeline SVG
        document.querySelectorAll('.category-indicator').forEach(el => {
            const text = el.textContent;
            const num = text.match(/\d+/);
            if (num) {
                el.textContent = `${num[0]} ${this.t('entries')}`;
            }
        });
    }

    updateLangButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    }
}

// Export as global
window.i18n = new I18nManager();
