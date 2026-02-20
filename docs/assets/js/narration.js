// ========================================
// Narration Engine
// Section-aware TTS with smooth fade and pause control
// Uses Web Speech API (SpeechSynthesis)
// ========================================

class NarrationEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.enabled = localStorage.getItem('dr-cortes-narration') !== 'off';
        this.speaking = false;
        this.paused = false;
        this.currentUtterance = null;
        this.currentSection = null;
        this.fadeTimeout = null;
        this.voices = [];

        // Load voices (they load async in some browsers)
        this.synth.onvoiceschanged = () => {
            this.voices = this.synth.getVoices();
        };
        this.voices = this.synth.getVoices();

        // Narration content per section/decade
        this.narrations = {
            en: {
                landing: "Welcome to the interactive timeline of Dr. Carlos E. Cortés, a pioneering figure in multicultural education whose career has spanned seven remarkable decades.",
                '1950s': "The nineteen fifties. The Road to Riverside. Young Carlos graduates Phi Beta Kappa from UC Berkeley, earns his journalism degree from Columbia, serves in the military, and begins his journey toward academia.",
                '1960s': "The nineteen sixties. Becoming a Historian. Carlos earns his Ph.D. from the University of New Mexico, conducts Ford Foundation research in Brazil, and begins his long association with UC Riverside.",
                '1970s': "The nineteen seventies. Lurching into K-12 Education. Dr. Cortés teaches the first Chicano History course at UCR, publishes his award-winning book on Brazilian politics, and introduces the concept of the societal curriculum.",
                '1980s': "The nineteen eighties. The All-Purpose Multiculturalist. Dr. Cortés becomes a Distinguished California Humanist, appears on PBS, and begins his influential work in media and multicultural education.",
                '1990s': "The nineteen nineties. Everybody's Adjunct. After taking early retirement from UC, Dr. Cortés enters his most productive period, teaching at Harvard Summer Institutes and lecturing across Australia.",
                '2000s': "The two thousands. Curtain Going Up. Dr. Cortés publishes The Children Are Watching, becomes a cultural advisor for Nickelodeon, and earns an NAACP Image Award.",
                '2010s': "The twenty tens. Winding Down. Dr. Cortés publishes his memoir Rose Hill, receives honorary doctorates, and the City of Riverside establishes the Cortés Award in his honor.",
                '2020s': "The twenty twenties. Zombie Time. At age ninety-one, Dr. Cortés publishes his debut novel Scouts' Honor and enters the Multilingual Educator Hall of Fame."
            },
            es: {
                landing: "Bienvenidos a la línea de tiempo interactiva del Dr. Carlos E. Cortés, una figura pionera en la educación multicultural cuya carrera ha abarcado siete décadas notables.",
                '1950s': "Los años cincuenta. El camino a Riverside. El joven Carlos se gradúa Phi Beta Kappa de UC Berkeley, obtiene su título de periodismo de Columbia, sirve en el ejército y comienza su camino hacia la academia.",
                '1960s': "Los años sesenta. Convirtiéndose en historiador. Carlos obtiene su doctorado de la Universidad de Nuevo México, realiza investigación con la Fundación Ford en Brasil y comienza su larga asociación con UC Riverside.",
                '1970s': "Los años setenta. Entrando a la educación K-12. El Dr. Cortés enseña el primer curso de Historia Chicana en UCR, publica su galardonado libro sobre política brasileña e introduce el concepto del currículum societal.",
                '1980s': "Los años ochenta. El multiculturalista universal. El Dr. Cortés se convierte en Humanista Distinguido de California, aparece en PBS y comienza su influyente trabajo en medios y educación multicultural.",
                '1990s': "Los años noventa. El adjunto de todos. Después de jubilarse anticipadamente de UC, el Dr. Cortés entra en su período más productivo, enseñando en los Institutos de Verano de Harvard.",
                '2000s': "Los dos mil. Se levanta el telón. El Dr. Cortés publica Los niños están mirando, se convierte en asesor cultural de Nickelodeon y recibe un Premio Imagen de la NAACP.",
                '2010s': "Los años diez. Desacelerando. El Dr. Cortés publica sus memorias Rose Hill, recibe doctorados honorarios y la Ciudad de Riverside establece el Premio Cortés en su honor.",
                '2020s': "Los años veinte. Tiempo zombie. A los noventa y un años, el Dr. Cortés publica su primera novela Scouts' Honor y entra al Salón de la Fama del Educador Multilingüe."
            },
            pt: {
                landing: "Bem-vindos à linha do tempo interativa do Dr. Carlos E. Cortés, uma figura pioneira na educação multicultural cuja carreira abrangeu sete décadas notáveis.",
                '1950s': "Os anos cinquenta. O caminho para Riverside. O jovem Carlos se forma Phi Beta Kappa pela UC Berkeley, obtém seu diploma de jornalismo pela Columbia, serve no exército e inicia sua jornada rumo à academia.",
                '1960s': "Os anos sessenta. Tornando-se historiador. Carlos obtém seu doutorado pela Universidade do Novo México, realiza pesquisa pela Fundação Ford no Brasil e inicia sua longa associação com a UC Riverside.",
                '1970s': "Os anos setenta. Entrando na educação K-12. O Dr. Cortés leciona o primeiro curso de História Chicana na UCR, publica seu premiado livro sobre política brasileira e introduz o conceito de currículo societal.",
                '1980s': "Os anos oitenta. O multiculturalista versátil. O Dr. Cortés torna-se Humanista Distinto da Califórnia, aparece na PBS e inicia seu influente trabalho em mídia e educação multicultural.",
                '1990s': "Os anos noventa. O adjunto de todos. Após se aposentar antecipadamente da UC, o Dr. Cortés entra em seu período mais produtivo, lecionando nos Institutos de Verão de Harvard.",
                '2000s': "Os anos dois mil. Abre-se a cortina. O Dr. Cortés publica As Crianças Estão Observando, torna-se consultor cultural da Nickelodeon e recebe um Prêmio Imagem da NAACP.",
                '2010s': "Os anos dez. Desacelerando. O Dr. Cortés publica suas memórias Rose Hill, recebe doutorados honorários e a Cidade de Riverside estabelece o Prêmio Cortés em sua homenagem.",
                '2020s': "Os anos vinte. Tempo zumbi. Aos noventa e um anos, o Dr. Cortés publica seu primeiro romance Scouts' Honor e entra no Salão da Fama do Educador Multilíngue."
            }
        };

        this.setupToggleButton();
        this.listenForLanguageChanges();
    }

    setupToggleButton() {
        const btn = document.getElementById('btn-narration');
        if (!btn) return;

        this.updateButtonIcon();

        btn.addEventListener('click', () => {
            this.enabled = !this.enabled;
            localStorage.setItem('dr-cortes-narration', this.enabled ? 'on' : 'off');
            this.updateButtonIcon();

            if (!this.enabled) {
                this.stop();
            } else if (this.currentSection) {
                // Resume narration for current section
                this.speakSection(this.currentSection);
            }
        });
    }

    updateButtonIcon() {
        const btn = document.getElementById('btn-narration');
        if (!btn) return;
        const iconOn = btn.querySelector('.icon-speaker');
        const iconOff = btn.querySelector('.icon-speaker-off');
        if (this.enabled) {
            iconOn.style.display = '';
            iconOff.style.display = 'none';
        } else {
            iconOn.style.display = 'none';
            iconOff.style.display = '';
        }
    }

    listenForLanguageChanges() {
        window.addEventListener('languageChanged', () => {
            // If currently narrating, restart in new language
            if (this.speaking && this.currentSection) {
                this.stop();
                setTimeout(() => this.speakSection(this.currentSection), 300);
            }
        });
    }

    getVoice() {
        const lang = window.i18n?.currentLang || 'en';
        const langMap = { en: 'en', es: 'es', pt: 'pt' };
        const targetLang = langMap[lang] || 'en';

        // Try to find a good voice for the language
        let voice = this.voices.find(v => v.lang.startsWith(targetLang) && v.name.includes('Google'));
        if (!voice) voice = this.voices.find(v => v.lang.startsWith(targetLang));
        return voice || null;
    }

    speakSection(sectionKey) {
        if (!this.enabled) return;

        const lang = window.i18n?.currentLang || 'en';
        const text = this.narrations[lang]?.[sectionKey] || this.narrations.en[sectionKey];
        if (!text) return;

        // Don't re-narrate same section
        if (this.currentSection === sectionKey && this.speaking) return;

        // Stop any current narration with fade
        this.stop();
        this.currentSection = sectionKey;

        // Small delay for smooth transition
        this.fadeTimeout = setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.92;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            const voice = this.getVoice();
            if (voice) utterance.voice = voice;

            utterance.onstart = () => { this.speaking = true; };
            utterance.onend = () => {
                this.speaking = false;
                this.currentUtterance = null;
            };
            utterance.onerror = () => {
                this.speaking = false;
                this.currentUtterance = null;
            };

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
        }, 250);
    }

    stop() {
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        if (this.synth.speaking || this.synth.pending) {
            this.synth.cancel();
        }
        this.speaking = false;
        this.currentUtterance = null;
    }

    // Called when navigating away from a section (modal close, etc.)
    onSectionLeave() {
        this.stop();
        this.currentSection = null;
    }

    // Called when a decade modal opens
    onDecadeOpen(decadeKey) {
        this.speakSection(decadeKey);
    }

    // Called when landing page is shown
    onLandingVisible() {
        this.speakSection('landing');
    }
}

// Export as global
window.narration = new NarrationEngine();
