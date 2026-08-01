/* ==========================================================================
   Unit & Currency Converters Module
   ========================================================================== */

class ConvertersEngine {
  constructor() {
    this.unitUnits = {
      length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254
      },
      weight: {
        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        metric_ton: 1000,
        pound: 0.45359237,
        ounce: 0.028349523
      },
      area: {
        sq_meter: 1,
        sq_km: 1000000,
        sq_foot: 0.092903,
        acre: 4046.856,
        hectare: 10000
      },
      volume: {
        liter: 1,
        milliliter: 0.001,
        cubic_meter: 1000,
        gallon: 3.78541,
        fluid_ounce: 0.0295735
      },
      temperature: {
        celsius: 'C',
        fahrenheit: 'F',
        kelvin: 'K'
      },
      speed: {
        m_s: 1,
        km_h: 0.277778,
        mph: 0.44704,
        knot: 0.514444
      },
      pressure: {
        pascal: 1,
        bar: 100000,
        psi: 6894.76,
        atm: 101325
      },
      energy: {
        joule: 1,
        kilojoule: 1000,
        calorie: 4.184,
        kilocalorie: 4184,
        kwh: 3600000
      },
      power: {
        watt: 1,
        kilowatt: 1000,
        horsepower: 745.7
      },
      fuel: {
        l_100km: 'l_100km',
        mpg_us: 'mpg_us'
      },
      data: {
        byte: 1,
        kb: 1024,
        mb: 1048576,
        gb: 1073741824,
        tb: 1099511627776
      },
      frequency: {
        hz: 1,
        khz: 1000,
        mhz: 1000000,
        ghz: 1000000000
      },
      time: {
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        year: 31536000
      },
      angle: {
        degree: 1,
        radian: 57.2958,
        gradian: 0.9
      }
    };

    // Default Currency Fallback Rates (Base: USD)
    this.currencyRates = {
      USD: 1.0,
      BDT: 120.50,
      EUR: 0.92,
      GBP: 0.78,
      INR: 83.50,
      SAR: 3.75,
      AED: 3.67,
      CAD: 1.37,
      AUD: 1.52,
      JPY: 155.20,
      CNY: 7.25
    };

    this.initElements();
    this.bindEvents();
    this.populateUnits('length');
    this.calculateUnit();
    this.calculateCurrency();
  }

  initElements() {
    // Unit elements
    this.unitCatEl = document.getElementById('unitCategory');
    this.unitFromVal = document.getElementById('unitFromVal');
    this.unitToVal = document.getElementById('unitToVal');
    this.unitFromType = document.getElementById('unitFromType');
    this.unitToType = document.getElementById('unitToType');
    this.unitResText = document.getElementById('unitResultText');

    // Currency elements
    this.currAmount = document.getElementById('currAmount');
    this.currFrom = document.getElementById('currFrom');
    this.currTo = document.getElementById('currTo');
    this.currRateSub = document.getElementById('currRateSub');
    this.currResultText = document.getElementById('currResultText');
    this.currUpdatedTime = document.getElementById('currUpdatedTime');
    this.refreshCurrencyBtn = document.getElementById('refreshCurrencyBtn');
  }

  bindEvents() {
    if (this.unitCatEl) {
      this.unitCatEl.addEventListener('change', (e) => {
        this.populateUnits(e.target.value);
        this.calculateUnit();
      });
    }

    [this.unitFromVal, this.unitFromType, this.unitToType].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateUnit());
    });

    [this.currAmount, this.currFrom, this.currTo].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateCurrency());
    });

    if (this.refreshCurrencyBtn) {
      this.refreshCurrencyBtn.addEventListener('click', () => this.fetchLiveCurrencyRates());
    }
  }

  populateUnits(category) {
    const units = Object.keys(this.unitUnits[category] || {});
    const options = units.map(u => `<option value="${u}">${u.replace(/_/g, ' ').toUpperCase()}</option>`).join('');

    this.unitFromType.innerHTML = options;
    this.unitToType.innerHTML = options;

    if (units.length > 1) {
      this.unitToType.selectedIndex = 1;
    }
  }

  calculateUnit() {
    const cat = this.unitCatEl.value;
    const val = parseFloat(this.unitFromVal.value) || 0;
    const from = this.unitFromType.value;
    const to = this.unitToType.value;

    let result = 0;

    if (cat === 'temperature') {
      result = this.convertTemperature(val, from, to);
    } else if (cat === 'fuel') {
      result = (from === to) ? val : (val === 0 ? 0 : 235.215 / val);
    } else {
      const fromFactor = this.unitUnits[cat][from] || 1;
      const toFactor = this.unitUnits[cat][to] || 1;
      const baseValue = val * fromFactor;
      result = baseValue / toFactor;
    }

    const precision = window.appManager ? window.appManager.precision : 4;
    const formattedRes = Number.isInteger(result) ? result : parseFloat(result.toFixed(precision));

    this.unitToVal.value = formattedRes;
    this.unitResText.textContent = `${val} ${from.toUpperCase()} = ${formattedRes} ${to.toUpperCase()}`;
  }

  convertTemperature(val, from, to) {
    if (from === to) return val;
    let celsius = val;
    if (from === 'fahrenheit') celsius = (val - 32) * (5 / 9);
    else if (from === 'kelvin') celsius = val - 273.15;

    if (to === 'fahrenheit') return (celsius * 9 / 5) + 32;
    if (to === 'kelvin') return celsius + 273.15;
    return celsius;
  }

  calculateCurrency() {
    const amount = parseFloat(this.currAmount.value) || 0;
    const from = this.currFrom.value;
    const to = this.currTo.value;

    const fromRate = this.currencyRates[from] || 1.0;
    const toRate = this.currencyRates[to] || 1.0;

    // Convert from -> USD -> to
    const rate = toRate / fromRate;
    const total = amount * rate;

    this.currRateSub.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    this.currResultText.textContent = `${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}`;
  }

  async fetchLiveCurrencyRates() {
    try {
      if (window.appManager) window.appManager.showToast('Fetching latest exchange rates...');
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          Object.assign(this.currencyRates, data.rates);
          this.currUpdatedTime.textContent = `Updated live: ${new Date().toLocaleTimeString()}`;
          this.calculateCurrency();
          if (window.appManager) window.appManager.showToast('Exchange rates updated successfully! 🚀');
          return;
        }
      }
    } catch (e) {
      console.warn('Network offline or rate limit. Using cached rates.', e);
    }
    this.currUpdatedTime.textContent = 'Offline Cached Rates';
    if (window.appManager) window.appManager.showToast('Using offline fallback exchange rates');
  }
}

window.convertersEngine = new ConvertersEngine();
