/* ==========================================================================
   Single Calculator Application Manager & UI Orchestrator
   ========================================================================== */

class AppManager {
  constructor() {
    this.theme = localStorage.getItem('smart_calc_theme') || 'dark';
    this.precision = parseInt(localStorage.getItem('smart_calc_precision')) || 4;
    this.soundEnabled = localStorage.getItem('smart_calc_sound') !== 'off';
    this.vibrationEnabled = localStorage.getItem('smart_calc_vibration') !== 'off';
    this.isSciActive = false;

    this.audioCtx = null;

    this.initTheme();
    this.initElements();
    this.bindEvents();
    this.bindKeyboardShortcuts();
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  initElements() {
    this.sciToggleBtn = document.getElementById('sciToggleBtn');
    this.sciPanel = document.getElementById('sciPanel');
    this.degRadIndicator = document.getElementById('degRadIndicator');
    this.themeBtn = document.getElementById('themeBtn');
    this.historyBtn = document.getElementById('historyBtn');
    this.historyDrawer = document.getElementById('historyDrawer');
    this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.exportHistoryBtn = document.getElementById('exportHistoryBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.copyResultBtn = document.getElementById('copyResultBtn');

    // Settings Controls
    this.themeSelect = document.getElementById('themeSelect');
    this.precisionSelect = document.getElementById('precisionSelect');
    this.soundToggle = document.getElementById('soundToggle');
    this.vibrationToggle = document.getElementById('vibrationToggle');

    if (this.themeSelect) this.themeSelect.value = this.theme;
    if (this.precisionSelect) this.precisionSelect.value = String(this.precision);
    if (this.soundToggle) this.soundToggle.value = this.soundEnabled ? 'on' : 'off';
    if (this.vibrationToggle) this.vibrationToggle.value = this.vibrationEnabled ? 'on' : 'off';
  }

  bindEvents() {
    // Scientific Panel Toggle
    if (this.sciToggleBtn && this.sciPanel) {
      this.sciToggleBtn.addEventListener('click', () => {
        this.isSciActive = !this.isSciActive;
        this.sciToggleBtn.classList.toggle('active', this.isSciActive);
        this.sciPanel.classList.toggle('hidden', !this.isSciActive);
        if (this.degRadIndicator) {
          this.degRadIndicator.classList.toggle('hidden', !this.isSciActive);
        }
        this.playFeedback();
      });
    }

    // Theme Button Quick Cycle
    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', () => {
        const themes = ['dark', 'light', 'cyberpunk', 'sunset', 'emerald'];
        const nextIdx = (themes.indexOf(this.theme) + 1) % themes.length;
        this.setTheme(themes[nextIdx]);
      });
    }

    // History Drawer
    if (this.historyBtn) {
      this.historyBtn.addEventListener('click', () => {
        window.historyManager.renderHistoryUI();
        this.historyDrawer.classList.add('open');
      });
    }
    if (this.closeHistoryBtn) {
      this.closeHistoryBtn.addEventListener('click', () => {
        this.historyDrawer.classList.remove('open');
      });
    }
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear all calculation history?')) {
          window.historyManager.clearHistory();
          this.showToast('History cleared');
        }
      });
    }
    if (this.exportHistoryBtn) {
      this.exportHistoryBtn.addEventListener('click', () => {
        window.historyManager.exportCSV();
      });
    }

    // Settings Modal
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
        this.settingsModal.classList.add('active');
      });
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.addEventListener('click', () => {
        this.settingsModal.classList.remove('active');
      });
    }

    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
    }
    if (this.precisionSelect) {
      this.precisionSelect.addEventListener('change', (e) => {
        this.precision = parseInt(e.target.value);
        localStorage.setItem('smart_calc_precision', String(this.precision));
        this.showToast(`Precision set to ${this.precision} decimals`);
      });
    }
    if (this.soundToggle) {
      this.soundToggle.addEventListener('change', (e) => {
        this.soundEnabled = e.target.value === 'on';
        localStorage.setItem('smart_calc_sound', e.target.value);
      });
    }
    if (this.vibrationToggle) {
      this.vibrationToggle.addEventListener('change', (e) => {
        this.vibrationEnabled = e.target.value === 'on';
        localStorage.setItem('smart_calc_vibration', e.target.value);
      });
    }

    // Copy Result
    if (this.copyResultBtn) {
      this.copyResultBtn.addEventListener('click', () => {
        const resText = document.getElementById('mainResult').textContent;
        navigator.clipboard.writeText(resText);
        this.showToast(`Copied ${resText} to clipboard! 📋`);
      });
    }
  }

  setTheme(themeName) {
    this.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('smart_calc_theme', themeName);
    if (this.themeSelect) this.themeSelect.value = themeName;
    this.showToast(`Theme changed to ${themeName.toUpperCase()}`);
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = e.key;

      if (key >= '0' && key <= '9') {
        window.basicCalculator.handleKeyPress(key);
      } else if (key === '.') {
        window.basicCalculator.handleKeyPress('.');
      } else if (key === '+') {
        window.basicCalculator.handleKeyPress('+');
      } else if (key === '-') {
        window.basicCalculator.handleKeyPress('-');
      } else if (key === '*') {
        window.basicCalculator.handleKeyPress('×');
      } else if (key === '/') {
        e.preventDefault();
        window.basicCalculator.handleKeyPress('÷');
      } else if (key === '%') {
        window.basicCalculator.handleKeyPress('%');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        window.basicCalculator.handleKeyPress('=');
      } else if (key === 'Backspace') {
        window.basicCalculator.handleKeyPress('⌫');
      } else if (key === 'Escape') {
        window.basicCalculator.handleKeyPress('AC');
      } else if (key === '(' || key === ')') {
        window.basicCalculator.handleKeyPress(key);
      }
    });
  }

  playFeedback() {
    if (this.soundEnabled) {
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);
      } catch (e) {}
    }

    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(12);
    }
  }

  loadHistoryResult(resultVal) {
    this.historyDrawer.classList.remove('open');
    window.basicCalculator.expression += resultVal;
    window.basicCalculator.updateDisplay();
    this.showToast(`Loaded ${resultVal} into calculator`);
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appManager = new AppManager();
});
