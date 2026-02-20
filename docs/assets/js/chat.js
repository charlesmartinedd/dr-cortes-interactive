/**
 * Dr. Cortés Chat Module
 *
 * Handles:
 * - Chat panel toggle (slide in/out)
 * - Simli WebRTC avatar
 * - WebSocket chat with backend
 * - TTS audio playback
 *
 * IMPORTANT: All Simli timing logic preserved from original implementation
 */

// Import Simli Client from ESM
import { SimliClient } from 'https://esm.sh/simli-client@latest';

// Config - fetched from server (not hardcoded for security)
let SIMLI_API_KEY = '';
let SIMLI_FACE_ID = '';

// Fetch config from server on load
let configPromise = null;
async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        SIMLI_API_KEY = config.simliApiKey;
        SIMLI_FACE_ID = config.simliFaceId;
        console.log('Config loaded from server');
    } catch (err) {
        console.error('Failed to load config:', err);
    }
}
configPromise = loadConfig();

// Elements
const chatBtn = document.getElementById('btn-chat');
const chatPanel = document.getElementById('chat-panel');
const chatOverlay = document.getElementById('chat-overlay');
const chatClose = document.getElementById('chat-close');
const videoEl = document.getElementById('avatar-video');
const audioEl = document.getElementById('avatar-audio');
const placeholder = document.getElementById('avatar-placeholder');
const statusText = document.getElementById('status-text');
const connectionStatus = document.getElementById('connection-status');
const messagesEl = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const connectBtn = document.getElementById('connect-btn');
const avatarContainer = document.getElementById('avatar-container');
const modeToggle = document.getElementById('chat-mode-toggle');
const modeLabel = document.getElementById('mode-label');

// State
let ws = null;
let simliClient = null;
let isConnected = false;
let keepaliveInterval = null;
let isPanelOpen = false;
let hasInitialized = false;
let chatMode = 'text'; // 'text' or 'avatar'
let simliInitialized = false;
let audioContext = null;

// Preload state
let wsPreloaded = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// ============================================
// Panel Toggle
// ============================================

function toggleChatPanel(forceState) {
    const shouldOpen = forceState !== undefined ? forceState : !isPanelOpen;

    if (shouldOpen) {
        openChatPanel();
    } else {
        closeChatPanel();
    }
}

async function openChatPanel() {
    isPanelOpen = true;
    chatPanel.classList.add('active');
    chatPanel.setAttribute('aria-hidden', 'false');
    chatOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!hasInitialized) {
        hasInitialized = true;

        if (chatMode === 'text') {
            // Text mode: just connect WebSocket, show photo, enable chat
            statusText.textContent = 'Ready to chat';
            connectWebSocket();
            // Enable chat once WebSocket connects (handled in ws.onopen)
        } else {
            // Avatar mode: full Simli initialization
            await configPromise;
            setTimeout(() => {
                initSimli();
                setTimeout(() => {
                    statusText.textContent = wsPreloaded
                        ? 'Connecting avatar...'
                        : 'Connecting to Dr. Cortés...';
                    connectToSimli();
                }, 500);
            }, 400);
        }
    }
}

