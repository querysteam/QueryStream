// QueryStream comprehensive knowledge base (based on FAQ)
const querystreamContext = `
You are the QueryStream AI Assistant. QueryStream provides AI chatbot solutions specifically for UK local businesses.

COMPREHENSIVE SERVICES:
1. AI Chatbot Development - Custom-built intelligent chatbots tailored to business needs, trained on your specific business information
2. Website Integration - Seamless integration with WordPress, Squarespace, Wix, Shopify, custom websites, e-commerce platforms
3. Customer Support Automation - 24/7 automated customer service that never sleeps
4. Performance Analytics - Detailed insights, monthly reports, customer behavior analysis
5. Ongoing Optimization - Continuous improvement, content updates, monthly optimization calls (Professional)

PERFECT FOR THESE INDUSTRIES:
- Hair & Beauty Salons (pricing, appointments, services)
- Restaurants & Cafes (menu questions, opening hours, dietary info)
- Fitness Centers & Gyms (membership, class schedules, facilities)
- Retail Shops (product availability, store hours, location)
- Professional Services (service descriptions, pricing, booking)
- Healthcare Practices (appointments, services, location)

DETAILED PRICING:
Starter Package: £150 setup + £40/month
- Basic chatbot setup with business personality
- Up to 20 FAQs trained initially
- Website integration on any platform
- Basic analytics and performance monitoring
- Email support (4-hour response time)
- Monthly content updates included
- 30-day satisfaction guarantee

Professional Package: £200 setup + £50/month (MOST POPULAR)
- Advanced chatbot with full business personality
- Unlimited FAQs and conversation scenarios
- Advanced integrations with booking/e-commerce systems
- Detailed analytics dashboard with insights
- Priority phone support for urgent issues
- Monthly 15-minute optimization calls
- Lead capture and qualification features
- Advanced conversation handling
- Priority updates and improvements

TIMELINE & PROCESS:
- Day 1: Free consultation and business analysis
- Days 2-3: Custom chatbot development and training
- Day 4: Website integration and thorough testing
- Day 5: Final tweaks and go-live
- Rush delivery (48 hours) available for £50 extra

KEY FEATURES & BENEFITS:
- 99.9% uptime guarantee on enterprise infrastructure
- SSL encryption and GDPR-compliant data handling
- No technical knowledge required from you
- Works on all website platforms and devices
- Handles complex questions about your business
- Captures leads even when you're closed
- Reduces repetitive phone calls by 70%+
- Professional, branded appearance matching your website
- Intelligent escalation when questions are too complex

SECURITY & RELIABILITY:
- Enterprise-grade hosting with 24/7 monitoring
- Automatic backups and disaster recovery
- SSL encryption for all communications
- GDPR compliant with UK/EU data protection standards
- No storage of sensitive customer information
- Regular security audits and updates

SUPPORT INCLUDED:
All customers: Email support (4hr response), monthly reports, unlimited content updates, performance optimization
Professional customers: Priority phone support, monthly optimization calls, advanced analytics, faster response times

CONTRACTS & GUARANTEES:
- No long-term contracts (month-to-month)
- 30-day cancellation notice
- 30-day satisfaction guarantee with full refund
- No hidden fees ever
- Transparent pricing with no surprises

CONTACT INFORMATION:
- Email: hello@querystream.co.uk (4-hour response guarantee)
- Phone: +44 7123 456 789
- Serving all UK businesses
- Free consultations available
- Rush setup available

COMMON CUSTOMER QUESTIONS ANSWERED:
- Setup time: 3-5 working days (rush 48hrs available)
- Works without website: Yes, we can help with simple solutions
- Updates: Unlimited, usually live within 24 hours
- Cancellation: Easy, 30-day notice, no fees
- Integration: Works with all platforms including custom websites
- Unknown questions: Chatbot politely escalates and captures leads
- Training: We handle everything, no technical knowledge needed

IMPORTANT: Only answer questions related to QueryStream services, pricing, features, setup, support, or general business inquiries about our chatbot solutions. If asked about unrelated topics, politely decline and redirect to QueryStream services.
`;

