class DarkModeToggle {
    constructor() {
        this.themeKey = 'theme'; // Chave unificada para o cookie
        this.init();
        this.loadSavedTheme();
        this.bindEvents();
    }

    init() {
        this.createToggleButton();

        // Detecta mudanças na preferência do sistema operacional
        this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.hasUserPreference()) {
                // Aplica o tema do sistema se o usuário não tiver uma preferência manual salva
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    createToggleButton() {
        // ... (código original para criar o botão toggle) ...
        this.toggleLabel = document.createElement('label');
        this.toggleLabel.className = 'day-night-toggle-switch';
        this.toggleLabel.setAttribute('aria-label', 'Alternar tema escuro/claro');
        this.toggleLabel.setAttribute('title', 'Alternar tema');

        this.toggleInput = document.createElement('input');
        this.toggleInput.type = 'checkbox';
        this.toggleInput.id = 'theme-switch';

        this.sliderSpan = document.createElement('span');
        this.sliderSpan.className = 'slider round';
        this.toggleLabel.appendChild(this.toggleInput);
        this.toggleLabel.appendChild(this.sliderSpan);

        const navbar = document.querySelector('.navbar');
        // Adiciona o toggle na navbar ou no body
        (navbar || document.body).appendChild(this.toggleLabel);

        this.toggleButton = this.toggleInput;
    }

    bindEvents() {
        this.toggleInput.addEventListener('change', () => {
            this.toggle(true);
        });

        // Evento para atalho de teclado
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Mantém o listener para eventos customizados de outros scripts
        document.addEventListener('themeChanged', (e) => {
            this.onThemeChange(e.detail.theme);
        });
    }

    toggle(isUserAction = false) {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Efeito visual de transição no toggle
        this.toggleLabel.classList.add('switching');
        setTimeout(() => this.toggleLabel.classList.remove('switching'), 600);

        // Atualiza o estado do input se não foi uma ação de usuário (como atalho de teclado)
        if (!isUserAction) {
            this.toggleInput.checked = (newTheme === 'dark');
        }

        this.setTheme(newTheme);
    }

    setTheme(theme) {
        // 🔥 APLICA O ATRIBUTO data-theme no <html> (para variáveis CSS)
        document.documentElement.setAttribute('data-theme', theme);
        
        // 🔥 APLICA/REMOVE A CLASSE .dark-mode no <body> (para compatibilidade com seletores simples)
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        this.toggleInput.checked = (theme === 'dark');

        this.saveTheme(theme);
        this.updateAriaLabel(theme);
        this.dispatchThemeChange(theme); // Mantém o evento customizado
        
        console.log(`Tema alterado para: ${theme}`);
    }

    // ... (funções auxiliares inalteradas) ...

    updateAriaLabel(theme) {
        const text = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
        this.toggleLabel.setAttribute('aria-label', `Alternar para ${text.toLowerCase()}`);
        this.toggleLabel.setAttribute('title', `Alternar para ${text.toLowerCase()}`);
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    saveTheme(theme) {
        // Salva no Cookie (seu método original)
        document.cookie = `${this.themeKey}=${theme}; path=/; max-age=31536000; samesite=Lax`;
    }

    loadSavedTheme() {
        let savedTheme = this.getCookieValue(this.themeKey);

        if (!savedTheme) {
            savedTheme = this.systemPrefersDark ? 'dark' : 'light';
        }

        this.setTheme(savedTheme);
    }

    getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    hasUserPreference() {
        return this.getCookieValue(this.themeKey) !== null;
    }

    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', { detail: { theme } });
        document.dispatchEvent(event);
    }

    onThemeChange(theme) {
        // Função chamada por outros scripts quando o tema muda
        if (typeof updateChartsTheme === 'function') {
            updateChartsTheme(theme);
        }
        window.dispatchEvent(new Event('darkModeToggled'));
    }

    // ⛔ FUNÇÕES DE CSS DE PÁGINA ESPECÍFICA REMOVIDAS
    // ⛔ Removidas: enablePageDarkCSS, updatePageDarkCSS, getPageName
    //    Razão: Não são mais necessárias se o tema for controlado por variáveis CSS globais.

    enableDarkMode() {
        this.setTheme('dark');
    }

    enableLightMode() {
        this.setTheme('light');
    }

    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }

    getThemeInfo() {
        return {
            currentTheme: this.getCurrentTheme(),
            systemPrefersDark: this.systemPrefersDark,
            hasUserPreference: this.hasUserPreference()
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Garante que o script só roda após o carregamento completo do DOM
    window.darkModeToggle = new DarkModeToggle();
    console.log('Dark Mode Toggle inicializado:', window.darkModeToggle.getThemeInfo());
});