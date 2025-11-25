class ChatBot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.conversationHistory = [];
        this.responses = this.initializeResponses();
        this.userInfo = {};

        this.init();
        this.bindEvents();
        this.showWelcomeNotification();
    }

    init() {
        this.chatButton = document.getElementById('chatButton');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatBadge = document.getElementById('chatBadge');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.minimizeBtn = document.getElementById('minimizeChat');
        this.whatsappBtn = document.getElementById('whatsappBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.chatNotification = document.getElementById('chatNotification');
        this.quickSuggestions = document.getElementById('quickSuggestions');
        this.updateChatButton();
    }

    initializeResponses() {
        return {
            saudacoes: [
                'olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'hello'
            ],
            respostas_saudacao: [
                'Olá! Como posso ajudá-lo hoje? 😊',
                'Oi! Em que posso ser útil?',
                'Olá! Seja bem-vindo(a)! Como posso ajudar?'
            ],

            horarios: [
                'horário', 'horarios', 'funcionamento', 'aberto', 'fechado', 'quando'
            ],
            resposta_horarios: `📅 <strong>Nossos horários:</strong><br>
                Segunda à Sexta: 8h às 18h<br>
                Sábados: 8h às 14h<br>
                Domingos: Fechado<br><br>
                Precisa de mais informações?`,

            servicos: [
                'serviço', 'serviços', 'produto', 'produtos', 'oferece', 'fazem'
            ],
            resposta_servicos: `💼 <strong>Nossos principais serviços:</strong><br>
                • Uma Cesta de Café da manha com varias acompanhamento<br>
                • Entrega de Bolos e Tortas<br>
                • serviços de café para eventos, que incluem baristas profissionais,
                            montagem de estações de café personalizadas e uma variedade de bebidas especiais.<br><br>
                Gostaria de saber mais sobre algum específico?`,

            contato: [
                'contato', 'telefone', 'whatsapp', 'email', 'falar'
            ],
            resposta_contato: `📞 <strong>Entre em contato conosco:</strong><br>
                Telefone: (45) 99941-6884<br>
                WhatsApp: (45) 99941-6884<br>
                Email: oliveiraenthony987@gmail.com<br><br>
                Prefere falar pelo WhatsApp? Clique no botão abaixo! 👇`,

            localizacao: [
                'onde', 'endereço', 'localização', 'fica', 'local'
            ],
            resposta_localizacao: `📍 <strong>Nossa localização:</strong><br>
                Rua do Cafe, 8570<br>
                Centro - Cascavel/PR<br>
                Fácil acesso por transporte público!`,

            precos: [
                'preço', 'precos', 'valor', 'custa', 'quanto'
            ],
            resposta_precos: `💰 <strong>Preços e orçamentos:</strong><br>
                Nossos valores variam conforme o serviço escolhido.<br>
                Para um orçamento personalizado, entre em contato:<br><br>
                📱 WhatsApp: (45) 99941-6884 <br>
                Teremos prazer em atendê-lo!`,

            agendamento: [
                'agendar', 'marcar', 'consulta', 'horario', 'disponível'
            ],
            resposta_agendamento: `📅 <strong>Agendamentos:</strong><br>
                Para marcar seu horário:<br>
                • Ligue: (45) 99941-6884 <br>
                • WhatsApp: (45) 99941-6884 <br>
                • Ou visite nossa página de contato<br><br>
                Temos horários flexíveis para melhor atendê-lo!`,

            nao_entendi: [
                'Desculpe, não entendi muito bem. Pode reformular sua pergunta?',
                'Hmm, não tenho certeza sobre isso. Pode ser mais específico?',
                'Não consegui compreender. Pode tentar perguntar de outra forma?'
            ],

            despedida: [
                'tchau', 'bye', 'obrigado', 'obrigada', 'valeu', 'até logo'
            ],
            resposta_despedida: [
                'Foi um prazer ajudar! Até logo! 👋',
                'Obrigado pelo contato! Esperamos vê-lo em breve! 😊',
                'Até mais! Estamos sempre aqui quando precisar!'
            ]
        };
    }

    bindEvents() {
        this.chatButton.addEventListener('click', () => {
            this.toggleChat();
        });

        this.closeChatBtn.addEventListener('click', () => {
            this.closeChat();
        });

        this.minimizeBtn.addEventListener('click', () => {
            this.minimizeChat();
        });

        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        this.quickSuggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const suggestion = e.target.getAttribute('data-suggestion');
                this.handleQuickSuggestion(suggestion);
            }
        });

        this.whatsappBtn.addEventListener('click', () => {
            this.redirectToWhatsApp();
        });

        this.chatNotification.addEventListener('click', () => {
            this.hideNotification();
            this.openChat();
        });

        setTimeout(() => {
            this.hideNotification();
        }, 8000);
    }

    showWelcomeNotification() {
        setTimeout(() => {
            if (!this.isOpen) {
                this.showNotification('Nova mensagem!', 'Olá! Como posso ajudá-lo hoje?');
            }
        }, 3000);
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.isMinimized = false;
        this.chatWindow.classList.add('show');
        this.chatWindow.classList.remove('minimized');
        this.updateChatButton();
        this.hideBadge();
        this.hideNotification();
        setTimeout(() => {
            this.chatInput.focus();
        }, 300);
    }

    closeChat() {
        this.isOpen = false;
        this.isMinimized = false;
        this.chatWindow.classList.remove('show');
        this.chatWindow.classList.remove('minimized');
        this.updateChatButton();
    }

    minimizeChat() {
        this.isMinimized = !this.isMinimized;
        this.chatWindow.classList.toggle('minimized');
    }

    updateChatButton() {
        const chatIcon = this.chatButton.querySelector('.chat-icon');
        const closeIcon = this.chatButton.querySelector('.close-icon');

        if (this.isOpen) {
            this.chatButton.classList.add('chat-open');
            chatIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        } else {
            this.chatButton.classList.remove('chat-open');
            chatIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.conversationHistory.push({ type: 'user', message, time: new Date() }); cator
        this.showTypingIndicator();

        setTimeout(() => {
            this.processMessage(message);
        }, Math.random() * 1500 + 500);
    }

    addMessage(message, sender, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const time = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const avatar = sender === 'user' ? 'U' : '<img src="imagens/logo.png" alt="Bot">';

        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${isHTML ? message : this.escapeHtml(message)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        if (!this.isOpen && sender === 'bot') {
            this.showBadge();
        }
    }

    processMessage(userMessage) {
        this.hideTypingIndicator();

        const message = userMessage.toLowerCase();
        let response = this.findBestResponse(message);

        this.addMessage(response, 'bot', true);

        this.conversationHistory.push({
            type: 'bot',
            message: response,
            time: new Date()
        });

        if (!this.isOpen) {
            this.showNotification('Nova resposta!', 'O assistente respondeu sua pergunta');
        }
    }

    findBestResponse(message) {
        if (this.containsAny(message, this.responses.saudacoes)) {
            return this.getRandomResponse(this.responses.respostas_saudacao);
        }

        if (this.containsAny(message, this.responses.despedida)) {
            return this.getRandomResponse(this.responses.resposta_despedida);
        }

        if (this.containsAny(message, this.responses.horarios)) {
            return this.responses.resposta_horarios;
        }

        if (this.containsAny(message, this.responses.servicos)) {
            return this.responses.resposta_servicos;
        }

        if (this.containsAny(message, this.responses.contato)) {
            return this.responses.resposta_contato;
        }

        if (this.containsAny(message, this.responses.localizacao)) {
            return this.responses.resposta_localizacao;
        }

        if (this.containsAny(message, this.responses.precos)) {
            return this.responses.resposta_precos;
        }

        if (this.containsAny(message, this.responses.agendamento)) {
            return this.responses.resposta_agendamento;
        }

        return this.getRandomResponse(this.responses.nao_entendi);
    }

    handleQuickSuggestion(suggestion) {
        let message = '';
        switch (suggestion) {
            case 'horarios':
                message = 'Quais são os horários de funcionamento?';
                break;
            case 'servicos':
                message = 'Quais serviços vocês oferecem?';
                break;
            case 'contato':
                message = 'Como posso entrar em contato?';
                break;
            case 'localizacao':
                message = 'Onde vocês ficam localizados?';
                break;
        }

        if (message) {
            this.chatInput.value = message;
            this.sendMessage();
        }
    }

    containsAny(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    showBadge() {
        this.chatBadge.classList.remove('hidden');
        const currentCount = parseInt(this.chatBadge.textContent) || 0;
        this.chatBadge.textContent = currentCount + 1;
    }

    hideBadge() {
        this.chatBadge.classList.add('hidden');
        this.chatBadge.textContent = '1';
    }

    showNotification(title, message) {
        const notification = this.chatNotification;
        notification.querySelector('strong').textContent = title;
        notification.querySelector('p').textContent = message;
        notification.style.display = 'block';

        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification() {
        this.chatNotification.style.display = 'none';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    redirectToWhatsApp() {
        const phoneNumber = '(45) 99941-6884';
        const message = this.generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    }

    generateWhatsAppMessage() {
        let message = 'Olá! Vim através do chat do site.\n\n';

        const recentMessages = this.conversationHistory.slice(-3);
        if (recentMessages.length > 0) {
            message += 'Histórico da conversa:\n';
            recentMessages.forEach(msg => {
                if (msg.type === 'user') {
                    message += `Eu: ${msg.message}\n`;
                }
            });
            message += '\nGostaria de continuar nossa conversa.';
        } else {
            message += 'Gostaria de mais informações sobre seus serviços.';
        }

        return message;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    s
    addCustomResponse(keywords, response) {
        this.responses[`custom_${Date.now()}`] = {
            keywords,
            response
        };
    }

    getStats() {
        return {
            totalMessages: this.conversationHistory.length,
            userMessages: this.conversationHistory.filter(m => m.type === 'user').length,
            botMessages: this.conversationHistory.filter(m => m.type === 'bot').length,
            isActive: this.isOpen,
            startTime: this.startTime || new Date()
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chatButton')) {
        window.chatBot = new ChatBot();
        console.log('Chatbot inicializado com sucesso!');
    } else {
        console.warn('Elementos do chatbot não encontrados. Certifique-se de incluir o HTML do widget.');
    }
});

function openChatBot() {
    if (window.chatBot) {
        window.chatBot.openChat();
    }
}

function closeChatBot() {
    if (window.chatBot) {
        window.chatBot.closeChat();
    }
}

function addChatBotResponse(keywords, response) {
    if (window.chatBot) {
        window.chatBot.addCustomResponse(keywords, response);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatBot, openChatBot, closeChatBot };
}