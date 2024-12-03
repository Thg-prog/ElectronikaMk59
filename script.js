// Переменные
let currentInput = ""; // Текущее введённое число
let previousInput = null; // Предыдущее число
let currentOperation = null; // Выбранная операция
let decimalPlaces = null; // Количество разрядов после запятой
let isSettingDecimalPlaces = false; // Флаг для режима настройки разрядности
let timer = null; // Таймер для ожидания
let startupSequence = ["Е", "СП", "С"]; // Последовательность запуска
let startupIndex = 0; // Текущий индекс для последовательности запуска

// Элементы
const indicator = document.getElementById("indicator");
const buttons = document.querySelectorAll(".btn");

// Функции
function updateDisplay(value) {
  if (decimalPlaces !== null && !isSettingDecimalPlaces) {
    value = parseFloat(value).toFixed(decimalPlaces); // Округление до нужного количества знаков после запятой
  } else {
    value = parseFloat(value);
  }
  indicator.textContent = value;
}

function handleNumberInput(number) {
  currentInput += number;
  updateDisplay(currentInput);
}

function handleOperationInput(operation) {
  if (currentInput) {
    if (previousInput !== null && currentOperation) {
      previousInput = performCalculation(previousInput, parseFloat(currentInput), currentOperation);
    } else {
      previousInput = parseFloat(currentInput);
    }
    updateDisplay(previousInput);
    currentInput = "";
  }
  currentOperation = operation;
}

function performCalculation(num1, num2, operation) {
  switch (operation) {
    case "+":
      return num1 + num2;
    case "-":
      return num1 - num2;
    case "*":
      return num1 * num2;
    case "/":
      return num2 !== 0 ? num1 / num2 : "Ошибка";
    case "%":
      return num1 % num2;
    default:
      return num2;
  }
}

function handleEqual() {
  if (previousInput !== null && currentInput && currentOperation) {
    const result = performCalculation(previousInput, parseFloat(currentInput), currentOperation);
    updateDisplay(result);
    previousInput = result;
    currentInput = "";
    currentOperation = null;
  }
}

function handleClear() {
  currentInput = "";
  previousInput = null;
  currentOperation = null;
  decimalPlaces = null;
  isSettingDecimalPlaces = false;
  updateDisplay("0");
}

function handleSetDecimalPlaces() {
  if (!isSettingDecimalPlaces) {
    isSettingDecimalPlaces = true; // Включаем режим для ввода количества знаков
    currentInput = ""; // Очищаем ввод
    updateDisplay("0");
    timer = setTimeout(() => {
      if (currentInput) {
        let decimalInput = parseInt(currentInput, 10);
        if (decimalInput >= 0 && decimalInput <= 15) {
          decimalPlaces = decimalInput;
        } else {
          updateDisplay("Ошибка! Разрядность от 1 до 15");
        }
        isSettingDecimalPlaces = false;
        currentInput = "";
        updateDisplay("0");
      }
    }, 5000);
  } else {
    let decimalInput = parseInt(currentInput, 10);
    if (decimalInput >= 1 && decimalInput <= 15) {
      decimalPlaces = decimalInput;
      isSettingDecimalPlaces = false;
      currentInput = "";
      updateDisplay("0");
      clearTimeout(timer);
    } else {
      updateDisplay("Ошибка! Разрядность от 1 до 15");
    }
  }
}

function handleSetRealPlaces() {
  decimalPlaces = null;
  isSettingDecimalPlaces = false;
  updateDisplay(previousInput);
}

function addDot() {
  if (!currentInput.includes('.')) {
    currentInput += '.';
    updateDisplay(currentInput);
  }
}

function handleStartupSequence(action) {
  if (action === startupSequence[startupIndex]) {
    startupIndex++;
    if (startupIndex === startupSequence.length) {
      // Последовательность завершена
      indicator.textContent = "0";
    }
  } else {
    // Если последовательность нарушена, сбрасываем
    startupIndex = 0;
    
  }
}

function handleUnary(){
    if(previousInput){
        currentInput = (-parseFloat(previousInput)).toString();
    }else{
        currentInput = (-parseFloat(currentInput)).toString();
    }
    updateDisplay(currentInput);
    previousInput = parseFloat(currentInput);
    currentInput = "";
    currentOperation = null;
}

function handlePercent() {
    if (previousInput !== null && currentOperation) {
        previousInput = performCalculation(previousInput, parseFloat(currentInput), currentOperation);
      }
    if (previousInput !== null && currentInput) {
      if (currentOperation === "+" || currentOperation === "-") {
        // Добавление или вычитание процента
        if(currentOperation ==="+"){
            percentValue = ((previousInput-currentInput) * parseFloat(currentInput)) / 100;
        }else{
            percentValue = ((previousInput+parseFloat(currentInput)) * parseFloat(currentInput)) / 100;
        }
        currentInput = currentOperation === "+" 
          ? ((previousInput-currentInput) + percentValue).toString()
          : ((parseFloat(previousInput)+parseFloat(currentInput)) - percentValue).toString();
        updateDisplay(currentInput);
        previousInput = parseFloat(currentInput);
        currentInput = "";
        currentOperation = null;
      } else if (currentOperation === "*" ) {
        // Процент как множитель
        currentInput = (parseFloat(previousInput) / 100).toString();
        updateDisplay(currentInput);
        previousInput = parseFloat(currentInput);
        currentInput = "";
        currentOperation = null;
      }else if(currentOperation ==="/"){
        currentInput = (parseFloat(previousInput) * 100).toString();
        updateDisplay(currentInput);
        previousInput = parseFloat(currentInput);
        currentInput = "";
        currentOperation = null;
      }
    } else if (previousInput !== null && !currentInput) {
      // Если введено только предыдущее число, считаем его процент
      currentInput = (previousInput / 100).toString();
      updateDisplay(currentInput);
      previousInput = parseFloat(currentInput);
      currentInput = "";
      currentOperation = null;
    } else if (currentInput) {
      // Процент от текущего числа
      currentInput = (parseFloat(currentInput) / 100).toString();
      updateDisplay(currentInput);
      previousInput = parseFloat(currentInput);
      currentInput = "";
      currentOperation = null;
    }
  }

// Обработчики кнопок
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const number = button.getAttribute("data-number");
    const operation = button.getAttribute("data-operation");
    const action = button.getAttribute("data-action");

    if (startupIndex < startupSequence.length) {
      handleStartupSequence(action); // Проверка последовательности запуска
      return;
    }

    if (isSettingDecimalPlaces && number) {
      handleNumberInput(number);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (currentInput) {
          let decimalInput = parseInt(currentInput, 10);
          if (decimalInput >= 0 && decimalInput <= 15) {
            decimalPlaces = decimalInput;
            isSettingDecimalPlaces = false;
            currentInput = "";
            updateDisplay("0");
          } else {
            updateDisplay("Ошибка! Разрядность от 1 до 15");
          }
        }
      }, 5000);
    } else if (number) {
      handleNumberInput(number);
    } else if (operation) {
      handleOperationInput(operation);
    } else if (action === "=") {
      handleEqual();
    } else if (action === "С") {
      handleClear();
    } else if (action === "Ф") {
      handleSetDecimalPlaces();
    } else if (action === ".") {
      addDot();
    } else if (action === "Е") {
      handleSetRealPlaces();
    }else if(action === "%"){
        handlePercent();
    } else if(action==="/-/"){
        handleUnary();
    }
  });
});
