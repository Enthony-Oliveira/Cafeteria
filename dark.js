class DarkModeToggle {
    constructor() {
        this.init();
        this.loadSavedTheme();
        this.bindEvents();
    }

    init() {
        this.createToggleButton();

        this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.hasUserPreference()) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    createToggleButton() {
        // Estrutura HTML COMPLETA criada via JavaScript:
        // <label class="day-night-toggle-switch">
        //   <input type="checkbox" id="theme-switch">
        //   <span class="slider round"></span>
        // </label>

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
        document.body.appendChild(this.toggleLabel);
        this.toggleButton = this.toggleInput;
    }

    bindEvents() {
        // O evento de clique principal é agora no checkbox (evento 'change')
        this.toggleInput.addEventListener('change', () => {
            this.toggle(true); // Chamamos toggle com flag indicando que é uma ação do usuário
        });

        // Atalho de teclado (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Evento personalizado para outras partes do código
        document.addEventListener('themeChanged', (e) => {
            this.onThemeChange(e.detail.theme);
        });
    }

    toggle(isUserAction = false) {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Aplicar a classe de animação no LABEL
        this.toggleLabel.classList.add('switching');

        // Remover após animação
        setTimeout(() => {
            this.toggleLabel.classList.remove('switching');
        }, 600);

        // Se a chamada veio do atalho de teclado, atualize o estado do checkbox
        if (!isUserAction) {
            this.toggleInput.checked = (newTheme === 'dark');
        }

        this.setTheme(newTheme);
    }

    setTheme(theme) {
        // Aplicar tema ao documento
        document.documentElement.setAttribute('data-theme', theme);

        // Sincronizar o estado do checkbox com o tema
        this.toggleInput.checked = (theme === 'dark');

        // Salvar preferência do usuário
        this.saveTheme(theme);

        // Atualiza a ARIA label
        this.updateAriaLabel(theme);

        // Disparar evento personalizado
        this.dispatchThemeChange(theme);

        console.log(`Tema alterado para: ${theme}`);
    }

    updateAriaLabel(theme) {
        const text = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
        this.toggleLabel.setAttribute('aria-label', `Alternar para ${text.toLowerCase()}`);
        this.toggleLabel.setAttribute('title', `Alternar para ${text.toLowerCase()}`);
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    saveTheme(theme) {
        try {
            document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=Lax`;
        } catch (error) {
            console.warn('Não foi possível salvar a preferência de tema:', error);
        }
    }

    loadSavedTheme() {
        try {
            let savedTheme = this.getCookieValue('theme');

            if (!savedTheme) {
                savedTheme = this.systemPrefersDark ? 'dark' : 'light';
            }

            // Define o tema e o estado do checkbox
            this.setTheme(savedTheme);

        } catch (error) {
            console.warn('Erro ao carregar tema salvo:', error);
            this.setTheme('light');
        }
    }

    getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    hasUserPreference() {
        try {
            return this.getCookieValue('theme') !== null;
        } catch {
            return false;
        }
    }

    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    onThemeChange(theme) {
        if (typeof updateChartsTheme === 'function') {
            updateChartsTheme(theme);
        }

        const themeChangeEvent = new Event('darkModeToggled');
        window.dispatchEvent(themeChangeEvent);
    }

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

// Inicialização e Funções Utilitárias (Mantidas)
document.addEventListener('DOMContentLoaded', () => {
    window.darkModeToggle = new DarkModeToggle();
    console.log('Dark Mode Toggle inicializado:', window.darkModeToggle.getThemeInfo());
});

function toggleTheme() {
    if (window.darkModeToggle) {
        window.darkModeToggle.toggle();
    }
}
function setTheme(theme) {
    if (window.darkModeToggle) {
        window.darkModeToggle.setTheme(theme);
    }
}
function isDarkMode() {
    return window.darkModeToggle ? window.darkModeToggle.isDarkMode() : false;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DarkModeToggle, toggleTheme, setTheme, isDarkMode };
}