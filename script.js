// Переменные
let timer = null; // Таймер для ожидания
let startupSequence = ["ke", "ksp", "kclear"]; // Последовательность запуска
let startupIndex = 0; // Текущий индекс для последовательности запуска
let memoryRegister = 0; // Регистр памяти

let INPUT = '';
let REAL = 0;
let DECIMALS = 0;
let EXPRESSION = [];
let SAVEXPRESSION = [];

let NEED_ERASE = true;

let ISDOT = false;

// -1 - DISABLED, 0 - NORMAL, 1 - DECIMAL, 2 - OVERFLOW
let MODE = -1;

let ISDECIMAL = false;

// Элементы
const indicator = document.getElementById("indicator");
const buttons = document.querySelectorAll(".btn");

const nums = [
    document.getElementById('k7'),
    document.getElementById('k8'),
    document.getElementById('k9'),
    document.getElementById('k4'),
    document.getElementById('k5'),
    document.getElementById('k6'),
    document.getElementById('k1'),
    document.getElementById('k2'),
    document.getElementById('k3'),
    document.getElementById('k0'),
    document.getElementById('k00'),
    document.getElementById('kdot'),
];

const operators = [
    document.getElementById('kplus'),
    document.getElementById('kminus'),
    document.getElementById('kdiv'),
    document.getElementById('kmul'),
]

const functionals = {
    kequal: (value) => {
        if (value !== "") {
            EXPRESSION.push(value);
        }

        if (EXPRESSION.length == 1) {
            SAVEXPRESSION.unshift(value);
            EXPRESSION = SAVEXPRESSION;
        }

        const result = expressionProcess(EXPRESSION);
        displayInput(result);
        displayOutput(result);

        if (EXPRESSION.length >= 2 ) {
            SAVEXPRESSION = [EXPRESSION[EXPRESSION.length-2], EXPRESSION[EXPRESSION.length-1]];
        }

        console.log(EXPRESSION);
        EXPRESSION = [];
        displayPrepare();
    },
    kclear: () => {
        displayInput("0");
        displayOutput("0");

        EXPRESSION = [];

        displayPrepare();

    },
    kf: () => {
        ISDECIMAL = true;
    },

    mminus: (value) => {
        if (value) {
            memoryRegister -= parseFloat(value);
            displayPrepare();
        }
    },

    mplus: (value) => {
        if (value) {
            memoryRegister += parseFloat(value);
            displayPrepare();
        }
    },

    ke: (value) => {
        MODE = 0;
        console.log(INPUT, REAL, indicator.textContent);
        displayInput(value);
        displayOutput(value);
        console.log(INPUT, REAL, indicator.textContent);
    },

    tminus: (value) => {
        value = parseFloat(-value);
        displayInput(value);
    },

    ip: (value) => {
        displayInput(memoryRegister);
    },

    ksp: (value) => {
        displayInput(memoryRegister);
        memoryRegister = 0;
    },

    kproc: (value) => {
        if (EXPRESSION.length == 2) {
            if (EXPRESSION[EXPRESSION.length - 1] == '/') {
                displayInput(EXPRESSION[EXPRESSION.length - 2] / value * 100);
            } else if (EXPRESSION[EXPRESSION.length - 1] == '*') {
                displayInput(EXPRESSION[EXPRESSION.length - 2] * value / 100);
            } else if (EXPRESSION[EXPRESSION.length - 1] == '+') {
                displayInput(parseFloat(EXPRESSION[EXPRESSION.length - 2]) + parseFloat(EXPRESSION[EXPRESSION.length - 2] / 100 * value));
            } else if (EXPRESSION[EXPRESSION.length - 1] == '-') {
                displayInput(parseFloat(EXPRESSION[EXPRESSION.length - 2]) - parseFloat(EXPRESSION[EXPRESSION.length - 2] / 100 * value));
            }
            EXPRESSION = [];
        } else if (EXPRESSION.length > 2) {
            EXPRESSION = expressionSimplify(EXPRESSION);
            functionals.kproc(value);
        }
    },

    kswap: (value) => {
        if (EXPRESSION.length > 2) {
            EXPRESSION = [expressionProcess(EXPRESSION), EXPRESSION[EXPRESSION.length-1]];
        }

        if (EXPRESSION.length == 2) {
            let tmp = value;
            displayInput(EXPRESSION[EXPRESSION.length-2]);
            displayOutput(EXPRESSION[EXPRESSION.length-2]);
            EXPRESSION[EXPRESSION.length-2] = tmp;
        } else if (EXPRESSION.length == 0) {
            if (SAVEXPRESSION.length > 1) {
                EXPRESSION.unshift(SAVEXPRESSION[1])
                EXPRESSION.push(SAVEXPRESSION[0])
            } else {
                EXPRESSION.unshift(0);
            }
            functionals.kswap();
        } else if (EXPRESSION.length == 1) {
            let tmp = value;
            displayInput(EXPRESSION[0])
            displayOutput(EXPRESSION[0]);
            EXPRESSION[0] = tmp;
        }

        NEED_ERASE = true;
    },

    summator: (value) => {
        //let ex = [EXPRESSION[EXPRESSION.length - 2], EXPRESSION[EXPRESSION.length - 1]];
        

        //EXPRESSION.push(value);

        //if (EXPRESSION.length == 1) {
            //EXPRESSION.push(SAVEXPRESSION[0]);
            //EXPRESSION.push(SAVEXPRESSION[1]);
        //}

        //const result = expressionProcess(EXPRESSION);
        //displayInput(result);
        //displayOutput(result);

        //if (EXPRESSION.length >= 2 ) {
            //SAVEXPRESSION = [EXPRESSION[EXPRESSION.length-2], EXPRESSION[EXPRESSION.length-1]];
        //}

        //EXPRESSION = [];

        //EXPRESSION.push(result);
        //EXPRESSION.push("+");
        //EXPRESSION.push(memoryRegister);
        //memoryRegister = expressionProcess(EXPRESSION);

        //EXPRESSION = [];

        //displayInput(memoryRegister);
        //displayOutput(memoryRegister);
        
        functionals.kequal(value);
        console.log(REAL);
        functionals.mplus(REAL);
        console.log(REAL);
        //displayInput(memoryRegister);

        NEED_ERASE = true;
    }
}