function closeChatPanel() {
    isPanelOpen = false;
    chatPanel.classList.remove('active');
    chatPanel.setAttribute('aria-hidden', 'true');
    chatOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// Keepalive - PRESERVED FROM ORIGINAL
// Send silence every 2 seconds to prevent Simli timeout
// ============================================

function startKeepalive() {
    if (keepaliveInterval) clearInterval(keepaliveInterval);
    keepaliveInterval = setInterval(() => {
        if (isConnected && simliClient) {
            const silence = new Uint8Array(1000).fill(0);
            simliClient.sendAudioData(silence);
        }
    }, 2000);
}

function stopKeepalive() {
    if (keepaliveInterval) {
        clearInterval(keepaliveInterval);
        keepaliveInterval = null;
    }
}

// ============================================
// Initialize Simli Client - PRESERVED FROM ORIGINAL
// ============================================

function initSimli() {
    simliClient = new SimliClient();

    const config = {
        apiKey: SIMLI_API_KEY,
        faceID: SIMLI_FACE_ID,
        handleSilence: true,
        videoRef: videoEl,
        audioRef: audioEl
    };

    simliClient.Initialize(config);
    console.log('Simli Client initialized');

    // Event listeners
    simliClient.on('connected', () => {
        console.log('SimliClient connected!');
        isConnected = true;
        connectionStatus.classList.add('hidden');
        connectBtn.classList.add('hidden');
        videoEl.classList.add('active');
        placeholder.classList.add('hidden');
        enableChat();
        startKeepalive();
    });

    simliClient.on('disconnected', () => {
        console.log('SimliClient disconnected');
        isConnected = false;
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.classList.remove('hidden');
        connectBtn.classList.remove('hidden');
        videoEl.classList.remove('active');
        placeholder.classList.remove('hidden');
        stopKeepalive();
    });

    simliClient.on('failed', () => {
        console.log('SimliClient failed');
        connectionStatus.textContent = 'Connection Failed';
        connectionStatus.classList.remove('hidden');
        connectBtn.classList.remove('hidden');
    });
}

// ============================================
// Connect to Simli - PRESERVED FROM ORIGINAL
// ============================================

async function connectToSimli() {
    try {
        statusText.textContent = 'Starting WebRTC...';

        // Start Simli WebRTC
        simliClient.start();

        // Send empty audio to initialize (as per Simli docs)
        // PRESERVED: 4 second delay before sending initial buffer
        setTimeout(() => {
            const emptyAudio = new Uint8Array(6000).fill(0);
            simliClient.sendAudioData(emptyAudio);
            console.log('Sent initial audio buffer');
        }, 4000);

        // Connect WebSocket for chat
        connectWebSocket();

    } catch (error) {
        console.error('Connection error:', error);
        statusText.textContent = 'Connection failed. Try again.';
    }
}

// ============================================
// WebSocket for Chat - WITH PRELOAD SUPPORT
// ============================================

function connectWebSocket() {
    // Don't reconnect if already connected
    if (ws && ws.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        wsPreloaded = true;
        retryCount = 0;

        // Send warmup ping to backend
        warmupAI();

        // Send current language to server
        const lang = window.i18n?.currentLang || 'en';
        if (lang !== 'en') {
            ws.send(JSON.stringify({ type: 'language', lang }));
        }

        if (chatMode === 'text') {
            // In text mode, enable chat immediately (no Simli dependency)
            enableChat();
            if (statusText) statusText.textContent = 'Ready to chat';
        } else if (isPanelOpen && statusText) {
            statusText.textContent = 'WebSocket ready, waiting for avatar...';
        }
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'chunk') {
            // Don't show streaming text - wait for speech
        } else if (data.type === 'complete') {
            await speakResponse(data.text);
            addMessage('assistant', data.text);
        } else if (data.type === 'error') {
            addMessage('system', 'Error: ' + data.message);
        } else if (data.type === 'warmup_ack') {
            console.log('AI backend warmed up');
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsPreloaded = false;

        // Silent retry with exponential backoff
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = 2000 * retryCount;
            console.log(`WebSocket retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
            setTimeout(connectWebSocket, delay);
        }
    };

    ws.onerror = () => {
        // Silent - let onclose handle retry
        console.log('WebSocket error');
    };
}

// Warmup AI backend
function warmupAI() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'warmup' }));
        console.log('Sent warmup ping to backend');
    }
}

// Preload chat connection on page load
function preloadChat() {
    console.log('Preloading chat connection...');
    connectWebSocket();
}

// ============================================
// TTS and Simli Audio - PRESERVED FROM ORIGINAL
// All timing values kept exactly as tested
// ============================================

async function speakResponse(text) {
    try {
        if (!text || text.trim() === '') {
            console.log('Empty text, skipping TTS');
            return;
        }

        // Stop background narration while chatbot speaks
        if (window.narration) window.narration.stop();

        // Text mode: play TTS through Web Audio API (no Simli)
        if (chatMode === 'text') {
            await speakResponseTextMode(text);
            return;
        }

        // Avatar mode: pipe through Simli (original flow)
        if (!isConnected || !simliClient) {
            console.log('Simli not connected, skipping speech');
            return;
        }

        // Stop keepalive during actual speech (we'll be sending real audio)
        stopKeepalive();

        // PRESERVED: 200ms delay before TTS to let Simli prepare
        await new Promise(r => setTimeout(r, 200));

        // Get TTS audio (PCM16 at 16kHz)
        const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const audioBuffer = await ttsRes.arrayBuffer();
        const pcm16Data = new Uint8Array(audioBuffer);

        console.log(`Sending ${pcm16Data.length} bytes of audio to Simli`);

        // PRESERVED: Send a small silence buffer first to prime Simli
        const silenceBuffer = new Uint8Array(3000).fill(0);
        simliClient.sendAudioData(silenceBuffer);
        await new Promise(r => setTimeout(r, 100));

        // PRESERVED: Send audio to Simli in 6000-byte chunks with 100ms pacing
        const chunkSize = 6000;
        const delayMs = 100; // Slower pacing for better lip-sync
        for (let i = 0; i < pcm16Data.length; i += chunkSize) {
            if (!isConnected) {
                console.log('Simli disconnected during speech');
                break;
            }
            const chunk = pcm16Data.slice(i, i + chunkSize);
            simliClient.sendAudioData(chunk);
            await new Promise(r => setTimeout(r, delayMs));
        }

        // PRESERVED: Wait for audio to finish playing (PCM16 16kHz = 32KB/sec)
        const audioDurationMs = (pcm16Data.length / 32000) * 1000;
        await new Promise(r => setTimeout(r, audioDurationMs + 300));

        // Restart keepalive after speech
        if (isConnected) {
            startKeepalive();
        }

    } catch (error) {
        console.error('TTS error:', error);
        // Restart keepalive on error too
        if (isConnected) {
            startKeepalive();
        }
    }
}

// Text mode TTS: fetch PCM16 from /api/tts, decode and play via Web Audio API
async function speakResponseTextMode(text) {
    try {
        const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const arrayBuf = await ttsRes.arrayBuffer();
        const pcm16 = new Int16Array(arrayBuf);

        // Convert PCM16 to Float32 for Web Audio API
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768;
        }

        // Create AudioContext on demand (browsers require user gesture)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        }

        // Resume if suspended (autoplay policy)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Create audio buffer and play
        const audioBuf = audioContext.createBuffer(1, float32.length, 16000);
        audioBuf.getChannelData(0).set(float32);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuf;
        source.connect(audioContext.destination);
        source.start();

        console.log(`Playing TTS audio (${float32.length} samples at 16kHz)`);
    } catch (error) {
        console.error('Text mode TTS error:', error);
    }
}

// ============================================
// Send Message
// ============================================

function sendMessage() {
    const text = userInput.value.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

    addMessage('user', text);
    userInput.value = '';
    sendBtn.disabled = true;

    ws.send(JSON.stringify({ type: 'chat', text }));

    // PRESERVED: 1 second cooldown
    setTimeout(() => { sendBtn.disabled = false; }, 1000);
}

// ============================================
// Add Message to Chat
// ============================================

function addMessage(role, text) {
    // Remove welcome message if present
    const welcome = messagesEl.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ============================================
// Enable Chat Input
// ============================================

function enableChat() {
    userInput.disabled = false;
    sendBtn.disabled = false;
    connectBtn.textContent = 'Reconnect';
    statusText.textContent = 'Connected! Ask me anything.';
}

// ============================================
// Event Listeners
// ============================================

// Chat button in header
chatBtn.addEventListener('click', () => toggleChatPanel(true));

// Close button
chatClose.addEventListener('click', () => toggleChatPanel(false));

// Overlay click closes panel
chatOverlay.addEventListener('click', () => toggleChatPanel(false));

// ESC key closes panel
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPanelOpen) {
        toggleChatPanel(false);
    }
});

// Mode toggle
modeToggle.addEventListener('click', handleModeToggle);

function handleModeToggle() {
    const t = (key) => window.i18n ? window.i18n.t(key) : key;

    if (chatMode === 'text') {
        chatMode = 'avatar';
        modeLabel.textContent = t('chat.avatarMode');
        avatarContainer.classList.remove('text-mode');

        // If avatar hasn't been initialized yet, start Simli
        if (!simliInitialized) {
            simliInitialized = true;
            statusText.textContent = 'Connecting avatar...';
            placeholder.classList.remove('hidden');
            (async () => {
                await configPromise;
                initSimli();
                setTimeout(() => connectToSimli(), 500);
            })();
        }
    } else {
        chatMode = 'text';
        modeLabel.textContent = t('chat.textMode');
        avatarContainer.classList.add('text-mode');
        statusText.textContent = t('chat.readyToChat');

        // Ensure chat is enabled in text mode if WS is connected
        if (ws && ws.readyState === WebSocket.OPEN) {
            enableChat();
        }
    }
}

// Reconnect button
connectBtn.addEventListener('click', connectToSimli);

// Send button
sendBtn.addEventListener('click', sendMessage);

// Enter key to send
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Preload chat connection on page load for faster first interaction
preloadChat();

// Listen for language changes and notify server
window.addEventListener('languageChanged', (e) => {
    const lang = e.detail?.lang || 'en';
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'language', lang }));
    }
    // Update mode label text
    if (window.i18n) {
        modeLabel.textContent = chatMode === 'text' ? window.i18n.t('chat.textMode') : window.i18n.t('chat.avatarMode');
    }
});

console.log('Chat module loaded');
