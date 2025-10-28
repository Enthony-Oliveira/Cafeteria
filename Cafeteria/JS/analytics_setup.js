class AnalyticsManager {
    constructor() {
        this.GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 
        this.isInitialized = false;
        this.events = [];
        
        this.init();
    }

    init() {
        if (this.checkCookieConsent()) {
            this.loadGoogleAnalytics();
            this.setupCustomEvents();
        } else {
            this.showCookieConsent();
        }
    }

    loadGoogleAnalytics() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.GA_MEASUREMENT_ID, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            custom_map: {
                'custom_parameter_1': 'business_type',
                'custom_parameter_2': 'page_section'
            }
        });

        this.isInitialized = true;
        console.log('Google Analytics inicializado');

        this.flushEventQueue();
    }

    setupCustomEvents() {
        this.trackPageViews();
        this.trackFormSubmissions();
        this.trackButtonClicks();
        this.trackScrollDepth();
        this.trackFileDownloads();
        this.trackOutboundLinks();
        this.trackChatInteractions();
        this.trackDarkModeToggle();
    }

    trackPageViews() {
        let currentPage = window.location.pathname;
        
        const observer = new MutationObserver(() => {
            if (window.location.pathname !== currentPage) {
                currentPage = window.location.pathname;
                this.trackEvent('page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });
            }
        });

        observer.observe(document, { childList: true, subtree: true });
    }

    trackFormSubmissions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || 'unknown_form';
            const formAction = form.action || 'no_action';

            this.trackEvent('form_submit', {
                form_id: formId,
                form_action: formAction,
                form_method: form.method || 'get'
            });
        });
    }

    trackButtonClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('btn-ler-mais')) {
                this.trackEvent('cta_click', {
                    button_type: 'read_more',
                    content_title: target.closest('article')?.querySelector('h2, h3')?.textContent || 'unknown'
                });
            }
            
            if (target.classList.contains('enviar')) {
                this.trackEvent('cta_click', {
                    button_type: 'contact_form',
                    page_section: 'contact'
                });
            }
            
            if (target.tagName === 'A' && target.closest('nav')) {
                this.trackEvent('navigation_click', {
                    link_text: target.textContent,
                    link_url: target.href
                });
            }

            if (target.classList.contains('filtro-btn') || target.classList.contains('filtro-blog')) {
                this.trackEvent('filter_use', {
                    filter_type: target.getAttribute('data-categoria') || target.getAttribute('data-filtro'),
                    page_type: window.location.pathname.includes('blog') ? 'blog' : 'gallery'
                });
            }
        });
    }

    trackScrollDepth() {
        let scrollDepths = [25, 50, 75, 90];
        let trackedDepths = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    this.trackEvent('scroll_depth', {
                        scroll_depth: depth,
                        page_title: document.title
                    });
                }
            });
        });
    }

    trackFileDownloads() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'A') {
                const href = target.href;
                const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.jpg', '.png'];
                
                if (fileExtensions.some(ext => href.toLowerCase().includes(ext))) {
                    this.trackEvent('file_download', {
                        file_name: href.split('/').pop(),
                        file_extension: href.split('.').pop(),
                        download_source: target.closest('section')?.className || 'unknown'
                    });
                }
            }
        });
    }

    trackOutboundLinks() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'A' && target.href) {
                const currentDomain = window.location.hostname;
                const linkDomain = new URL(target.href).hostname;
                
                if (linkDomain !== currentDomain) {
                    this.trackEvent('outbound_click', {
                        link_url: target.href,
                        link_domain: linkDomain,
                        link_text: target.textContent
                    });
                }
            }
        });
    }

    trackChatInteractions() {
        document.addEventListener('DOMContentLoaded', () => {
            const chatButton = document.getElementById('chatButton');
            const whatsappBtn = document.getElementById('whatsappBtn');

            if (chatButton) {
                chatButton.addEventListener('click', () => {
                    this.trackEvent('chat_interaction', {
                        action: 'chat_opened',
                        interaction_type: 'widget'
                    });
                });
            }

            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', () => {
                    this.trackEvent('chat_interaction', {
                        action: 'whatsapp_redirect',
                        interaction_type: 'widget'
                    });
                });
            }

            document.addEventListener('chatMessageSent', (e) => {
                this.trackEvent('chat_interaction', {
                    action: 'message_sent',
                    interaction_type: 'widget',
                    message_length: e.detail?.messageLength || 0
                });
            });
        });
    }

    trackDarkModeToggle() {
        document.addEventListener('themeChanged', (e) => {
            this.trackEvent('ui_interaction', {
                action: 'theme_change',
                theme: e.detail?.theme || 'unknown',
                interaction_type: 'dark_mode_toggle'
            });
        });
    }

    trackEvent(eventName, parameters = {}) {
        if (this.isInitialized && window.gtag) {
            const eventData = {
                ...parameters,
                page_title: document.title,
                page_location: window.location.href,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`
            };

            window.gtag('event', eventName, eventData);
            console.log('GA Event:', eventName, eventData);
        } else {
            this.events.push({ eventName, parameters });
        }
    }

    flushEventQueue() {
        this.events.forEach(({ eventName, parameters }) => {
            this.trackEvent(eventName, parameters);
        });
        this.events = [];
    }

    checkCookieConsent() {
        return document.cookie.includes('analytics_consent=true');
    }

    showCookieConsent() {
        if (document.querySelector('.cookie-consent')) return;

        const consentBanner = document.createElement('div');
        consentBanner.className = 'cookie-consent';
        consentBanner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h4>Cookies e Privacidade</h4>
                    <p>Usamos cookies para melhorar sua experiência e analisar o tráfego do site. Seus dados são tratados de forma anônima e segura.</p>
                </div>
                <div class="cookie-consent-actions">
                    <button class="cookie-accept">Aceitar</button>
                    <button class="cookie-reject">Rejeitar</button>
                    <a href="#" class="cookie-policy">Política de Privacidade</a>
                </div>
            </div>
        `;

        document.body.appendChild(consentBanner);
        consentBanner.querySelector('.cookie-accept').addEventListener('click', () => {
            this.acceptCookies();
            consentBanner.remove();
        });

        consentBanner.querySelector('.cookie-reject').addEventListener('click', () => {
            this.rejectCookies();
            consentBanner.remove();
        });
    }

    acceptCookies() {
        document.cookie = 'analytics_consent=true; path=/; max-age=31536000';
        this.loadGoogleAnalytics();
        this.setupCustomEvents();
    }

    rejectCookies() {
        document.cookie = 'analytics_consent=false; path=/; max-age=31536000';
        console.log('Analytics rejeitado pelo usuário');
    }

    trackBusinessMetrics() {
        const productViews = document.querySelectorAll('.produtos li, .artigo-card');
        productViews.forEach((item, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const productName = entry.target.querySelector('h3, h2')?.textContent || `produto_${index}`;
                        this.trackEvent('product_view', {
                            product_name: productName,
                            product_position: index + 1,
                            page_type: window.location.pathname.includes('produtos') ? 'products' : 'blog'
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(item);
        });
    }

    getSessionReport() {
        return {
            initialized: this.isInitialized,
            measurementId: this.GA_MEASUREMENT_ID,
            queuedEvents: this.events.length,
            cookieConsent: this.checkCookieConsent(),
            pageLoadTime: performance.now(),
            userAgent: navigator.userAgent
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
    
    setTimeout(() => {
        window.analyticsManager.trackBusinessMetrics();
    }, 2000);
});

function trackCustomEvent(eventName, parameters) {
    if (window.analyticsManager) {
        window.analyticsManager.trackEvent(eventName, parameters);
    }
}

function getAnalyticsReport() {
    return window.analyticsManager ? window.analyticsManager.getSessionReport() : null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnalyticsManager, trackCustomEvent };
}