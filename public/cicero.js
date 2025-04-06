/**
 * Cicero - Text-to-Speech Module
 *
 * A modular text-to-speech library that adds reading capabilities to any web content.
 */
const Cicero = (function () {
  // Add inline CONFIG object for Cicero since it's in a self-executing function
  const CONFIG = {
    FEEDBACK_TIMEOUT: 3000,
    READ_CHUNK_DELAY: 100,
    RESUME_DELAY: 500,
    NETWORK_RETRY_DELAY: 2000,
  };

  function create(options = {}) {
    const synth = window.speechSynthesis;
    const templates = {};
    let utterance = null;
    let isReading = false;
    let textQueue = [];
    let currentSectionId = null;
    const eventListeners = [];
    const createdElements = [];

    // Default empty messaging function if none provided
    const messagingFn =
      options.messagingFn ||
      function (message, type) {
        console.log(`[${type}] ${message}`);
      };

    const voiceSettings = {
      rate: options.rate || 1,
      pitch: options.pitch || 1,
      volume: options.volume || 1,
      voice: null,
    };

    const isSpeechSupported = 'speechSynthesis' in window;

    function addEventListenerWithTracking(element, type, handler) {
      element.addEventListener(type, handler);
      eventListeners.push({ element, type, handler });
    }

    function createElementWithTracking(tagName, parent = null) {
      const element = document.createElement(tagName);
      if (parent) {
        parent.appendChild(element);
      }
      createdElements.push(element);
      return element;
    }

    function loadTemplates() {
      const templateElement = document.getElementById('cicero-templates');
      if (!templateElement) {
        console.error('Cicero templates not found in DOM');
        return false;
      }
      const templateIds = [
        'cicero-button',
        'cicero-stop',
        'cicero-settings',
        'cicero-feedback',
      ];
      let success = true;
      templateIds.forEach((id) => {
        const template = templateElement.content.querySelector(`#${id}`);
        if (template) {
          templates[id] = template;
        } else {
          console.error(`Template not found: ${id}`);
          success = false;
        }
      });
      return success;
    }

    // Local feedback function that uses the injected messaging function
    function showUserFeedback(message, type = 'info') {
      // Call the injected messaging function
      messagingFn(message, type);

      // Still show visual feedback if feedback element exists
      const feedbackEl = document.getElementById('cicero-feedback');
      if (feedbackEl) {
        feedbackEl.textContent = message;
        feedbackEl.classList.add('cicero-visible');
        if (type === 'error') {
          feedbackEl.classList.add('cicero-error');
        } else {
          feedbackEl.classList.remove('cicero-error');
        }
        setTimeout(() => {
          feedbackEl.classList.remove('cicero-visible');
        }, CONFIG.FEEDBACK_TIMEOUT);
      }
    }

    function createTemplate(templateId, parent) {
      if (!templates[templateId]) {
        console.error(`Template not found: ${templateId}`);
        return null;
      }
      const clone = templates[templateId].cloneNode(true);
      const container = createElementWithTracking('div', parent);
      container.appendChild(clone);
      while (container.firstChild) {
        const child = container.firstChild;
        container.removeChild(child);
        parent.appendChild(child);
        if (child.nodeType === Node.ELEMENT_NODE) {
          createdElements.push(child);
          return child;
        }
      }
      container.remove();
      return null;
    }

    function loadVoices() {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const userLang = navigator.language || navigator.userLanguage;
        const langCode = userLang.split('-')[0];
        const matchedVoice =
          voices.find(
            (voice) => voice.lang.startsWith(langCode) && voice.localService
          ) || voices.find((voice) => voice.lang.startsWith(langCode));
        if (matchedVoice) {
          voiceSettings.voice = matchedVoice;
        } else {
          voiceSettings.voice = voices[0];
        }
      }
      return voices;
    }

    function readNextChunk() {
      if (!textQueue || textQueue.length === 0) {
        handleSpeechEnd();
        return;
      }
      const chunk = textQueue.shift();
      utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice;
      }
      utterance.onend = () => {
        if (isReading) {
          setTimeout(() => readNextChunk(), CONFIG.READ_CHUNK_DELAY);
        }
      };
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        showUserFeedback(
          'Error while reading text. Trying to continue...',
          'error'
        );
        if (e.error === 'interrupted' && isReading) {
          setTimeout(() => readNextChunk(), CONFIG.RESUME_DELAY);
        } else if (e.error === 'network' && isReading) {
          setTimeout(() => readNextChunk(), CONFIG.NETWORK_RETRY_DELAY);
        } else {
          handleSpeechEnd();
          showUserFeedback('Reading stopped due to an error', 'error');
        }
      };
      try {
        synth.speak(utterance);
      } catch (error) {
        console.error('Failed to speak:', error);
        showUserFeedback('Could not start text reading', 'error');
        handleSpeechEnd();
      }
    }

    function toggleReading(sectionId) {
      if (isReading) {
        if (currentSectionId === sectionId) {
          if (synth.paused) {
            resumeReading();
          } else {
            pauseReading();
          }
        } else {
          stopReading();
          setTimeout(() => startReading(sectionId), CONFIG.READ_CHUNK_DELAY);
        }
        return;
      }
      startReading(sectionId);
    }

    function startReading(sectionId) {
      const section = document.getElementById(sectionId);
      if (!section) {
        showUserFeedback('Could not find content to read', 'error');
        return;
      }
      currentSectionId = sectionId;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = section.innerHTML;
      Array.from(tempDiv.querySelectorAll('script')).forEach((script) =>
        script.remove()
      );
      const textToRead = tempDiv.innerText || tempDiv.textContent;
      const sentences = textToRead.match(/[^.!?]+[.!?]+/g) || [textToRead];
      textQueue = sentences.filter((sentence) => sentence.trim().length > 0);
      if (textQueue.length === 0) {
        showUserFeedback('No readable content found', 'error');
        return;
      }
      isReading = true;
      readNextChunk();
      updateUIForReading();
      showUserFeedback('Started reading aloud', 'info');
    }

    function pauseReading() {
      if (synth && isReading) {
        synth.pause();
        document.querySelectorAll('.cicero-btn').forEach((btn) => {
          if (btn.dataset.targetId === currentSectionId) {
            btn.innerHTML = '▶️ Resume';
            btn.setAttribute('aria-label', 'Resume reading aloud');
          }
        });
        showUserFeedback('Paused reading', 'info');
      }
    }

    function resumeReading() {
      if (synth) {
        synth.resume();
        document.querySelectorAll('.cicero-btn').forEach((btn) => {
          if (btn.dataset.targetId === currentSectionId) {
            btn.innerHTML = '⏸️ Pause';
            btn.setAttribute('aria-label', 'Pause reading aloud');
          }
        });
        showUserFeedback('Resumed reading', 'info');
      }
    }

    function stopReading() {
      if (synth) {
        synth.cancel();
      }
      isReading = false;
      currentSectionId = null;
      textQueue = [];
      updateUIForStopped();
      showUserFeedback('Stopped reading', 'info');
    }

    function handleSpeechEnd() {
      isReading = false;
      currentSectionId = null;
      updateUIForStopped();
    }

    function updateUIForReading() {
      document.querySelectorAll('.cicero-btn').forEach((btn) => {
        if (btn.dataset.targetId === currentSectionId) {
          btn.innerHTML = '⏸️ Pause';
          btn.setAttribute('aria-label', 'Pause reading aloud');
        } else {
          btn.innerHTML = '🔊 Read Aloud';
          btn.setAttribute('aria-label', 'Read this content aloud');
        }
      });
      const stopBtn = document.getElementById('cicero-stop');
      if (stopBtn) {
        stopBtn.classList.add('cicero-visible');
      }
    }

    function updateUIForStopped() {
      document.querySelectorAll('.cicero-btn').forEach((btn) => {
        btn.innerHTML = '🔊 Read Aloud';
        btn.setAttribute('aria-label', 'Read this content aloud');
      });
      const stopBtn = document.getElementById('cicero-stop');
      if (stopBtn) {
        stopBtn.classList.remove('cicero-visible');
      }
    }

    function handleVisibilityChange() {
      if (document.hidden && isReading) {
        pauseReading();
      } else if (!document.hidden && isReading && synth.paused) {
        resumeReading();
      }
    }

    function setupSettingsPanel() {
      const settingsBtn = createTemplate('cicero-settings', document.body);
      if (!settingsBtn) return;
      const settingsPanel = settingsBtn.querySelector('.cicero-settings-panel');
      const toggleBtn = settingsBtn.querySelector('.cicero-settings-toggle');
      if (toggleBtn && settingsPanel) {
        addEventListenerWithTracking(toggleBtn, 'click', () => {
          settingsPanel.classList.toggle('cicero-visible');
        });
      }
      function populateVoiceList() {
        const voices = loadVoices();
        const voiceSelect = settingsBtn.querySelector('#cicero-voice-select');
        if (voiceSelect) {
          voiceSelect.innerHTML = '';
          voices.forEach((voice) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})${
              voice.localService ? ' [Local]' : ''
            }`;
            if (
              voiceSettings.voice &&
              voice.name === voiceSettings.voice.name
            ) {
              option.selected = true;
            }
            voiceSelect.appendChild(option);
          });
        }
      }
      const voiceSelect = settingsBtn.querySelector('#cicero-voice-select');
      if (voiceSelect) {
        addEventListenerWithTracking(voiceSelect, 'change', (e) => {
          const selectedName = e.target.value;
          const voices = synth.getVoices();
          const selectedVoice = voices.find(
            (voice) => voice.name === selectedName
          );
          if (selectedVoice) {
            voiceSettings.voice = selectedVoice;
          }
        });
      }
      const rateSlider = settingsBtn.querySelector('#cicero-rate-slider');
      const rateValue = settingsBtn.querySelector('#cicero-rate-value');
      if (rateSlider && rateValue) {
        rateSlider.value = voiceSettings.rate;
        rateValue.textContent = voiceSettings.rate.toFixed(1);
        addEventListenerWithTracking(rateSlider, 'input', (e) => {
          const value = parseFloat(e.target.value);
          rateValue.textContent = value.toFixed(1);
          voiceSettings.rate = value;
        });
      }
      const pitchSlider = settingsBtn.querySelector('#cicero-pitch-slider');
      const pitchValue = settingsBtn.querySelector('#cicero-pitch-value');
      if (pitchSlider && pitchValue) {
        pitchSlider.value = voiceSettings.pitch;
        pitchValue.textContent = voiceSettings.pitch.toFixed(1);
        addEventListenerWithTracking(pitchSlider, 'input', (e) => {
          const value = parseFloat(e.target.value);
          pitchValue.textContent = value.toFixed(1);
          voiceSettings.pitch = value;
        });
      }
      const volumeSlider = settingsBtn.querySelector('#cicero-volume-slider');
      const volumeValue = settingsBtn.querySelector('#cicero-volume-value');
      if (volumeSlider && volumeValue) {
        volumeSlider.value = voiceSettings.volume;
        volumeValue.textContent = voiceSettings.volume.toFixed(1);
        addEventListenerWithTracking(volumeSlider, 'input', (e) => {
          const value = parseFloat(e.target.value);
          volumeValue.textContent = value.toFixed(1);
          voiceSettings.volume = value;
        });
      }
      if (synth.onvoiceschanged !== undefined) {
        addEventListenerWithTracking(synth, 'voiceschanged', populateVoiceList);
      }
      populateVoiceList();
    }

    function init() {
      if (!loadTemplates()) {
        console.error('Failed to load Cicero templates');
        return false;
      }
      if (!isSpeechSupported) {
        console.warn('Speech synthesis not supported in this browser');
        showUserFeedback(
          'Text-to-speech is not supported in your browser',
          'error'
        );
        return false;
      }
      const sections = document.querySelectorAll(options.selector || 'section');
      if (sections.length === 0) {
        console.warn('No sections found for Cicero');
        return false;
      }
      createTemplate('cicero-stop', document.body);
      const stopButton = document.getElementById('cicero-stop');
      if (stopButton) {
        addEventListenerWithTracking(stopButton, 'click', stopReading);
      }
      sections.forEach((section, index) => {
        if (!section.id) {
          section.id = `content-${index}`;
        }
        const readButton = createTemplate('cicero-button', section.parentNode);
        if (!readButton) return;
        readButton.dataset.targetId = section.id;
        section.parentNode.insertBefore(readButton, section);
        addEventListenerWithTracking(readButton, 'click', () =>
          toggleReading(section.id)
        );
      });
      addEventListenerWithTracking(
        document,
        'visibilitychange',
        handleVisibilityChange
      );
      setupSettingsPanel();
      return true;
    }

    function destroy() {
      if (synth) {
        synth.cancel();
      }
      eventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      createdElements.forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      eventListeners.length = 0;
      createdElements.length = 0;
    }

    let initSuccessful = false;
    try {
      initSuccessful = init();
    } catch (error) {
      console.error('Error initializing Cicero:', error);
      showUserFeedback('Error initializing Cicero: ' + error.message, 'error');
    }

    return {
      start: (sectionId) => startReading(sectionId),
      pause: pauseReading,
      resume: resumeReading,
      stop: stopReading,
      toggle: (sectionId) => toggleReading(sectionId),
      getVoices: () => synth.getVoices(),
      setVoice: (voice) => {
        voiceSettings.voice = voice;
      },
      setRate: (rate) => {
        voiceSettings.rate = rate;
      },
      setPitch: (pitch) => {
        voiceSettings.pitch = pitch;
      },
      setVolume: (volume) => {
        voiceSettings.volume = volume;
      },
      isSupported: isSpeechSupported,
      isInitialized: initSuccessful,
      isReading: () => isReading,
      destroy,
    };
  }

  return {
    create,
  };
})();
