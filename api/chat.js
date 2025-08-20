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

// Check if message is QueryStream related
function checkIfQueryStreamRelated(message) {
    const queryStreamKeywords = [
        'querystream', 'chatbot', 'ai', 'price', 'pricing', 'cost', 'service', 'business',
        'automation', 'customer service', 'website', 'integration', 'analytics', 'uk',
        'restaurant', 'salon', 'gym', 'retail', 'shop', 'hello', 'hi', 'help',
        'contact', 'email', 'phone', 'consultation', 'demo', 'features', 'setup',
        'how', 'what', 'when', 'where', 'why', 'can', 'do', 'does'
    ];
    
    const lowerMessage = message.toLowerCase();
    return queryStreamKeywords.some(keyword => lowerMessage.includes(keyword)) || 
           message.length < 30; // Allow short greetings and questions
}

// Call Gemini API with timeout
async function callGeminiAPI(userMessage) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = `${querystreamContext}

User: ${userMessage}

Please provide a helpful, concise response about QueryStream services. Keep it professional and under 150 words.`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
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
                    maxOutputTokens: 150,
                    stopSequences: ["User:", "Assistant:"]
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', response.status, errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Invalid Gemini response:', data);
            throw new Error('Invalid response from Gemini API');
        }

        return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        
        console.error('Gemini API call failed:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        if (message.length > 1000) {
            return res.status(400).json({ error: 'Message too long. Please keep it under 1000 characters.' });
        }

        // Check if question is about QueryStream
        const isQueryStreamRelated = checkIfQueryStreamRelated(message);
        
        if (!isQueryStreamRelated) {
            return res.json({
                response: "I'm here to help with QueryStream services only. I can tell you about our AI chatbot solutions, pricing, features, or how we can help your UK business. What would you like to know about QueryStream?"
            });
        }

        // Call Gemini API with error handling
        let response;
        try {
            response = await callGeminiAPI(message);
        } catch (apiError) {
            console.error('API call failed:', apiError.message);
            
            // Return fallback response based on common questions
            if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
                response = "Our pricing is simple: £150-200 for setup and £40-50/month for hosting. No hidden fees! Contact hello@querystream.co.uk for a free consultation.";
            } else if (message.toLowerCase().includes('service') || message.toLowerCase().includes('what')) {
                response = "We create custom AI chatbots for UK businesses. 24/7 customer support, lead capture, and seamless website integration. Perfect for restaurants, salons, gyms, and shops!";
            } else {
                response = "I'd love to help you learn about QueryStream! We provide AI chatbot solutions for UK businesses. Contact hello@querystream.co.uk or call +44 7123 456 789 for more information.";
            }
        }

        return res.json({ response });
        
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ 
            error: 'Sorry, I\'m having trouble right now. Please contact us directly at hello@querystream.co.uk' 
        });
    }
}