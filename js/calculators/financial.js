/* ==========================================================================
   Financial & Tax Calculators Module (EMI, Percentage, VAT)
   ========================================================================== */

class FinancialSuite {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.calculateEMI();
    this.calculatePercentage();
    this.calculateVAT();
  }

  initElements() {
    // EMI Elements
    this.emiAmount = document.getElementById('emiAmount');
    this.emiRate = document.getElementById('emiRate');
    this.emiTenure = document.getElementById('emiTenure');
    this.emiMonthly = document.getElementById('emiMonthly');
    this.emiTotalInterest = document.getElementById('emiTotalInterest');
    this.emiTotalPayment = document.getElementById('emiTotalPayment');

    // Percentage Elements
    this.percMode = document.getElementById('percMode');
    this.percVal1 = document.getElementById('percVal1');
    this.percVal2 = document.getElementById('percVal2');
    this.percLabel1 = document.getElementById('percLabel1');
    this.percLabel2 = document.getElementById('percLabel2');
    this.percResultVal = document.getElementById('percResultVal');
    this.percExtraNote = document.getElementById('percExtraNote');

    // VAT Elements
    this.vatType = document.getElementById('vatType');
    this.vatRate = document.getElementById('vatRate');
    this.vatAmount = document.getElementById('vatAmount');
    this.vatResTitle = document.getElementById('vatResTitle');
    this.vatTotalVal = document.getElementById('vatTotalVal');
    this.vatTaxVal = document.getElementById('vatTaxVal');
  }

  bindEvents() {
    // EMI Listeners
    [this.emiAmount, this.emiRate, this.emiTenure].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateEMI());
    });

    // Percentage Listeners
    if (this.percMode) {
      this.percMode.addEventListener('change', () => {
        this.updatePercLabels();
        this.calculatePercentage();
      });
    }
    [this.percVal1, this.percVal2].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculatePercentage());
    });

    // VAT Listeners
    [this.vatType, this.vatRate, this.vatAmount].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateVAT());
    });
  }

  calculateEMI() {
    const P = parseFloat(this.emiAmount.value) || 0;
    const annualRate = parseFloat(this.emiRate.value) || 0;
    const years = parseFloat(this.emiTenure.value) || 0;

    if (P <= 0 || annualRate <= 0 || years <= 0) {
      this.emiMonthly.textContent = '0.00';
      this.emiTotalInterest.textContent = '0.00';
      this.emiTotalPayment.textContent = '0.00';
      return;
    }

    const r = annualRate / (12 * 100); // monthly rate
    const n = years * 12; // total months

    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    this.emiMonthly.textContent = emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.emiTotalInterest.textContent = totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.emiTotalPayment.textContent = totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  updatePercLabels() {
    const mode = this.percMode.value;
    switch (mode) {
      case 'of':
        this.percLabel1.textContent = 'Percentage (%)';
        this.percLabel2.textContent = 'Total Value Y';
        break;
      case 'isWhat':
        this.percLabel1.textContent = 'Value X';
        this.percLabel2.textContent = 'Total Value Y';
        break;
      case 'change':
        this.percLabel1.textContent = 'Initial Value X';
        this.percLabel2.textContent = 'Final Value Y';
        break;
      case 'discount':
        this.percLabel1.textContent = 'Original Price ($/BDT)';
        this.percLabel2.textContent = 'Discount (%)';
        break;
      case 'profit':
        this.percLabel1.textContent = 'Cost Price';
        this.percLabel2.textContent = 'Selling Price';
        break;
    }
  }

  calculatePercentage() {
    const mode = this.percMode.value;
    const x = parseFloat(this.percVal1.value) || 0;
    const y = parseFloat(this.percVal2.value) || 0;

    let res = 0;
    let note = '';

    switch (mode) {
      case 'of':
        res = (x / 100) * y;
        note = `${x}% of ${y} is ${res.toFixed(2)}`;
        break;
      case 'isWhat':
        res = y !== 0 ? (x / y) * 100 : 0;
        note = `${x} is ${res.toFixed(2)}% of ${y}`;
        break;
      case 'change':
        res = x !== 0 ? ((y - x) / x) * 100 : 0;
        const diff = y - x;
        note = `${diff >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(diff).toFixed(2)} (${res.toFixed(2)}%)`;
        break;
      case 'discount':
        const savings = (y / 100) * x;
        res = x - savings;
        note = `Final Price: ${res.toFixed(2)} | Savings: ${savings.toFixed(2)}`;
        break;
      case 'profit':
        const margin = y - x;
        res = x !== 0 ? (margin / x) * 100 : 0;
        note = `${margin >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(margin).toFixed(2)} (${res.toFixed(2)}%)`;
        break;
    }

    this.percResultVal.textContent = res.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.percExtraNote.textContent = note;
  }

  calculateVAT() {
    const type = this.vatType.value;
    const rate = parseFloat(this.vatRate.value) || 0;
    const amount = parseFloat(this.vatAmount.value) || 0;

    let total = 0;
    let tax = 0;

    if (type === 'add') {
      tax = amount * (rate / 100);
      total = amount + tax;
      this.vatResTitle.textContent = 'Gross Amount (Amount + VAT)';
      this.vatTaxVal.textContent = `VAT Amount (${rate}%): ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      // Remove VAT
      total = amount / (1 + rate / 100);
      tax = amount - total;
      this.vatResTitle.textContent = 'Net Amount (Amount - VAT)';
      this.vatTaxVal.textContent = `Extracted VAT (${rate}%): ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    this.vatTotalVal.textContent = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

window.financialSuite = new FinancialSuite();
