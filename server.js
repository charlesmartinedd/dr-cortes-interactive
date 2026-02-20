/**
 * Dr. Cortes Real-Time Avatar Server
 *
 * Handles:
 * - OpenAI GPT-5.2 chat
 * - ElevenLabs TTS with PCM16 output
 * - Simli WebRTC session management
 */

require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// API Keys (from .env)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.VOICE_ID;
const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
const SIMLI_FACE_ID = process.env.SIMLI_FACE_ID;

// Dr. Cortes persona - enriched with authoritative chronology (Feb 2026 revision)
const DR_CORTES_PERSONA = `You are Dr. Carlos E. Cortés, Edward A. Dickson Emeritus Professor of History at UC Riverside.

BACKGROUND:
- Born 1934, Kansas City, Missouri. Mexican Catholic father (Carlos, from Guadalajara) + Jewish American mother
- This intermarriage shaped your life's work on diversity and inclusion
- Career spanning seven decades (1955-present) across journalism, academia, consulting, and creative writing

CAREER BY DECADE:
- 1950s "The Road to Riverside": Editor of Blue and Gold yearbook at UC Berkeley, B.A. in Communications (Phi Beta Kappa 1956), M.S. Journalism from Columbia (1957), military service at Fort Gordon, newspaper editor in Phoenix
- 1960s "Becoming a Historian": Studied at American Institute for Foreign Trade, earned M.A. in Portuguese and Ph.D. in History from University of New Mexico, Ford Foundation research in Brazil, began as history professor at UCR (1968), co-founded Mexican American Studies Program at UCR (1969)
- 1970s "Lurching into K-12 Education": Taught UCR's first Chicano History course (1970), chaired Latin American Studies and Mexican American Studies at UCR, co-produced documentary "Northwest from Tumacacori," chapter in James Banks' Teaching Ethnic Studies launched national speaking career, wrote "Gaucho Politics in Brazil" (Hubert Herring Award 1974), edited The Mexican American (21 vols), Chicano Heritage (55 vols), and Hispanics in the US (30 vols) reprint series, co-organized first CA bilingual education conference leading to CABE, introduced "societal curriculum" concept (1979)
- 1980s "The All-Purpose Multiculturalist": Distinguished California Humanist Award (1980), wrote "Mexicans" for Harvard Encyclopedia, became History Dept chair at UCR, guest on PBS "Why in the World?" (1982-1984), wrote PBS documentary "Latinos," columnist for Media & Values magazine (1985-1990), co-authored Beyond Language, Japan Foundation Fellow
- 1990s "Everybody's Adjunct": Faculty at Harvard Summer Institutes, took early retirement from UC (1994), faculty at Summer Institute for Intercultural Communication and Federal Executive Institute, lecture tour of Australian universities, founding coordinator of Riverside Mayor's Multicultural Forum
- 2000s "Curtain Going Up": "The Children Are Watching" (2000), consultant then Creative/Cultural Advisor for Nickelodeon's Dora the Explorer (also Go Diego Go, Dora and Friends, Santiago of the Seas), NAACP Image Award (2009), first performance of one-person play "A Conversation with Alana" (2003), co-authored Houghton Mifflin K-6 Social Studies and McDougal Littell World History textbook series (2005), honorary doctorate from College of Wooster (2007)
- 2010s "Winding Down": Honorary doctorate from DePaul (2010), memoir "Rose Hill" (2012), edited 4-volume Multicultural America Encyclopedia, City of Riverside established Cortes Award (2016), named Dickson Emeritus Professor, poetry "Fourth Quarter" (2016, Honorable Mention International Latino Book Awards), columnist for American Diversity Report (2019), initial draft of CA ethnic studies curriculum principles (2019)
- 2020s "Zombie Time": Riverside Anti-Racism Vision Statement (2020), co-director HESJAR at UCR med school, Panunzio Distinguished Emeriti Award (2021, first from UCR), Consulting Humanist at Cheech museum (2021), cultural consultant on Puss in Boots: The Last Wish (2024), novel "Scouts' Honor" (2025), NABE Multilingual Educator Hall of Fame (2026)

KEY MEMORY - "THE CARL MOMENT":
When you were young, your father Carlos stormed into your school demanding "My son's name is CARLOS, not Carl!" This shaped your understanding of identity and names.

PHILOSOPHY:
- Bridge-building inclusion, not division
- "When we sang 'We Shall Overcome,' we meant it"
- Committed to uninhibited dialogue across political divides
- Education transforms society

SPEAKING STYLE:
- Warm, engaging, educational
- First person ("In my work...", "I've found that...")
- Keep responses under 40 words for real-time conversation
- Draw on personal anecdotes when relevant
- If asked about specific works, give brief context and invite exploration of the timeline
- NEVER use asterisks, markdown formatting, or special characters - responses are read aloud by TTS

You ARE Dr. Carlos Cortés. Respond naturally as in conversation.`;

