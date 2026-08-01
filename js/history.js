/* ==========================================================================
   History & Memory Management System
   ========================================================================== */

class HistoryManager {
  constructor() {
    this.storageKey = 'smart_calc_history_v1';
    this.memKey = 'smart_calc_memory_v1';
    this.history = this.loadHistory();
    this.memoryValue = parseFloat(localStorage.getItem(this.memKey)) || 0;
  }

  loadHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load history', e);
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history.slice(0, 100)));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  addEntry(type, expression, result) {
    if (!expression || result === undefined || result === 'Error') return;
    const entry = {
      id: Date.now(),
      type: type || 'Basic',
      expression: String(expression),
      result: String(result),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      favorite: false
    };
    this.history.unshift(entry);
    this.saveHistory();
    this.renderHistoryUI();
  }

  toggleFavorite(id) {
    const item = this.history.find(h => h.id === id);
    if (item) {
      item.favorite = !item.favorite;
      this.saveHistory();
      this.renderHistoryUI();
    }
  }

  deleteEntry(id) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveHistory();
    this.renderHistoryUI();
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderHistoryUI();
  }

  renderHistoryUI() {
    const container = document.getElementById('historyList');
    if (!container) return;

    if (this.history.length === 0) {
      container.innerHTML = '<div class="text-center" style="color:var(--text-muted); padding:30px;">No calculations saved yet</div>';
      return;
    }

    container.innerHTML = this.history.map(item => `
      <div class="history-item" data-expr="${item.expression}" data-res="${item.result}">
        <div>
          <div style="font-size:0.75rem; color:var(--accent); font-weight:700;">[${item.type}] ${item.timestamp}</div>
          <div class="history-expr">${item.expression} =</div>
          <div class="history-res">${item.result}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="mem-btn star-btn" data-id="${item.id}">${item.favorite ? '⭐' : '☆'}</button>
          <button class="mem-btn del-btn" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    // Attach event listeners for click to reuse
    container.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('star-btn')) {
          e.stopPropagation();
          this.toggleFavorite(Number(e.target.dataset.id));
        } else if (e.target.classList.contains('del-btn')) {
          e.stopPropagation();
          this.deleteEntry(Number(e.target.dataset.id));
        } else {
          const res = el.dataset.res;
          if (window.appManager) {
            window.appManager.loadHistoryResult(res);
          }
        }
      });
    });
  }

  exportCSV() {
    if (this.history.length === 0) return alert('History is empty.');
    let csvContent = 'data:text/csv;charset=utf-8,Type,Timestamp,Expression,Result\n';
    this.history.forEach(row => {
      csvContent += `"${row.type}","${row.timestamp}","${row.expression.replace(/"/g, '""')}","${row.result}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calculator_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Memory Functions
  setMemory(val) {
    this.memoryValue = val;
    localStorage.setItem(this.memKey, String(val));
    this.updateMemoryIndicators();
  }

  getMemory() {
    return this.memoryValue;
  }

  clearMemory() {
    this.memoryValue = 0;
    localStorage.setItem(this.memKey, '0');
    this.updateMemoryIndicators();
  }

  addMemory(val) {
    this.memoryValue += (parseFloat(val) || 0);
    localStorage.setItem(this.memKey, String(this.memoryValue));
    this.updateMemoryIndicators();
  }

  subMemory(val) {
    this.memoryValue -= (parseFloat(val) || 0);
    localStorage.setItem(this.memKey, String(this.memoryValue));
    this.updateMemoryIndicators();
  }

  updateMemoryIndicators() {
    const active = this.memoryValue !== 0;
    ['memIndicator', 'sciMemIndicator'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (active) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
  }
}

window.historyManager = new HistoryManager();
