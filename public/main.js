import { zodiacSigns, parseDate, getZodiacSign, calculateAge } from "./modules/zodiac.js";
import { app, database } from './modules/firebase.js';
import { createTimeSlots, isSlotAvailable, updateCurrentTimeLine, loadLunches, deleteLunch, addLunch, adjustTime } from './modules/timeSlots.js';


// Firebase инициализирован в modules/firebase.js, database импортируется оттуда

// Делаем функции доступными для inline-обработчиков в index.html
window.addLunch = addLunch;
window.adjustTime = adjustTime;




// сокрытие элемента при скролле
const hide = document.querySelector(".element-to-hide");
const scrollDistance = 309;

window.addEventListener('scroll', () => {
    if (window.scrollY > scrollDistance) {
        hide.textContent = '';
    } else {
        hide.textContent = 'Время';
    }
})




setInterval(updateCurrentTimeLine, 60000);





// Удаляем старую линию времени и создаем новую
document.querySelectorAll('.current-time-line').forEach(el => el.remove());
const line = document.createElement('div');
line.className = 'current-time-line';
document.getElementById('calendar').appendChild(line);

// Модальное окно
const OpenModalButton = document.querySelector('#setting-btn');

OpenModalButton.addEventListener('click', () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'modalWrapper';

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    backdrop.addEventListener('click', () => {
        wrapper.remove();
    });

    const modalWindow = document.createElement('div');
    modalWindow.className = 'modalWindow';

    const buttonCross = createModalButton('buttonCross', 'x', closeModal);

    const settingsHeader = document.createElement('div');
    settingsHeader.className = "settingsHeader";

    const settingsHeaderText = document.createElement('h2');
    settingsHeaderText.textContent = 'Настройки';

    settingsHeader.appendChild(settingsHeaderText);

    const themes = document.createElement('div');
    themes.className = 'themesContainer';

    const themeText = document.createElement('h2');
    themeText.className = "themeText";
    themeText.textContent = 'Темы';

    const themeTextBlack = document.createElement('div');
    themeTextBlack.className = "theme-black";

    const themeLabel = document.createElement('span');
    themeLabel.className = "theme-label";
    themeLabel.textContent = 'Темная тема';

    const toggleContainerBlack = document.createElement('label');
    toggleContainerBlack.className = "toggle-container";

    const toggleInputTheme = document.createElement('input');
    toggleInputTheme.type = "checkbox";
    toggleInputTheme.className = "toggle-input";
    toggleInputTheme.checked = localStorage.getItem('darkTheme') === 'true';

    toggleInputTheme.addEventListener('change', function () {
        document.body.classList.toggle('dark-theme', this.checked);
        localStorage.setItem('darkTheme', this.checked);
    });

    const toggleSlider = document.createElement('span');
    toggleSlider.className = "toggle-slider";

    toggleContainerBlack.appendChild(toggleInputTheme);
    toggleContainerBlack.appendChild(toggleSlider);
    themeTextBlack.appendChild(themeLabel);
    themeTextBlack.appendChild(toggleContainerBlack);

    const sergeyTheme = document.createElement('div');
    sergeyTheme.className = 'sergeyTheme';

    const sergeyThemeText = document.createElement('h2');
    sergeyThemeText.className = 'sergeyThemeText';
    sergeyThemeText.textContent = 'Сережка';

    const toggleContainerSergey = document.createElement('label');
    toggleContainerSergey.className = 'toggle-container';

    const toggleInputSergey = document.createElement('input');
    toggleInputSergey.type = 'checkbox';
    toggleInputSergey.className = "toggle-input";
    toggleInputSergey.checked = localStorage.getItem('sergeyRainMode') === 'true';

    toggleInputSergey.addEventListener('change', function () {
        const isEnabled = this.checked;
        toggleRainVisibility(isEnabled);
        // mouseTracker(isEnabled);
        localStorage.setItem('sergeyRainMode', isEnabled);
    });

    const toggleSliderSergey = document.createElement('span');
    toggleSliderSergey.className = "toggle-slider";

    sergeyTheme.appendChild(sergeyThemeText);
    sergeyTheme.appendChild(toggleContainerSergey);

    toggleContainerSergey.appendChild(toggleInputSergey);
    toggleContainerSergey.appendChild(toggleSliderSergey);

    themes.appendChild(themeText);
    themes.appendChild(themeTextBlack);
    themes.appendChild(sergeyTheme);

    wrapper.appendChild(modalWindow);
    wrapper.appendChild(backdrop);

    modalWindow.appendChild(buttonCross);
    modalWindow.appendChild(settingsHeader);
    modalWindow.appendChild(themes);

    document.body.appendChild(wrapper);
})