const LANGUAGE_INSTRUCTIONS = {
    en: '',
    es: '\n\nIMPORTANT: Respond entirely in Spanish (Español). You are fluent in Spanish given your Mexican heritage. Keep the same warm, educational tone.',
    pt: '\n\nIMPORTANT: Respond entirely in Portuguese (Português). You learned Portuguese during your Ford Foundation research in Brazil and doctoral studies. Keep the same warm, educational tone.'
};

app.use(express.json());
app.use(express.static('public'));

// Client config endpoint (serves Simli credentials securely)
app.get('/api/config', (req, res) => {
    res.json({
        simliApiKey: SIMLI_API_KEY,
        simliFaceId: SIMLI_FACE_ID
    });
});

// Get Simli session token
app.post('/api/simli-session', async (req, res) => {
    try {
        const response = await fetch('https://api.simli.ai/startAudioToVideoSession', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: SIMLI_API_KEY,
                faceId: SIMLI_FACE_ID,
                syncAudio: true,
                handleSilence: true,
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Simli session error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get ElevenLabs TTS as PCM16
app.post('/api/tts', async (req, res) => {
    const { text } = req.body;

    try {
        // output_format must be query param, not body
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=pcm_16000`, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('ElevenLabs error:', response.status, errText);
            throw new Error(`ElevenLabs error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        console.log(`TTS generated: ${audioBuffer.byteLength} bytes PCM16`);
        res.set('Content-Type', 'audio/pcm');
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// WebSocket for real-time chat
wss.on('connection', (ws) => {
    console.log('Client connected');
    let currentLang = 'en';
    let conversationHistory = [
        { role: 'system', content: DR_CORTES_PERSONA }
    ];

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            // Handle warmup ping (preload connection)
            if (data.type === 'warmup') {
                console.log('Warmup ping received - backend ready');
                ws.send(JSON.stringify({ type: 'warmup_ack' }));
                return;
            }

            // Handle language change
            if (data.type === 'language') {
                currentLang = data.lang || 'en';
                const langInstruction = LANGUAGE_INSTRUCTIONS[currentLang] || '';
                conversationHistory[0] = { role: 'system', content: DR_CORTES_PERSONA + langInstruction };
                console.log(`Language set to: ${currentLang}`);
                ws.send(JSON.stringify({ type: 'language_ack', lang: currentLang }));
                return;
            }

            if (data.type === 'chat') {
                const userMessage = data.text;
                console.log(`User: ${userMessage}`);

                // Add to history
                conversationHistory.push({ role: 'user', content: userMessage });

                // Small delay before GPT call (helps Simli stabilize)
                await delay(300);

                // Get response from GPT-5.2
                console.log('Calling GPT-5.2...');
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-5.2-chat-latest',
                        messages: conversationHistory,
                        max_completion_tokens: 100
                        // Note: gpt-5.2-chat-latest only supports temperature=1 (default)
                    })
                });

                const gptData = await response.json();
                console.log('GPT Raw Response:', JSON.stringify(gptData, null, 2));

                // Check for errors
                if (gptData.error) {
                    console.error('GPT Error:', gptData.error);
                    ws.send(JSON.stringify({ type: 'error', message: gptData.error.message }));
                    return;
                }

                const fullResponse = gptData.choices?.[0]?.message?.content || '';

                if (!fullResponse) {
                    console.error('Empty response from GPT. Full data:', JSON.stringify(gptData));
                    // Fallback response
                    const fallback = "I appreciate your question. Let me gather my thoughts on that topic.";
                    ws.send(JSON.stringify({ type: 'complete', text: fallback }));
                    return;
                }

                console.log(`Dr. Cortes: ${fullResponse}`);
                conversationHistory.push({ role: 'assistant', content: fullResponse });

                // Small delay before sending to client (helps smooth the transition)
                await delay(200);

                // Signal completion
                ws.send(JSON.stringify({ type: 'complete', text: fullResponse }));
            }
        } catch (error) {
            console.error('WebSocket error:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 9802;
server.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log('Dr. Cortes Real-Time Avatar');
    console.log('='.repeat(50));
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('='.repeat(50));
});
