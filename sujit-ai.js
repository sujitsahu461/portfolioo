/**
 * @fileoverview Sujit AI — Frontend chat interface.
 * Handles: panel open/close, messaging, SSE streaming, markdown rendering,
 * conversation memory, suggested prompts, copy/retry/clear, accessibility.
 */

(function () {
  'use strict';

  // ── Configuration ──
  const API_URL = '/api/chat';
  const MAX_MESSAGE_LENGTH = 500;
  const MAX_HISTORY = 10;

  const SUGGESTED_PROMPTS = [
    'Who is Sujit?',
    'Tell me about BullLens',
    'How does Finn-Track-Pro work?',
    "What are Sujit's strongest technical skills?",
    'What did Sujit do during his 5 internships?',
    'Why should I hire Sujit?',
  ];

  // ── State ──
  let isOpen = false;
  let isStreaming = false;
  let conversationId = null;
  /** @type {Array<{role: string, content: string}>} */
  let conversationHistory = [];
  let lastTriggerElement = null;
  let userScrolledUp = false;

  // ── DOM References (populated on init) ──
  let panel, messagesContainer, inputField, sendBtn, charCount;

  // ── Simple Markdown Renderer ──
  function renderMarkdown(text) {
    let html = text
      // Escape HTML entities (security)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Unordered lists
      .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Line breaks (double newline = paragraph)
      .replace(/\n\n/g, '</p><p>')
      // Single newlines
      .replace(/\n/g, '<br>');

    // Wrap consecutive <li> items in <ul>
    html = html.replace(/(<li>.*?<\/li>(\s*<br>)*)+/g, (match) => {
      const items = match.replace(/<br>/g, '');
      return '<ul>' + items + '</ul>';
    });

    return '<p>' + html + '</p>';
  }

  // ── Panel Open/Close ──
  function openChat() {
    isOpen = true;
    panel.classList.add('sai-open');
    document.body.classList.add('sai-chat-open');
    inputField.focus();
    trackEvent('chat_opened');
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('sai-open');
    document.body.classList.remove('sai-chat-open');
    if (lastTriggerElement) {
      lastTriggerElement.focus();
    }
  }

  // ── Render Welcome State ──
  function renderWelcome() {
    const welcome = document.createElement('div');
    welcome.className = 'sai-welcome';
    welcome.innerHTML = `
      <span class="sai-welcome-icon"><i class="fas fa-robot"></i></span>
      <h4>Hi, I'm Sujit AI</h4>
      <p>I can tell you about Sujit's projects, technical skills, achievements, and development journey.</p>
      <div class="sai-suggestions" role="group" aria-label="Suggested questions">
        ${SUGGESTED_PROMPTS.map(
          (p) => `<button class="sai-suggestion-btn" type="button">${escapeHtml(p)}</button>`
        ).join('')}
      </div>
    `;
    messagesContainer.appendChild(welcome);

    // Bind suggestion clicks
    welcome.querySelectorAll('.sai-suggestion-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sendMessage(btn.textContent);
        trackEvent('suggested_prompt_clicked', btn.textContent);
      });
    });
  }

  // ── Add Message to UI ──
  function addMessage(role, content, sources = []) {
    // Remove welcome state on first message
    const welcome = messagesContainer.querySelector('.sai-welcome');
    if (welcome) welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `sai-msg sai-msg-${role}`;
    msgDiv.setAttribute('role', 'log');

    const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
    const renderedContent =
      role === 'assistant' ? renderMarkdown(content) : escapeHtml(content);

    msgDiv.innerHTML = `
      <div class="sai-msg-avatar"><i class="fas ${avatarIcon}"></i></div>
      <div class="sai-msg-body">
        <div class="sai-msg-content">${renderedContent}</div>
        ${
          role === 'assistant'
            ? `<div class="sai-msg-actions">
                <button class="sai-msg-action-btn sai-copy-btn" type="button" aria-label="Copy response"><i class="far fa-copy"></i> Copy</button>
               </div>`
            : ''
        }
        ${renderSources(sources)}
      </div>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();

    // Bind copy button
    const copyBtn = msgDiv.querySelector('.sai-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content).then(() => {
          copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
          }, 2000);
        });
      });
    }

    return msgDiv;
  }

  // ── Create Streaming Message Placeholder ──
  function createStreamingMessage() {
    const welcome = messagesContainer.querySelector('.sai-welcome');
    if (welcome) welcome.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'sai-msg sai-msg-assistant';
    msgDiv.setAttribute('role', 'log');
    msgDiv.innerHTML = `
      <div class="sai-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="sai-msg-body">
        <div class="sai-msg-content sai-streaming-cursor"></div>
        <div class="sai-msg-actions" style="display:none;">
          <button class="sai-msg-action-btn sai-copy-btn" type="button" aria-label="Copy response"><i class="far fa-copy"></i> Copy</button>
        </div>
        <div class="sai-sources-container"></div>
      </div>
    `;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  // ── Show Typing Indicator ──
  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'sai-msg sai-msg-assistant sai-typing-msg';
    typing.innerHTML = `
      <div class="sai-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="sai-msg-body">
        <div class="sai-typing">
          <span class="sai-typing-dot"></span>
          <span class="sai-typing-dot"></span>
          <span class="sai-typing-dot"></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typing);
    scrollToBottom();
    return typing;
  }

  function removeTypingIndicator() {
    const typing = messagesContainer.querySelector('.sai-typing-msg');
    if (typing) typing.remove();
  }

  // ── Render Sources & Interactive Subtopics ──
  function getSubtopicPrompt(title, category) {
    const t = (title || '').toLowerCase().trim();
    if (t.includes('developer profile') || t === 'profile') {
      return "Who is Sujit Kumar Sahu?";
    }
    if (t.includes('core philosophy') || t.includes('philosophy')) {
      return "What is Sujit's software development philosophy?";
    }
    if (t.includes('work experience') || t.includes('experience')) {
      return "What did Sujit do during his 5 internships?";
    }
    if (t.includes('bulllens')) {
      return "Tell me about BullLens — how does it work?";
    }
    if (t.includes('finn-track')) {
      return "What is Finn-Track-Pro and what features does it have?";
    }
    if (t.includes('superpower hands')) {
      return "How does Superpower Hands perform real-time hand gesture tracking?";
    }
    if (t.includes('pwa') || t.includes('bandwidth')) {
      return "What is the Bandwidth-Agnostic PWA?";
    }
    if (t.includes('votewise') || t.includes('voting')) {
      return "How does VoteWise ensure secure digital voting?";
    }
    if (t.includes('ipl') || t.includes('cricket')) {
      return "What data analytics methodologies were applied in the IPL Analytics project?";
    }
    if (t.includes('weather')) {
      return "What is the Weather Dashboard project?";
    }
    if (t.includes('bank')) {
      return "What is the Bank Management System?";
    }
    if (t.includes('education')) {
      return "Where does Sujit study and what is his degree?";
    }
    if (t.includes('certification') || t.includes('achievement')) {
      return "What certifications and credentials does Sujit hold?";
    }
    if (t.includes('contact')) {
      return "How can I contact Sujit Sahu?";
    }
    if (t.includes('cybersecurity')) {
      return "What cybersecurity skills does Sujit specialize in?";
    }
    if (t.includes('ai') || t.includes('machine learning')) {
      return "What are Sujit's AI and Machine Learning capabilities?";
    }
    if (t.includes('programming') || t.includes('language')) {
      return "What are Sujit's core programming languages?";
    }
    if (t.includes('web development')) {
      return "What web development frameworks and tools does Sujit use?";
    }
    if (t.includes('debugging')) {
      return "How does Sujit approach debugging complex bugs?";
    }
    if (t.includes('roadmap') || t.includes('learning')) {
      return "What are Sujit's current learning goals and technical roadmap?";
    }
    return `Tell me about ${title}`;
  }

  function renderSources(sources) {
    if (!sources || sources.length === 0) return '';

    const chips = sources
      .map((s) => {
        const prompt = getSubtopicPrompt(s.title, s.category);
        if (s.url) {
          return `<a href="${escapeHtml(s.url)}" class="sai-source-chip" target="_blank" rel="noopener noreferrer" title="Open external link">
            <i class="fas fa-external-link-alt"></i> ${escapeHtml(s.title)}
          </a>`;
        }
        return `<button class="sai-source-chip sai-subtopic-btn" type="button" data-prompt="${escapeHtml(prompt)}" title="Click to ask about: ${escapeHtml(s.title)}">
          <i class="fas fa-comment-dots"></i> ${escapeHtml(s.title)}
        </button>`;
      })
      .join('');

    return `
      <div class="sai-sources">
        <div class="sai-sources-label"><i class="fas fa-sparkles"></i> Related topics (click to ask):</div>
        <div class="sai-sources-list">${chips}</div>
      </div>
    `;
  }

  // ── Show Error ──
  function showError(message, retryFn) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'sai-error';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${escapeHtml(message)}</span>
      ${retryFn ? '<button class="sai-error-retry" type="button">Retry</button>' : ''}
    `;

    if (retryFn) {
      errorDiv.querySelector('.sai-error-retry').addEventListener('click', () => {
        errorDiv.remove();
        retryFn();
      });
    }

    messagesContainer.appendChild(errorDiv);
    scrollToBottom();
  }

  // ── Send Message ──
  async function sendMessage(text) {
    const message = (text || inputField.value).trim();
    if (!message || isStreaming) return;

    // Clear input
    inputField.value = '';
    updateCharCount();
    autoResizeInput();

    // User initiates message — reset manual scroll lock
    userScrolledUp = false;

    // Add user message
    addMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator
    const typing = showTypingIndicator();
    isStreaming = true;
    updateSendButton();

    trackEvent('question_submitted', message.slice(0, 50));

    try {
      // Create SSE connection
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId,
          history: conversationHistory.slice(-MAX_HISTORY),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }

      // Remove typing indicator
      removeTypingIndicator();

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamingMsg = createStreamingMessage();
      const contentEl = streamingMsg.querySelector('.sai-msg-content');
      let fullContent = '';
      let sources = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const event = JSON.parse(dataStr);

            switch (event.type) {
              case 'delta':
                fullContent += event.content;
                contentEl.innerHTML = renderMarkdown(fullContent);
                scrollToBottom();
                break;

              case 'sources':
                sources = event.sources || [];
                break;

              case 'done':
                conversationId = event.conversationId;
                break;

              case 'error':
                throw new Error(event.error);
            }
          } catch (parseErr) {
            if (parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr;
            }
          }
        }
      }

      // Finalize streaming message
      contentEl.classList.remove('sai-streaming-cursor');
      contentEl.innerHTML = renderMarkdown(fullContent);

      // Show copy button
      const actionsEl = streamingMsg.querySelector('.sai-msg-actions');
      if (actionsEl) actionsEl.style.display = '';

      // Bind copy
      const copyBtn = streamingMsg.querySelector('.sai-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(fullContent).then(() => {
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
            }, 2000);
          });
        });
      }

      // Show sources
      const sourcesContainer = streamingMsg.querySelector('.sai-sources-container');
      if (sourcesContainer && sources.length > 0) {
        sourcesContainer.innerHTML = renderSources(sources);
        sources.forEach((s) => {
          if (s.url) trackEvent('source_available', s.title);
        });
      }

      // Track source clicks
      streamingMsg.querySelectorAll('.sai-source-chip[href]').forEach((chip) => {
        chip.addEventListener('click', () => {
          trackEvent('source_clicked', chip.textContent.trim());
        });
      });

      // Update conversation history
      conversationHistory.push({ role: 'assistant', content: fullContent });

      // Trim history to prevent unbounded growth
      if (conversationHistory.length > MAX_HISTORY * 2) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
      }

      trackEvent('response_completed');
    } catch (err) {
      removeTypingIndicator();
      // Remove empty streaming messages
      const emptyStreaming = messagesContainer.querySelectorAll('.sai-streaming-cursor');
      emptyStreaming.forEach((el) => {
        const msg = el.closest('.sai-msg');
        if (msg && !el.textContent.trim()) msg.remove();
      });

      showError(
        err.message || "I couldn't reach Sujit AI right now. Please try again.",
        () => sendMessage(message)
      );
    } finally {
      isStreaming = false;
      updateSendButton();
      scrollToBottom();
    }
  }

  // ── Clear Conversation ──
  function clearConversation() {
    conversationHistory = [];
    conversationId = null;
    messagesContainer.innerHTML = '';
    renderWelcome();
  }

  // ── UI Helpers ──
  function scrollToBottom(force = false) {
    if (force || !userScrolledUp) {
      requestAnimationFrame(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    }
  }

  function updateSendButton() {
    sendBtn.disabled = isStreaming || !inputField.value.trim();
  }

  function updateCharCount() {
    const len = inputField.value.length;
    charCount.textContent = `${len}/${MAX_MESSAGE_LENGTH}`;
    charCount.classList.toggle('sai-visible', len > 0);
    charCount.classList.toggle('sai-over-limit', len > MAX_MESSAGE_LENGTH);
  }

  function autoResizeInput() {
    inputField.style.height = 'auto';
    inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Analytics ──
  function trackEvent(name, label) {
    if (typeof gtag === 'function') {
      gtag('event', name, {
        event_category: 'Sujit AI',
        event_label: label || '',
      });
    }
  }

  // ── Keyboard Handling ──
  function handleKeyDown(e) {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeChat();
    }
  }

  // ── Initialize ──
  function init() {
    // Create launcher button
    const launcher = document.createElement('button');
    launcher.id = 'sujitAiLauncher';
    launcher.setAttribute('aria-label', 'Open Sujit AI chat assistant');
    launcher.innerHTML = `
      <i class="fas fa-robot sai-launcher-icon"></i>
      <span>Ask Sujit AI</span>
      <span class="sai-launcher-pulse" aria-hidden="true"></span>
    `;
    document.body.appendChild(launcher);

    // Create chat panel
    const panelEl = document.createElement('div');
    panelEl.id = 'sujitAiPanel';
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'Sujit AI chat assistant');
    panelEl.setAttribute('aria-modal', 'true');
    panelEl.innerHTML = `
      <div class="sai-header">
        <div class="sai-header-left">
          <div class="sai-avatar"><i class="fas fa-robot"></i></div>
          <div class="sai-header-info">
            <h3>Sujit AI</h3>
            <p><span class="sai-status-dot"></span>Ask about work, projects & skills</p>
          </div>
        </div>
        <div class="sai-header-actions">
          <button class="sai-header-btn sai-clear-btn" type="button" aria-label="Clear conversation" title="Clear conversation">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button class="sai-header-btn sai-close-btn" type="button" aria-label="Close chat" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="sai-messages" aria-live="polite" aria-atomic="false"></div>
      <div class="sai-input-area">
        <div class="sai-input-row">
          <textarea
            class="sai-input-field"
            placeholder="Ask about Sujit's projects, skills, experience..."
            rows="1"
            maxlength="${MAX_MESSAGE_LENGTH}"
            aria-label="Chat message input"
          ></textarea>
          <button class="sai-send-btn" type="button" disabled aria-label="Send message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="sai-char-count">0/${MAX_MESSAGE_LENGTH}</div>
      </div>
    `;
    document.body.appendChild(panelEl);

    // Cache DOM references
    panel = panelEl;
    messagesContainer = panelEl.querySelector('.sai-messages');
    inputField = panelEl.querySelector('.sai-input-field');
    sendBtn = panelEl.querySelector('.sai-send-btn');
    charCount = panelEl.querySelector('.sai-char-count');

    // Prevent external smooth-scroll libraries (Lenis) from intercepting mouse wheel inside chat
    panelEl.setAttribute('data-lenis-prevent', 'true');
    messagesContainer.setAttribute('data-lenis-prevent', 'true');

    // Ensure native mouse wheel scroll is completely unobstructed
    messagesContainer.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });

    // Enable smooth independent scrolling tracking
    messagesContainer.addEventListener('scroll', () => {
      const threshold = 60;
      const distanceFromBottom =
        messagesContainer.scrollHeight -
        messagesContainer.scrollTop -
        messagesContainer.clientHeight;
      userScrolledUp = distanceFromBottom > threshold;
    }, { passive: true });

    // Render welcome state
    renderWelcome();

    // ── Event Listeners ──

    // Launcher click
    launcher.addEventListener('click', () => {
      lastTriggerElement = launcher;
      openChat();
    });

    // Close button
    panelEl.querySelector('.sai-close-btn').addEventListener('click', closeChat);

    // Clear button
    panelEl.querySelector('.sai-clear-btn').addEventListener('click', clearConversation);

    // Send button
    sendBtn.addEventListener('click', () => sendMessage());

    // Delegated click on interactive related subtopics
    messagesContainer.addEventListener('click', (e) => {
      const subtopicBtn = e.target.closest('.sai-subtopic-btn');
      if (subtopicBtn) {
        const prompt = subtopicBtn.getAttribute('data-prompt');
        if (prompt && !isStreaming) {
          sendMessage(prompt);
          trackEvent('subtopic_clicked', prompt);
        }
      }
    });

    // Input events
    inputField.addEventListener('input', () => {
      updateSendButton();
      updateCharCount();
      autoResizeInput();
    });

    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Global keyboard
    document.addEventListener('keydown', handleKeyDown);

    // Close on backdrop click (desktop only — panel doesn't have a backdrop, so no-op)
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
