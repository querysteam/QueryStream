// QueryStream AI Chatbot JavaScript
// Configuration
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// Global variables
let isOpen = false;
let isTyping = false;
let idleTimer = null;
let lastActivity = Date.now();

// DOM elements
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const notificationBadge = document.getElementById('notificationBadge');
const idleWarning = document.getElementById('idleWarning');

// QueryStream knowledge base
const querystreamContext = `
You are the QueryStream AI Assistant. QueryStream provides AI chatbot solutions specifically for UK local businesses.

SERVICES WE OFFER:
1. AI Chatbot Development - Custom-built intelligent chatbots tailored to business needs
2. Website Integration - Seamless integration with any website platform
3. Customer Support Automation - 24/7 automated customer service
4. Performance Analytics - Detailed insights and reporting
5. Ongoing Optimization - Continuous improvement and updates

INDUSTRIES WE SERVE:
- Restaurants & Cafes
- Hair & Beauty Salons
- Fitness Centers & Gyms
- Retail Shops
- Professional Services

PRICING:
- Starter Package: £150 setup + £40/month
- Professional Package: £200 setup + £50/month
- No long-term contracts, 30-day notice to cancel
- 30-day satisfaction guarantee

KEY FEATURES:
- 24/7 customer support automation
- Lead capture and qualification
- Appointment booking assistance
- Multi-platform integration
- UK business focused
- GDPR compliant
- No technical knowledge required

CONTACT:
- Email: hello@querystream.co.uk
- Phone: +44 7123 456 789
- Response within 4 hours guaranteed
- Free consultation available

IMPORTANT: Only answer questions related to QueryStream and our services. If asked about unrelated topics, politely redirect to QueryStream services.
`;

// Initialize chatbot
function initChatbot() {
    if (!chatbotToggle || !chatbotContainer) {
        console.error('Chatbot elements not found');
        return;
    }

    chatbotToggle.addEventListener('click', toggleChat);
    chatInput.addEventListener('keypress', handleKeyPress);
    chatInput.addEventListener('input', autoResize);
    resetIdleTimer();

    // Track activity
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
}

// Toggle chat window
function toggleChat() {
    isOpen = !isOpen;
    chatbotToggle.classList.toggle('active', isOpen);
    chatbotContainer.classList.toggle('active', isOpen);
    
    if (isOpen) {
        chatInput.focus();
        notificationBadge.style.display = 'none';
        resetIdleTimer();
    }
}

// Handle enter key press
function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Auto-resize textarea
function autoResize() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
}

// Send message
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isTyping) return;

    resetIdleTimer();
    displayMessage(message, 'user');
    chatInput.value = '';
    autoResize();
    
    showTypingIndicator();
    
    try {
        const response = await callGeminiAPI(message);
        hideTypingIndicator();
        displayMessage(response, 'bot');
    } catch (error) {
        hideTypingIndicator();
        displayMessage('Sorry, I\'m having trouble connecting right now. Please try again or contact us at hello@querystream.co.uk', 'bot');
        console.error('API Error:', error);
    }
}

// Send quick message
function sendQuickMessage(message) {
    chatInput.value = message;
    sendMessage();
}

// Call backend API
async function callGeminiAPI(userMessage) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
}

// Display message
function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === 'bot' ? 'QS' : 'You'}</div>
        <div class="message-content">
            ${text}
            <div class="message-time">${time}</div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show notification if chat is closed
    if (!isOpen && sender === 'bot') {
        notificationBadge.style.display = 'block';
    }
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    sendButton.disabled = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">QS</div>
        <div class="typing-indicator">
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    sendButton.disabled = false;
    
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Reset idle timer
function resetIdleTimer() {
    lastActivity = Date.now();
    clearTimeout(idleTimer);
    idleWarning.classList.remove('show');
    
    if (isOpen) {
        idleTimer = setTimeout(() => {
            showIdleWarning();
        }, IDLE_TIMEOUT);
    }
}

// Show idle warning
function showIdleWarning() {
    if (isOpen) {
        idleWarning.classList.add('show');
        
        // Auto-close after 2 minutes of no response
        setTimeout(() => {
            if (idleWarning.classList.contains('show')) {
                toggleChat();
                idleWarning.classList.remove('show');
            }
        }, 2 * 60 * 1000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initChatbot);

// Handle page visibility for idle detection
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearTimeout(idleTimer);
    } else if (isOpen) {
        resetIdleTimer();
    }
});