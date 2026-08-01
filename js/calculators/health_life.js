/* ==========================================================================
   Health & Life Tools Module (BMI, Age, Date Calculator)
   ========================================================================== */

class HealthLifeSuite {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.setDefaultDates();
    this.calculateBMI();
    this.calculateAge();
    this.calculateDate();
  }

  initElements() {
    // BMI Elements
    this.bmiUnitToggle = document.getElementById('bmiUnitToggle');
    this.bmiMetricInputs = document.getElementById('bmiMetricInputs');
    this.bmiImperialInputs = document.getElementById('bmiImperialInputs');
    this.bmiHeightCm = document.getElementById('bmiHeightCm');
    this.bmiWeightKg = document.getElementById('bmiWeightKg');
    this.bmiHeightFt = document.getElementById('bmiHeightFt');
    this.bmiHeightIn = document.getElementById('bmiHeightIn');
    this.bmiWeightLbs = document.getElementById('bmiWeightLbs');
    this.bmiValue = document.getElementById('bmiValue');
    this.bmiCategory = document.getElementById('bmiCategory');
    this.bmiBar = document.getElementById('bmiBar');
    this.bmiIdealRange = document.getElementById('bmiIdealRange');

    // Age Elements
    this.ageDob = document.getElementById('ageDob');
    this.ageTarget = document.getElementById('ageTarget');
    this.ageMainResult = document.getElementById('ageMainResult');
    this.ageNextBirthday = document.getElementById('ageNextBirthday');
    this.ageDays = document.getElementById('ageDays');
    this.ageWeeks = document.getElementById('ageWeeks');
    this.ageHours = document.getElementById('ageHours');
    this.ageMinutes = document.getElementById('ageMinutes');

    // Date Elements
    this.dateMode = document.getElementById('dateMode');
    this.dateDiffSection = document.getElementById('dateDiffSection');
    this.dateAddSection = document.getElementById('dateAddSection');
    this.dateStart = document.getElementById('dateStart');
    this.dateEnd = document.getElementById('dateEnd');
    this.dateBase = document.getElementById('dateBase');
    this.dateAddVal = document.getElementById('dateAddVal');
    this.dateResultVal = document.getElementById('dateResultVal');
    this.dateResultSub = document.getElementById('dateResultSub');
  }

  bindEvents() {
    // BMI
    if (this.bmiUnitToggle) {
      this.bmiUnitToggle.addEventListener('change', (e) => {
        if (e.target.value === 'metric') {
          this.bmiMetricInputs.classList.remove('hidden');
          this.bmiImperialInputs.classList.add('hidden');
        } else {
          this.bmiMetricInputs.classList.add('hidden');
          this.bmiImperialInputs.classList.remove('hidden');
        }
        this.calculateBMI();
      });
    }

    [this.bmiHeightCm, this.bmiWeightKg, this.bmiHeightFt, this.bmiHeightIn, this.bmiWeightLbs].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateBMI());
    });

    // Age
    [this.ageDob, this.ageTarget].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateAge());
    });

    // Date
    if (this.dateMode) {
      this.dateMode.addEventListener('change', (e) => {
        if (e.target.value === 'diff') {
          this.dateDiffSection.classList.remove('hidden');
          this.dateAddSection.classList.add('hidden');
        } else {
          this.dateDiffSection.classList.add('hidden');
          this.dateAddSection.classList.remove('hidden');
        }
        this.calculateDate();
      });
    }

    [this.dateStart, this.dateEnd, this.dateBase, this.dateAddVal].forEach(el => {
      if (el) el.addEventListener('input', () => this.calculateDate());
    });
  }

  setDefaultDates() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.ageTarget) this.ageTarget.value = todayStr;
    if (this.ageDob) this.ageDob.value = '2000-01-01';

    if (this.dateStart) this.dateStart.value = todayStr;
    if (this.dateEnd) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      this.dateEnd.value = nextMonth.toISOString().split('T')[0];
    }
    if (this.dateBase) this.dateBase.value = todayStr;
  }

  calculateBMI() {
    const isMetric = this.bmiUnitToggle.value === 'metric';
    let bmi = 0;
    let minWeight = 0;
    let maxWeight = 0;
    let unitStr = 'kg';

    if (isMetric) {
      const heightM = (parseFloat(this.bmiHeightCm.value) || 0) / 100;
      const weightKg = parseFloat(this.bmiWeightKg.value) || 0;
      if (heightM > 0 && weightKg > 0) {
        bmi = weightKg / (heightM * heightM);
        minWeight = 18.5 * heightM * heightM;
        maxWeight = 24.9 * heightM * heightM;
      }
    } else {
      const feet = parseFloat(this.bmiHeightFt.value) || 0;
      const inches = parseFloat(this.bmiHeightIn.value) || 0;
      const totalInches = (feet * 12) + inches;
      const weightLbs = parseFloat(this.bmiWeightLbs.value) || 0;
      unitStr = 'lbs';
      if (totalInches > 0 && weightLbs > 0) {
        bmi = (weightLbs / (totalInches * totalInches)) * 703;
        minWeight = (18.5 * totalInches * totalInches) / 703;
        maxWeight = (24.9 * totalInches * totalInches) / 703;
      }
    }

    this.bmiValue.textContent = bmi > 0 ? bmi.toFixed(1) : '--';

    let catText = 'Normal Weight';
    let catColor = '#10b981';
    let fillPct = 50;

    if (bmi < 18.5) {
      catText = 'Underweight';
      catColor = '#3b82f6';
      fillPct = Math.max(10, (bmi / 18.5) * 30);
    } else if (bmi <= 24.9) {
      catText = 'Normal Weight';
      catColor = '#10b981';
      fillPct = 30 + ((bmi - 18.5) / 6.4) * 30;
    } else if (bmi <= 29.9) {
      catText = 'Overweight';
      catColor = '#f59e0b';
      fillPct = 60 + ((bmi - 25) / 4.9) * 20;
    } else {
      catText = 'Obese';
      catColor = '#ef4444';
      fillPct = Math.min(100, 80 + ((bmi - 30) / 10) * 20);
    }

    this.bmiCategory.textContent = catText;
    this.bmiCategory.style.color = catColor;
    this.bmiBar.style.width = `${fillPct}%`;
    this.bmiBar.style.backgroundColor = catColor;

    this.bmiIdealRange.textContent = `Healthy Weight: ${minWeight.toFixed(1)} ${unitStr} - ${maxWeight.toFixed(1)} ${unitStr}`;
  }

  calculateAge() {
    if (!this.ageDob.value || !this.ageTarget.value) return;

    const dob = new Date(this.ageDob.value);
    const target = new Date(this.ageTarget.value);

    if (isNaN(dob.getTime()) || isNaN(target.getTime())) return;

    let years = target.getFullYear() - dob.getFullYear();
    let months = target.getMonth() - dob.getMonth();
    let days = target.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    this.ageMainResult.textContent = `${years} Years, ${months} Months, ${days} Days`;

    // Total Breakdown
    const diffTime = Math.abs(target - dob);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    this.ageDays.textContent = totalDays.toLocaleString();
    this.ageWeeks.textContent = Math.floor(totalDays / 7).toLocaleString();
    this.ageHours.textContent = (totalDays * 24).toLocaleString();
    this.ageMinutes.textContent = (totalDays * 24 * 60).toLocaleString();

    // Next Birthday Countdown
    const nextBday = new Date(target.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }
    const daysToBday = Math.ceil((nextBday - target) / (1000 * 60 * 60 * 24));
    const dayOfWeekStr = nextBday.toLocaleDateString('en-US', { weekday: 'long' });

    this.ageNextBirthday.textContent = `Next Birthday in: ${daysToBday} days (${dayOfWeekStr})`;
  }

  calculateDate() {
    const mode = this.dateMode.value;

    if (mode === 'diff') {
      if (!this.dateStart.value || !this.dateEnd.value) return;
      const d1 = new Date(this.dateStart.value);
      const d2 = new Date(this.dateEnd.value);
      const diffMs = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Calculate working days (Mon-Fri)
      let workingDays = 0;
      let cur = new Date(Math.min(d1, d2));
      const end = new Date(Math.max(d1, d2));
      while (cur < end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) workingDays++;
        cur.setDate(cur.getDate() + 1);
      }

      this.dateResultVal.textContent = `${diffDays} Days`;
      this.dateResultSub.textContent = `Working Business Days: ${workingDays} (Mon-Fri)`;
    } else {
      if (!this.dateBase.value) return;
      const base = new Date(this.dateBase.value);
      const daysToAdd = parseInt(this.dateAddVal.value) || 0;
      base.setDate(base.getDate() + daysToAdd);

      const formattedDate = base.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      this.dateResultVal.textContent = formattedDate;
      this.dateResultSub.textContent = `${daysToAdd >= 0 ? 'Added' : 'Subtracted'} ${Math.abs(daysToAdd)} days from base date`;
    }
  }
}

window.healthLifeSuite = new HealthLifeSuite();
