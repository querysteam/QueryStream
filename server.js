const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

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

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Check if question is about QueryStream
        const isQueryStreamRelated = checkIfQueryStreamRelated(message);
        
        if (!isQueryStreamRelated) {
            return res.json({
                response: "I'm here to help with QueryStream services only. I can tell you about our AI chatbot solutions, pricing, features, or how we can help your UK business. What would you like to know about QueryStream?"
            });
        }

        // Call Gemini API
        const response = await callGeminiAPI(message);
        res.json({ response });
        
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ 
            error: 'Sorry, I\'m having trouble right now. Please contact us at hello@querystream.co.uk' 
        });
    }
});

// Check if message is QueryStream related
function checkIfQueryStreamRelated(message) {
    const queryStreamKeywords = [
        'querystream', 'chatbot', 'ai', 'price', 'pricing', 'cost', 'service', 'business',
        'automation', 'customer service', 'website', 'integration', 'analytics', 'uk',
        'restaurant', 'salon', 'gym', 'retail', 'shop', 'hello', 'hi', 'help',
        'contact', 'email', 'phone', 'consultation', 'demo', 'features', 'setup'
    ];
    
    const lowerMessage = message.toLowerCase();
    return queryStreamKeywords.some(keyword => lowerMessage.includes(keyword)) || 
           message.length < 20; // Allow short greetings
}

// Call Gemini API
async function callGeminiAPI(userMessage) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = `${querystreamContext}

User: ${userMessage}

Please provide a helpful response about QueryStream services. Keep responses concise and professional.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 200,
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QueryStream Chatbot Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
});

module.exports = app;