function closeModal() {
    const modal = document.querySelector('.modalWrapper')
    if (!modal) {
        console.log('Модальное окно не найдено');
        return;
    }
    modal.remove();
}

function createModalButton(className, text, func) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.className = className;
    button.innerText = text;
    button.addEventListener('click', () => {
        func();
    })
    return button;
}

// ===== КОД ДЛЯ ДОЖДЯ =====
const canvas = document.getElementById('rain-container');
const ctx = canvas.getContext('2d');
let animationId = null;

// Устанавливаем размеры canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let drops = [];
const dropColour = "#5C97BF";
const dropLengths = [10, 12, 14, 16, 18, 20, 22];
const dropSkews = [-2, -1, 0, 1, 2];
const maxDrops = 50;

class Droplet {
    constructor(x, y, length, skew) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.skew = skew;
        this.speed = this.length / 1.5;
    }

    move() {
        this.y += this.speed;
        this.x += this.skew / 4;

        if (this.y > canvas.height) {
            this.y = 0 - this.length;
            this.x = Math.random() * canvas.width;
        }
        if (this.x > canvas.width || this.x < 0) {
            this.y = 0 - this.length;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.skew, this.y + this.length);
        ctx.strokeStyle = dropColour;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Создаем капли дождя
function createDrops() {
    drops = [];
    for (let i = 0; i < maxDrops; i++) {
        let instance = new Droplet(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            randVal(dropLengths),
            randVal(dropSkews)
        );
        drops.push(instance);
    }
}

function randVal(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function animateRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let drop of drops) {
        drop.move();
        drop.draw(ctx);
    }

    animationId = requestAnimationFrame(animateRain);
}

// Управление видимостью дождя
function toggleRainVisibility(visible) {
    if (visible) {
        canvas.style.display = 'block';
        resizeCanvas();
        createDrops();
        if (animationId) cancelAnimationFrame(animationId);
        animateRain();
    } else {
        canvas.style.display = 'none';
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
}

// эффект hover мышки 
// function mouseTracker(enable = true) {
//     const mouseAnimation = document.querySelector('.mouse-animation');
//     if (!mouseAnimation) return;

//     let mouseX = 0;
//     let mouseY = 0;

//     function mouseMove(x, y) {
//         mouseAnimation.style.left = `${x}px`;
//         mouseAnimation.style.top = `${y}px`;
//     }

//     function handleMouseMove(move) {
//         mouseX = move.pageX;
//         mouseY = move.pageY;
//         mouseMove(mouseX, mouseY);
//     }

//     if (enable) {
//         mouseAnimation.style.display = 'block';
//         document.addEventListener('mousemove', handleMouseMove);
//     } else {
//         mouseAnimation.style.display = 'none';
//         document.removeEventListener('mousemove', handleMouseMove);
//     }
// }


const dateInput = document.querySelector ("#birthDate")

document.getElementById("zodiacForm").addEventListener('submit', function(e){
    e.preventDefault();
    const dateValue = dateInput.value;
    console.log('Введенная дата:', dateValue);

    const result = parseDate(dateValue);
    console.log('Результат парсинга:', result);

    if(result) {
        const zodiac = getZodiacSign(result.day, result.month);
        console.log('Знак зодиака:', zodiac);

        const age = calculateAge(result.day, result.month, result.year);
        console.log('Возраст:', age);

        const zodiacSign = document.querySelector('#zodiacSign');
        zodiacSign.textContent = zodiac;

        const fullAge = document.querySelector('#age');
        fullAge.textContent = age;
        zodiacSign.style.opacity = '0';
        fullAge.style.opacity = '0';
        
        setTimeout(() => {
            zodiacSign.textContent = zodiac;
            fullAge.textContent = age;
            
            zodiacSign.style.opacity = '1';
            fullAge.style.opacity = '1';
        }, 100);
    }else{
        console.log('Парсинг не удался');
    }
    
})


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    const isRainEnabled = localStorage.getItem('sergeyRainMode') === 'true';

    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }

    // Инициализируем canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Инициализируем дождь только если он включен
    if (isRainEnabled) {
        toggleRainVisibility(true);
        // mouseTracker(true);
    } else {
        canvas.style.display = 'none';
    }

    // Инициализируем график
    createTimeSlots();
    loadLunches();
    updateCurrentTimeLine();
    setInterval(updateCurrentTimeLine, 30000);
});

// Обработчики изменения размера окна
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateCurrentTimeLine();
        resizeCanvas();
    }, 100);
});

window.addEventListener('scroll', updateCurrentTimeLine);