import { zodiacSigns, parseDate, getZodiacSign, calculateAge } from "./modules/zodiac.js";
import { app, database } from './modules/firebase.js';
import { createTimeSlots, isSlotAvailable, updateCurrentTimeLine, loadLunches, deleteLunch, addLunch, adjustTime, showBrowserNotification, createNotification, scheduleLunchNotifications } from './modules/timeSlots.js';
// import { initModal } from './modules/modal.js';
import { toggleRainVisibility, createDrops, animateRain, initRain, resizeCanvas } from './modules/rain.js';
import { dataChange, checkBIN} from './modules/binChecker.js';
import {checkBIK, dataChangeBIK} from './modules/bikChecker.js';
// import {MCCcodes} from './modules/MCC.js';

// Инициализация header слайдера
const headerSwiper = new Swiper(".header-swiper", {
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    loop: false,
    speed: 300,
    pagination: {
        el: ".header-pagination",
        clickable: true,
    },
});



// Делаем функции доступными для inline-обработчиков в index.html
window.addLunch = addLunch;
window.adjustTime = adjustTime;
window.toggleRainVisibility = toggleRainVisibility;
window.createDrops = createDrops;
window.animateRain = animateRain;
window.headerSwiper = headerSwiper;
window.showBrowserNotification = showBrowserNotification;
window.createNotification = createNotification;
window.scheduleLunchNotifications = scheduleLunchNotifications;

// Инициализация темы
document.documentElement.dataset.theme = 'dark';

const AUDIO = {
    CLICK: new Audio('https://assets.codepen.io/605876/click.mp3'),
};


// Элементы DOM
const FORM = document.querySelector('.theme-toggle');
const TOGGLE = FORM.querySelector('button');
const CORDS = document.querySelectorAll('.toggle-scene__cord');
const HIT = document.querySelector('.grab-handle');
const DUMMY = document.querySelector('.toggle-scene__dummy-cord');
const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
const PROXY = document.createElement('div');

// Начальные позиции
const ENDX = DUMMY_CORD.getAttribute('x2');
const ENDY = DUMMY_CORD.getAttribute('y2');

// Сброс позиции
const RESET = () => {
    gsap.set(PROXY, {
        x: ENDX,
        y: ENDY,
    });
};

RESET();

// Переключение темы
const toggleTheme = () => {
    AUDIO.CLICK.play();
    const isLightTheme = TOGGLE.matches('[aria-pressed=false]');
    TOGGLE.setAttribute('aria-pressed', isLightTheme);
    document.documentElement.dataset.theme = isLightTheme ? 'light' : 'dark';
};

// Обработчик отправки формы
FORM.addEventListener('submit', (event) => {
    event.preventDefault();
    toggleTheme();
});

// Анимация шнура
const CORD_TL = gsap.timeline({
    paused: true,
    onStart: () => {
        toggleTheme();
        gsap.set([DUMMY, HIT], { display: 'none' });
        gsap.set(CORDS[0], { display: 'block' });
    },
    onComplete: () => {
        gsap.set([DUMMY, HIT], { display: 'block' });
        gsap.set(CORDS[0], { display: 'none' });
        RESET();
    },
});

// Добавление анимации для каждого шнура
for (let i = 1; i < CORDS.length; i++) {
    CORD_TL.add(
        gsap.to(CORDS[0], {
            morphSVG: CORDS[i],
            duration: 0.1,
            repeat: 1,
            yoyo: true,
        })
    );
}

// Перетаскивание
let startX, startY;

Draggable.create(PROXY, {
    trigger: HIT,
    type: 'x,y',
    onPress: (e) => {
        startX = e.x;
        startY = e.y;
    },
    onDragStart: () => {
        document.documentElement.style.cursor = 'grabbing';
    },
    onDrag: function () {
        // Масштабирование координат
        const ratio = 1 / ((FORM.offsetWidth * 0.65) / 134);
        gsap.set(DUMMY_CORD, {
            attr: {
                x2: this.startX + (this.x - this.startX) * ratio,
                y2: this.startY + (this.y - this.startY) * ratio,
            },
        });
    },
    onRelease: (e) => {
        const DISTX = Math.abs(e.x - startX);
        const DISTY = Math.abs(e.y - startY);
        const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
        document.documentElement.style.cursor = 'unset';
        
        gsap.to(DUMMY_CORD, {
            attr: { x2: ENDX, y2: ENDY },
            duration: 0.1,
            onComplete: () => {
                if (TRAVELLED > 50) {
                    CORD_TL.restart();
                } else {
                    RESET();
                }
            },
        });
    },
});


// const OpenModalButton = document.querySelector('#setting-btn');
// initModal(OpenModalButton, toggleRainVisibility);

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
        zodiacSign.style.opacity = '0';
        fullAge.style.opacity = '0';
        
        setTimeout(() => {
            zodiacSign.textContent = zodiac;
            fullAge.textContent = age;
            
            zodiacSign.style.opacity = '1';
            fullAge.style.opacity = '1';
        }, 200);
    }else{
        console.log('Парсинг не удался');
    }
    
})


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    const isRainEnabled = localStorage.getItem('sergeyRainMode') === 'true';

    // if (isDarkTheme) {
    //     document.body.classList.add('dark-theme');
    // }

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

    document.querySelector('#BIKform').addEventListener('submit', function(e){
        e.preventDefault();

        const BIKnumberInput = document.querySelector('#BIKnum');

        const BIKresult = checkBIK(BIKnumberInput.value);

        if(BIKresult.isValid){
            dataChangeBIK(BIKresult.data);
        }else{
            alert(BIKresult.message);
        }
    })

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

    
    console.log("функции уведомлений работают",{
        showBrowserNotification: typeof window.showBrowserNotification,
        createNotification: typeof window.createNotification
    });
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