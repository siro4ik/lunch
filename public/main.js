import { zodiacSigns, parseDate, getZodiacSign, calculateAge } from "./modules/zodiac.js";
import { app, database } from './modules/firebase.js';
import { createTimeSlots, isSlotAvailable, updateCurrentTimeLine, loadLunches, deleteLunch, addLunch, adjustTime } from './modules/timeSlots.js';
import { initModal } from './modules/modal.js';
import { toggleRainVisibility, createDrops, animateRain, initRain, resizeCanvas } from './modules/rain.js';
import {checkBIN, dataChange} from './modules/binChecker.js';

// Делаем функции доступными для inline-обработчиков в index.html
window.addLunch = addLunch;
window.adjustTime = adjustTime;
window.toggleRainVisibility = toggleRainVisibility;
window.createDrops = createDrops;
window.animateRain = animateRain;


const OpenModalButton = document.querySelector('#setting-btn');
initModal(OpenModalButton, toggleRainVisibility);

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

document.querySelector('#binForm').addEventListener('submit',function(e){
    e.preventDefault();

    const cardNumberInput = document.querySelector('#cardNumber');

    const result = checkBIN(cardNumberInput.value);

    if(result.isValid){
        dataChange(result.data);
    }else{
        alert(result.message);
    }
})


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    const isRainEnabled = localStorage.getItem('sergeyRainMode') === 'true';

    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }

    // Инициализируем canvas для дождя
    const rainCanvas = document.getElementById('rain-container');
    if (rainCanvas) {
        initRain(rainCanvas);
    }
    
    // Инициализируем canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Инициализируем дождь только если он включен
    if (isRainEnabled) {
        toggleRainVisibility(true);
        // mouseTracker(true);
    } else {
        const rainCanvas = document.getElementById('rain-container');
        if (rainCanvas) {
            rainCanvas.style.display = 'none';
        }
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