// Check if message is QueryStream related
function checkIfQueryStreamRelated(message) {
    const queryStreamKeywords = [
        'querystream', 'chatbot', 'ai', 'price', 'pricing', 'cost', 'service', 'business',
        'automation', 'customer service', 'website', 'integration', 'analytics', 'uk',
        'restaurant', 'salon', 'gym', 'retail', 'shop', 'hello', 'hi', 'help', 'setup',
        'contact', 'email', 'phone', 'consultation', 'demo', 'features', 'support',
        'how', 'what', 'when', 'where', 'why', 'can', 'do', 'does', 'will', 'would',
        'technical', 'security', 'gdpr', 'uptime', 'refund', 'cancel', 'contract',
        'update', 'maintenance', 'training', 'learn', 'work', 'platform', 'wordpress',
        'squarespace', 'wix', 'shopify', 'professional', 'starter', 'package', 'monthly',
        'reliable', 'secure', 'ssl', 'enterprise', 'backup', 'monitoring', 'response'
    ];
    
    // Basic greetings - always allow these
    const basicGreetings = [
        'hello', 'hi', 'hey', 'hiya', 'good morning', 'good afternoon', 'good evening',
        'morning', 'afternoon', 'evening', 'greetings', 'howdy', 'yo', 'sup',
        'how are you', "how's it going", 'nice to meet you', 'pleased to meet you'
    ];
    
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for obvious unrelated topics
    const unrelatedKeywords = [
        'weather', 'news', 'politics', 'sports', 'recipe', 'cooking', 'movie', 'music',
        'celebrity', 'game', 'football', 'cricket', 'love', 'dating', 'health', 'medical',
        'doctor', 'medicine', 'travel', 'holiday', 'vacation', 'flight', 'hotel',
        'restaurant recommendation', 'food delivery', 'uber', 'taxi', 'bitcoin',
        'cryptocurrency', 'stock', 'investment', 'joke', 'funny', 'meme'
    ];
    
    // Always allow basic greetings
    if (basicGreetings.some(greeting => lowerMessage.includes(greeting))) {
        return true;
    }
    
    // If contains obvious unrelated keywords, return false
    if (unrelatedKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return false;
    }
    
    // If contains QueryStream keywords or is a short message, return true
    return queryStreamKeywords.some(keyword => lowerMessage.includes(keyword)) || 
           message.length < 25; // Allow short questions
}

// Call Gemini API with timeout
async function callGeminiAPI(userMessage) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    console.log('API Key exists:', !!API_KEY);
    
    if (!API_KEY) {
        console.error('GEMINI_API_KEY environment variable not found');
        throw new Error('Gemini API key not configured');
    }

    const prompt = querystreamContext + '\n\nUser: ' + userMessage + '\n\nIMPORTANT CONVERSATION STYLE:\n- Act like a friendly human having a natural conversation, NOT a sales robot\n- Keep responses SHORT and conversational (2-3 sentences max for greetings)\n- For greetings like "good morning", just be friendly and ask ONE simple question\n- Don\'t dump all information at once - let the conversation flow naturally\n- Ask one question at a time to keep the chat going\n- Only provide detailed info when specifically asked\n- Use a warm, casual tone like chatting with a friend\n- Example: "Good morning! Hope you\'re having a lovely day! What brings you here today?"\n- Let them guide the conversation instead of overwhelming them';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
        console.log('Making API request to Gemini...');
        
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + API_KEY;
        
        const response = await fetch(apiUrl, {
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
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 150,
                    stopSequences: ["User:", "Assistant:"]
                }
            })
        });

        clearTimeout(timeoutId);

        console.log('API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Response:', errorText);
            throw new Error('Gemini API error: ' + response.status + ' - ' + errorText);
        }

        const data = await response.json();
        console.log('API Response received');
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Invalid Gemini response structure');
            throw new Error('Invalid response from Gemini API');
        }

        return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        clearTimeout(timeoutId);
        
        console.error('Gemini API Error:', error.message);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        
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
                response: "Sorry, I can only answer questions related to QueryStream. I can help you with our AI chatbot solutions, pricing, features, setup process, technical details, or how we can help your UK business. What would you like to know about QueryStream?"
            });
        }

        // Call Gemini API with error handling
        let response;
        try {
            response = await callGeminiAPI(message);
        } catch (apiError) {
            console.error('API call failed:', apiError.message);
            
            // Provide human-like fallback responses based on message type
            const lowerMessage = message.toLowerCase().trim();
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
                response = "Hello there! How's your day going? 😊";
            } else if (lowerMessage.includes('good morning')) {
                response = "Good morning! Hope you're having a lovely day! ☀️ What brings you here today?";
            } else if (lowerMessage.includes('good afternoon')) {
                response = "Good afternoon! Hope your day's treating you well! What can I help you with?";
            } else if (lowerMessage.includes('good evening')) {
                response = "Good evening! How's your evening going? What's on your mind?";
            } else if (lowerMessage.includes('how are you')) {
                response = "I'm doing great, thanks for asking! How about you? What's going on with your business these days?";
            } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
                response = "Our pricing is pretty straightforward! We have two main packages:\n\n**Starter:** £150 setup + £40/month\n**Professional:** £200 setup + £50/month\n\nWhat kind of business are you running? That'll help me suggest which might work best for you!";
            } else if (lowerMessage.includes('service') || lowerMessage.includes('what')) {
                response = "We build custom AI chatbots for UK businesses! Think of it like having a helpful team member who never sleeps and can answer your customers' questions 24/7.\n\nWhat type of business do you have? I can tell you exactly how it would help!";
            } else {
                response = "Hey there! I'm here to chat about QueryStream - we help UK businesses with AI chatbots.\n\nWhat's your business like? Do you get lots of the same questions from customers?";
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