// Multi-Mode Calculator Application
class MultiModeCalculator {
    constructor() {
        this.currentMode = 'basic';
        this.basicCalculator = new BasicCalculator();
        this.bmiCalculator = new BMICalculator();
        this.loanCalculator = new LoanCalculator();
        this.ageCalculator = new AgeCalculator();
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupModeNavigation();
        this.basicCalculator.init();
        this.bmiCalculator.init();
        this.loanCalculator.init();
        this.ageCalculator.init();
    }
    
    setupModeNavigation() {
        const modeTabs = document.querySelectorAll('.mode-tab');
        const calculatorModes = document.querySelectorAll('.calculator-mode');
        
        modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                
                // Remove active class from all tabs and modes
                modeTabs.forEach(t => t.classList.remove('active'));
                calculatorModes.forEach(m => m.classList.remove('active'));
                
                // Add active class to selected tab and mode
                tab.classList.add('active');
                document.getElementById(`${mode}-mode`).classList.add('active');
                
                this.currentMode = mode;
            });
        });
    }
}

// Basic Calculator Class
class BasicCalculator {
    constructor() {
        this.display = null;
        this.history = null;
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForNewValue = false;
        this.lastOperation = null;
    }
    
    init() {
        this.display = document.getElementById('calc-result');
        this.history = document.getElementById('calc-history');
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        const buttons = document.querySelectorAll('.calc-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                const action = button.dataset.action;
                
                if (value !== undefined) {
                    if (['+', '-', '*', '/'].includes(value)) {
                        this.setOperator(value);
                    } else {
                        this.handleValue(value);
                    }
                } else if (action) {
                    this.handleAction(action);
                }
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#basic-mode.active')) {
                this.handleKeyboard(e);
            }
        });
    }
    
    handleValue(value) {
        if (value === '.') {
            if (this.currentValue.includes('.')) return;
            if (this.waitingForNewValue) {
                this.currentValue = '0.';
                this.waitingForNewValue = false;
            } else {
                this.currentValue += '.';
            }
        } else {
            if (this.waitingForNewValue) {
                this.currentValue = value;
                this.waitingForNewValue = false;
            } else {
                this.currentValue = this.currentValue === '0' ? value : this.currentValue + value;
            }
        }
        this.updateDisplay();
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }
    
    handleKeyboard(e) {
        if (!document.querySelector('#basic-mode.active')) return;
        
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            e.preventDefault();
            this.handleValue(e.key);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
            e.preventDefault();
            this.setOperator(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.clear();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.clearEntry();
        }
    }
    
    setOperator(newOperator) {
        if (this.operator && !this.waitingForNewValue) {
            this.calculate();
        }
        
        this.previousValue = this.currentValue;
        this.operator = newOperator;
        this.waitingForNewValue = true;
        this.updateHistory();
    }
    
    calculate() {
        if (!this.operator || this.waitingForNewValue) return;
        
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;
        
        try {
            switch (this.operator) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        throw new Error('Division by zero');
                    }
                    result = prev / current;
                    break;
                default:
                    return;
            }
            
            this.lastOperation = `${this.previousValue} ${this.getOperatorSymbol(this.operator)} ${this.currentValue}`;
            this.currentValue = this.formatResult(result);
            this.operator = null;
            this.previousValue = null;
            this.waitingForNewValue = true;
            this.updateHistory(`${this.lastOperation} = ${this.currentValue}`);
            
        } catch (error) {
            this.currentValue = 'Error';
            this.waitingForNewValue = true;
            this.updateHistory('Error');
        }
        
        this.updateDisplay();
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷'
        };
        return symbols[op] || op;
    }
    
    formatResult(result) {
        if (isNaN(result) || !isFinite(result)) {
            return 'Error';
        }
        
        // Handle very large or very small numbers
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
            return result.toExponential(6);
        }
        
        // Remove unnecessary decimals
        return parseFloat(result.toFixed(10)).toString();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForNewValue = false;
        this.updateDisplay();
        this.updateHistory('');
    }
    
    clearEntry() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.display.textContent = this.currentValue;
    }
    
    updateHistory(text = '') {
        if (text) {
            this.history.textContent = text;
        } else if (this.operator && this.previousValue) {
            this.history.textContent = `${this.previousValue} ${this.getOperatorSymbol(this.operator)}`;
        } else {
            this.history.textContent = '';
        }
    }
}

// BMI Calculator Class - Fixed initialization and calculation issues
class BMICalculator {
    constructor() {
        this.heightInput = null;
        this.weightInput = null;
        this.heightUnit = null;
        this.weightUnit = null;
        this.feetInput = null;
        this.inchesInput = null;
        this.feetInchesGroup = null;
    }
    
