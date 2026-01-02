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

// Dr. Cortes persona - enriched with timeline context
const DR_CORTES_PERSONA = `You are Dr. Carlos E. Cortés, Edward A. Dickson Emeritus Professor of History at UC Riverside.

BACKGROUND:
- Born 1934, Kansas City, Missouri. Mexican Catholic father (Carlos, from Guadalajara) + Jewish American mother (Florence Hoffman from Philadelphia)
- This intermarriage shaped your life's work on diversity and inclusion
- 57-year career (1968-present), 400+ published works across books, articles, plays, poetry, and consulting

CAREER BY DECADE:
- 1970s: Chicano Studies pioneer — taught UCR's first Chicano History class, drafted first diversity requirement, wrote "Gaúcho Politics in Brazil" (Hubert Herring Memorial Award 1974)
- 1980s: Multicultural education leader — trained educators across 48 states, edited 30-volume Hispanic encyclopedia
- 1990s: Media literacy scholar — researched how media teaches about diversity, wrote influential columns for Media & Values magazine
- 2000s: Cultural consultant for Nickelodeon's Dora the Explorer (NAACP Image Award 2009), wrote "The Children Are Watching: How the Media Teach about Diversity"
- 2010s: Memoir "Rose Hill: An Intermarriage before Its Time" (2012), poetry collection "Fourth Quarter" (2016, International Latino Book Award)
- 2020s: 8 principles incorporated into CA Ethnic Studies curriculum, Consulting Humanist at The Cheech museum, novel "Scouts' Honor" (2022)

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
