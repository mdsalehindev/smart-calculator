/* ==========================================================================
   Single Smart Calculator Engine
   ========================================================================== */

class BasicCalculator {
  constructor() {
    this.expression = '';
    this.currentResult = '0';
    this.isDegree = true;
    this.isEvaluated = false;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.mainExprEl = document.getElementById('mainExpression');
    this.mainResEl = document.getElementById('mainResult');
    this.degRadEl = document.getElementById('degRadToggle');
    this.degRadIndEl = document.getElementById('degRadIndicator');
  }

  bindEvents() {
    // Keypad Listener
    const keypad = document.querySelector('.keypad');
    if (keypad) {
      keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const key = btn.dataset.key;
        if (key) this.handleKeyPress(key);
      });
    }

    // Scientific Panel Listener
    const sciPanel = document.getElementById('sciPanel');
    if (sciPanel) {
      sciPanel.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || btn.id === 'degRadToggle') return;
        const key = btn.dataset.key;
        const fn = btn.dataset.fn;
        if (key) this.handleKeyPress(key);
        else if (fn) this.handleScientificFunction(fn);
      });
    }

    // Deg/Rad Toggle
    if (this.degRadEl) {
      this.degRadEl.addEventListener('click', () => {
        this.isDegree = !this.isDegree;
        this.degRadEl.textContent = this.isDegree ? 'DEG' : 'RAD';
        if (this.degRadIndEl) {
          this.degRadIndEl.textContent = this.isDegree ? 'DEG' : 'RAD';
        }
        if (window.appManager) window.appManager.showToast(`Angle unit set to ${this.isDegree ? 'Degrees' : 'Radians'}`);
      });
    }

    // Memory Buttons
    document.querySelectorAll('.mem-btn[data-mem]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.mem;
        this.handleMemory(action);
      });
    });
  }

  handleKeyPress(key) {
    if (window.appManager) window.appManager.playFeedback();

    if (key === 'AC') {
      this.expression = '';
      this.currentResult = '0';
      this.isEvaluated = false;
    } else if (key === 'C' || key === '⌫') {
      if (this.isEvaluated) {
        this.expression = '';
        this.currentResult = '0';
        this.isEvaluated = false;
      } else {
        this.expression = this.expression.slice(0, -1);
      }
    } else if (key === '=') {
      this.evaluateExpression();
      return;
    } else if (key === '±') {
      if (this.expression.startsWith('-')) {
        this.expression = this.expression.substring(1);
      } else if (this.expression) {
        this.expression = '-' + this.expression;
      }
    } else {
      if (this.isEvaluated) {
        if (['+', '-', '×', '÷', '%', '^'].includes(key)) {
          this.expression = this.currentResult + key;
        } else {
          this.expression = key;
        }
        this.isEvaluated = false;
      } else {
        this.expression += key;
      }
    }

    this.updateDisplay();
  }

  handleScientificFunction(fn) {
    if (window.appManager) window.appManager.playFeedback();

    if (this.isEvaluated) {
      this.expression = this.currentResult;
      this.isEvaluated = false;
    }

    switch (fn) {
      case 'sin': this.expression += 'sin('; break;
      case 'cos': this.expression += 'cos('; break;
      case 'tan': this.expression += 'tan('; break;
      case 'asin': this.expression += 'asin('; break;
      case 'acos': this.expression += 'acos('; break;
      case 'log': this.expression += 'log('; break;
      case 'ln': this.expression += 'ln('; break;
      case 'sqrt': this.expression += 'sqrt('; break;
      case 'pow2': this.expression += '^2'; break;
      case 'powY': this.expression += '^'; break;
      case 'fact': this.expression += '!'; break;
      case 'pi': this.expression += 'π'; break;
      case 'e': this.expression += 'e'; break;
      case 'abs': this.expression += 'abs('; break;
      case 'mod': this.expression += '%'; break;
    }

    this.updateDisplay();
  }

  handleMemory(action) {
    if (window.appManager) window.appManager.playFeedback();
    const currNum = parseFloat(this.currentResult) || 0;

    switch (action) {
      case 'MC':
        window.historyManager.clearMemory();
        if (window.appManager) window.appManager.showToast('Memory Cleared');
        break;
      case 'MR':
        this.expression += window.historyManager.getMemory();
        this.updateDisplay();
        break;
      case 'M+':
        window.historyManager.addMemory(currNum);
        if (window.appManager) window.appManager.showToast(`Added ${currNum} to Memory`);
        break;
      case 'M-':
        window.historyManager.subMemory(currNum);
        if (window.appManager) window.appManager.showToast(`Subtracted ${currNum} from Memory`);
        break;
      case 'MS':
        window.historyManager.setMemory(currNum);
        if (window.appManager) window.appManager.showToast(`Stored ${currNum} in Memory`);
        break;
    }
  }

  evaluateExpression() {
    if (!this.expression) return;
    try {
      let parsed = this.expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E');

      const toRad = (val) => this.isDegree ? (val * Math.PI) / 180 : val;
      const fromRad = (val) => this.isDegree ? (val * 180) / Math.PI : val;

      parsed = parsed.replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin(${toRad(eval(arg))})`);
      parsed = parsed.replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos(${toRad(eval(arg))})`);
      parsed = parsed.replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan(${toRad(eval(arg))})`);
      parsed = parsed.replace(/asin\(([^)]+)\)/g, (_, arg) => `${fromRad(Math.asin(eval(arg)))}`);
      parsed = parsed.replace(/acos\(([^)]+)\)/g, (_, arg) => `${fromRad(Math.acos(eval(arg)))}`);

      parsed = parsed.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
      parsed = parsed.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
      parsed = parsed.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
      parsed = parsed.replace(/abs\(([^)]+)\)/g, 'Math.abs($1)');
      parsed = parsed.replace(/\^/g, '**');

      parsed = parsed.replace(/(\d+)!/g, (_, n) => {
        let num = parseInt(n);
        if (num < 0) return 'NaN';
        let fact = 1;
        for (let i = 2; i <= num; i++) fact *= i;
        return fact;
      });

      const resultVal = Function(`"use strict"; return (${parsed})`)();

      if (isNaN(resultVal) || !isFinite(resultVal)) {
        this.currentResult = 'Error';
      } else {
        const precision = window.appManager ? window.appManager.precision : 4;
        this.currentResult = Number.isInteger(resultVal) ? String(resultVal) : String(parseFloat(resultVal.toFixed(precision)));
        window.historyManager.addEntry('Calculation', this.expression, this.currentResult);
      }
      this.isEvaluated = true;
    } catch (e) {
      console.error(e);
      this.currentResult = 'Error';
    }

    this.updateDisplay();
  }

  updateDisplay() {
    if (this.mainExprEl) this.mainExprEl.textContent = this.expression || '';
    if (this.mainResEl) this.mainResEl.textContent = this.currentResult;
  }
}

window.basicCalculator = new BasicCalculator();