function handleStartupSequence(action) {
  if (action === startupSequence[startupIndex]) {
    startupIndex++;
        if (startupIndex === startupSequence.length) {
            displayInput("0");
            displayOutput("0");

            EXPRESSION = [];

            displayPrepare();
            MODE = 0;
        }
    } else {
        startupIndex = 0;
    }
}

buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        if (MODE == -1 && startupIndex < startupSequence.length) {
            handleStartupSequence(button.id); // Проверка последовательности запуска
            return;
        }

        if (MODE == 2) {
            if (button.id == "kclear") {
                MODE = 0;
                displayClear();
            }

            return;
        }

        if (nums.includes(button)) {
            if (ISDECIMAL) {
                MODE = 1;
                DECIMALS = Number(button.value);
                ISDECIMAL = false;

                displayOutput();
                //NEED_ERASE = true;
                return;
            }

            if (NEED_ERASE) {
                displayClear();
            }

            let str = INPUT;
            let num = parseFloat(str);


            if (button.id == "kdot") {
                ISDOT = true;
                if (str == "") {
                    str = "0";
                } else if (str.includes('.')) {
                    return;
                }
            }

            if (num.toString().replace('.', '').replace('-', '').length >= 8) {
                return;
            }

            if ((button.id == "k0" || button.id == "k00") && str == 0 && !ISDOT) {
                displayInput('0');
                NEED_ERASE = true;
                return;
            }

            str += button.value;
            
            displayInput(str);
            return;
        }

        if (operators.includes(button)) {
            if (INPUT !== "") {
                EXPRESSION.push(INPUT);
            }
            EXPRESSION.push(button.value);
            displayPrepare();
        }

        if (button.id in functionals) {
            functionals[button.id](REAL);
        }
    });
});

function displayInput(str) {
    if (str !== "") {
        REAL = parseFloat(str);
    }
    console.log("REAL", REAL);


    INPUT = str;

    displayProcess();
}

function displayOutput() {
    if (isNaN(INPUT)) {
        indicator.textContent = ". . . . . . . .";
        return;
    }

    if (INPUT == ".") {
        INPUT = "0.";
    }

    if (MODE == 1) {
        INPUT = parseFloat(REAL).toFixed(DECIMALS).toString();
        displayProcess();
    }

    if (REAL % 1 == 0) {
        console.log("FLOAT", REAL);
    }

}

function displayClear(erase) {
    INPUT = "";
    REAL = 0;
    displayProcess();
    NEED_ERASE = false;
    ISDOT = false;
}

function displayPrepare() {
    NEED_ERASE = true;
}

function displayOverflow() {
    MODE = 2;
}

function displayProcess() {
    indicator.textContent = INPUT;
}

function expressionProcess(expression) {
    if (expression.length === 0) return 0;

    let result = Array.isArray(expression[0])
    ? calculateExpression(expression[0])
    : Number(expression[0]);

    for (let i = 1; i < expression.length; i += 2) {
       const operator = expression[i];
         let nextNumber = Array.isArray(expression[i + 1])
         ? calculateExpression(expression[i + 1])
         : Number(expression[i + 1]);

    if (!isNaN(nextNumber)) {
        switch (operator) {
            case '+':
                result += nextNumber;
                break;
            case '-':
                result -= nextNumber;
                break;
            case '*':
                result *= nextNumber;
                break;
            case '/':
                result /= nextNumber;
                break;
            }
        }
    }

  return result;
}

function expressionSimplify(expression) {
    let i = 0;
    if (expression.length <= 3) {
        return
    }
    
    for (let i = 1; i < expression.length; i += 2) {
        const operator = expression[i];

        if (operator === '+' || operator === '-') {
          const prevNumber = Number(expression[i - 1]);
          const nextNumber = Number(expression[i + 1]);

          let result;
          if (operator === '+') {
            result = prevNumber + nextNumber;
          } else if (operator === '-') {
            result = prevNumber - nextNumber;
          } else if (operator === '*') {
            result = prevNumber * nextNumber;
          } else if (operator === '/') {
            result = prevNumber / nextNumber;
          }

          expression.splice(i - 1, 3, result);
        }
    }

    return expression;
}