    init() {
        // Ensure elements exist before initializing
        this.heightInput = document.getElementById('height-input');
        this.weightInput = document.getElementById('weight-input');
        this.heightUnit = document.getElementById('height-unit');
        this.weightUnit = document.getElementById('weight-unit');
        this.feetInput = document.getElementById('feet-input');
        this.inchesInput = document.getElementById('inches-input');
        this.feetInchesGroup = document.getElementById('feet-inches-group');
        
        if (!this.heightInput || !this.weightInput) {
            console.error('BMI Calculator: Required elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.toggleHeightInputs(); // Initialize the correct display state
        this.resetBMIDisplay(); // Initialize display
    }
    
    setupEventListeners() {
        // Add event listeners with null checks
        if (this.heightInput) {
            this.heightInput.addEventListener('input', () => this.calculateBMI());
        }
        
        if (this.weightInput) {
            this.weightInput.addEventListener('input', () => this.calculateBMI());
        }
        
        if (this.feetInput) {
            this.feetInput.addEventListener('input', () => this.calculateBMI());
        }
        
        if (this.inchesInput) {
            this.inchesInput.addEventListener('input', () => this.calculateBMI());
        }
        
        if (this.heightUnit) {
            this.heightUnit.addEventListener('change', () => {
                this.toggleHeightInputs();
                this.calculateBMI();
            });
        }
        
        if (this.weightUnit) {
            this.weightUnit.addEventListener('change', () => this.calculateBMI());
        }
    }
    
    toggleHeightInputs() {
        if (!this.heightUnit || !this.heightInput || !this.feetInchesGroup) return;
        
        const isFeetInches = this.heightUnit.value === 'ft';
        
        if (isFeetInches) {
            this.heightInput.style.display = 'none';
            this.feetInchesGroup.style.display = 'block';
        } else {
            this.heightInput.style.display = 'block';
            this.feetInchesGroup.style.display = 'none';
        }
    }
    
    calculateBMI() {
        const height = this.getHeightInCm();
        const weight = this.getWeightInKg();
        
        if (!height || !weight || height <= 0 || weight <= 0) {
            this.resetBMIDisplay();
            return;
        }
        
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        
        this.updateBMIDisplay(bmi);
        this.updateBMIIndicator(bmi);
    }
    
    getHeightInCm() {
        if (!this.heightUnit) return 0;
        
        if (this.heightUnit.value === 'cm') {
            return parseFloat(this.heightInput?.value) || 0;
        } else {
            const feet = parseFloat(this.feetInput?.value) || 0;
            const inches = parseFloat(this.inchesInput?.value) || 0;
            return (feet * 12 + inches) * 2.54;
        }
    }
    
    getWeightInKg() {
        if (!this.weightInput || !this.weightUnit) return 0;
        
        const weight = parseFloat(this.weightInput.value) || 0;
        return this.weightUnit.value === 'kg' ? weight : weight * 0.453592;
    }
    
    resetBMIDisplay() {
        const bmiValue = document.getElementById('bmi-value');
        const bmiCategory = document.getElementById('bmi-category');
        const bmiDescription = document.getElementById('bmi-description');
        const indicator = document.getElementById('bmi-indicator');
        
        if (bmiValue) bmiValue.textContent = '--';
        if (bmiCategory) {
            bmiCategory.textContent = 'Enter your details';
            bmiCategory.style.color = '';
        }
        if (bmiDescription) bmiDescription.textContent = '';
        if (indicator) indicator.classList.remove('visible');
    }
    
    updateBMIDisplay(bmi) {
        const bmiValue = document.getElementById('bmi-value');
        const bmiCategory = document.getElementById('bmi-category');
        const bmiDescription = document.getElementById('bmi-description');
        
        if (!bmiValue || !bmiCategory || !bmiDescription) return;
        
        if (bmi === null || isNaN(bmi)) {
            this.resetBMIDisplay();
            return;
        }
        
        bmiValue.textContent = bmi.toFixed(1);
        
        const { category, description, color } = this.getBMICategory(bmi);
        bmiCategory.textContent = category;
        bmiCategory.style.color = color;
        bmiDescription.textContent = description;
    }
    
    getBMICategory(bmi) {
        if (bmi < 18.5) {
            return {
                category: 'Underweight',
                description: 'You may need to gain weight. Consult with a healthcare provider.',
                color: 'var(--color-teal-500)'
            };
        } else if (bmi < 25) {
            return {
                category: 'Normal Weight',
                description: 'You have a healthy weight. Keep up the good work!',
                color: 'var(--color-success)'
            };
        } else if (bmi < 30) {
            return {
                category: 'Overweight',
                description: 'You may benefit from losing weight. Consider diet and exercise.',
                color: 'var(--color-warning)'
            };
        } else {
            return {
                category: 'Obese',
                description: 'Consider consulting with a healthcare provider for weight management.',
                color: 'var(--color-error)'
            };
        }
    }
    
    updateBMIIndicator(bmi) {
        const indicator = document.getElementById('bmi-indicator');
        if (!indicator) return;
        
        let position = 0;
        
        if (bmi < 18.5) {
            position = (bmi / 18.5) * 25;
        } else if (bmi < 25) {
            position = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
        } else if (bmi < 30) {
            position = 50 + ((bmi - 25) / (30 - 25)) * 25;
        } else {
            position = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
        }
        
        indicator.style.left = `${Math.min(Math.max(position, 0), 100)}%`;
        indicator.classList.add('visible');
    }
}

// Loan Calculator Class
class LoanCalculator {
    constructor() {
        this.loanAmount = null;
        this.interestRate = null;
        this.loanTerm = null;
        this.termUnit = null;
    }
    
    init() {
        this.loanAmount = document.getElementById('loan-amount');
        this.interestRate = document.getElementById('interest-rate');
        this.loanTerm = document.getElementById('loan-term');
        this.termUnit = document.getElementById('term-unit');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        [this.loanAmount, this.interestRate, this.loanTerm].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.calculateLoan());
            }
        });
        
        if (this.termUnit) {
            this.termUnit.addEventListener('change', () => this.calculateLoan());
        }
    }
    
    calculateLoan() {
        const principal = parseFloat(this.loanAmount.value) || 0;
        const annualRate = parseFloat(this.interestRate.value) || 0;
        const term = parseFloat(this.loanTerm.value) || 0;
        
        if (principal <= 0 || annualRate < 0 || term <= 0) {
            this.updateLoanDisplay(null);
            return;
        }
        
        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = this.termUnit.value === 'years' ? term * 12 : term;
        
        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = principal / totalMonths;
        } else {
            monthlyPayment = principal * 
                (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }
        
        const totalPayment = monthlyPayment * totalMonths;
        const totalInterest = totalPayment - principal;
        
        this.updateLoanDisplay({
            monthlyPayment,
            totalInterest,
            totalPayment,
            principal
        });
    }
    
    updateLoanDisplay(results) {
        const monthlyEMI = document.getElementById('monthly-emi');
        const totalInterest = document.getElementById('total-interest');
        const totalPayment = document.getElementById('total-payment');
        const principalDisplay = document.getElementById('principal-display');
        const interestDisplay = document.getElementById('interest-display');
        
        if (!results) {
            monthlyEMI.textContent = '$0';
            totalInterest.textContent = '$0';
            totalPayment.textContent = '$0';
            principalDisplay.textContent = '$0';
            interestDisplay.textContent = '$0';
            return;
        }
        
        monthlyEMI.textContent = this.formatCurrency(results.monthlyPayment);
        totalInterest.textContent = this.formatCurrency(results.totalInterest);
        totalPayment.textContent = this.formatCurrency(results.totalPayment);
        principalDisplay.textContent = this.formatCurrency(results.principal);
        interestDisplay.textContent = this.formatCurrency(results.totalInterest);
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Age Calculator Class
class AgeCalculator {
    constructor() {
        this.birthDateInput = null;
    }
    
    init() {
        this.birthDateInput = document.getElementById('birth-date');
        if (this.birthDateInput) {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        this.birthDateInput.addEventListener('change', () => this.calculateAge());
        this.birthDateInput.addEventListener('input', () => this.calculateAge());
    }
    
    calculateAge() {
        const birthDateValue = this.birthDateInput.value;
        
        if (!birthDateValue) {
            this.updateAgeDisplay(null);
            return;
        }
        
        const birthDate = new Date(birthDateValue);
        
        if (isNaN(birthDate.getTime())) {
            this.updateAgeDisplay(null);
            return;
        }
        
        const today = new Date();
        
        if (birthDate > today) {
            this.updateAgeDisplay(null);
            return;
        }
        
        const age = this.getDetailedAge(birthDate, today);
        this.updateAgeDisplay(age);
    }
    
    getDetailedAge(birthDate, currentDate) {
        let years = currentDate.getFullYear() - birthDate.getFullYear();
        let months = currentDate.getMonth() - birthDate.getMonth();
        let days = currentDate.getDate() - birthDate.getDate();
        
        if (days < 0) {
            months--;
            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            days += lastMonth.getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        const totalDays = Math.floor((currentDate - birthDate) / (1000 * 60 * 60 * 24));
        
        // Next birthday
        let nextBirthday = new Date(currentDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday <= currentDate) {
            nextBirthday.setFullYear(currentDate.getFullYear() + 1);
        }
        const daysToNextBirthday = Math.ceil((nextBirthday - currentDate) / (1000 * 60 * 60 * 24));
        
        // Birth day of week
        const birthDayOfWeek = birthDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        return {
            years,
            months,
            days,
            totalDays,
            daysToNextBirthday,
            birthDayOfWeek,
            nextBirthday
        };
    }
    
    updateAgeDisplay(age) {
        const ageYears = document.getElementById('age-years');
        const exactAge = document.getElementById('exact-age');
        const totalDays = document.getElementById('total-days');
        const nextBirthday = document.getElementById('next-birthday');
        const birthDay = document.getElementById('birth-day');
        
        if (!age) {
            ageYears.textContent = '0';
            exactAge.textContent = 'Select your birth date';
            totalDays.textContent = '0';
            nextBirthday.textContent = '--';
            birthDay.textContent = '--';
            return;
        }
        
        ageYears.textContent = age.years;
        exactAge.textContent = `${age.years} years, ${age.months} months, ${age.days} days`;
        totalDays.textContent = age.totalDays.toLocaleString();
        nextBirthday.textContent = `${age.daysToNextBirthday} days (${age.nextBirthday.toLocaleDateString()})`;
        birthDay.textContent = age.birthDayOfWeek;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.multiModeCalculator = new MultiModeCalculator();
});