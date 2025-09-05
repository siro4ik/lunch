const firebaseConfig = {
    apiKey: "AIzaSyAy9OEzVWlqWTGwzpcV5847sugtmvOYedU",
    authDomain: "lunch-575f4.firebaseapp.com",
    databaseURL: "https://lunch-575f4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lunch-575f4",
    storageBucket: "lunch-575f4.firebasestorage.app",
    messagingSenderId: "346613736019",
    appId: "1:346613736019:web:17493f838e994d28e65ca6",
    measurementId: "G-N5V8E7TV4D"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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



// Создание временных слотов
function createTimeSlots() {
    const table = document.getElementById('slots');
    table.innerHTML = '';

    document.querySelectorAll('.current-time-line').forEach(el => el.remove());

    const line = document.createElement('div');
    line.className = 'current-time-line';
    document.getElementById('calendar').appendChild(line);

    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            timeCell.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeCell.classList.add('time-cell');
            row.appendChild(timeCell);

            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('td');
                cell.id = `d${day}h${hour}m${minute}`;
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    }
}

function isSlotAvailable(day, start, end) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    for (let time = startTotal; time < endTotal; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const cell = document.getElementById(`d${day}h${hour}m${minute}`);

        if (cell && cell.classList.contains('lunch-time')) {
            return false;
        }
    }
    return true;
}

function updateCurrentTimeLine() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const table = document.getElementById('calendar');
    const timeSlots = document.querySelectorAll('#slots tr');

    if (timeSlots.length === 0) return;

    const tableRect = table.getBoundingClientRect();
    const firstRowRect = timeSlots[0].getBoundingClientRect();
    const lastRowRect = timeSlots[timeSlots.length - 1].getBoundingClientRect();

    const tableHeight = lastRowRect.bottom - firstRowRect.top;
    const positionPercent = currentTotalMinutes / (24 * 60);
    const positionPixels = positionPercent * tableHeight;

    const line = document.querySelector('.current-time-line');
    if (line) {
        line.style.top = `${firstRowRect.top + positionPixels - tableRect.top}px`;
        line.style.width = `${tableRect.width}px`;
    }
}

setInterval(updateCurrentTimeLine, 60000);

function adjustTime(field, minutes) {
    const input = document.getElementById(field);
    if (!input.value) {
        input.value = "12:00";
        return;
    }

    const [hoursStr, minsStr] = input.value.split(':');
    let hours = parseInt(hoursStr) || 0;
    let mins = parseInt(minsStr) || 0;

    let totalMinutes = hours * 60 + mins + minutes;
    totalMinutes = (totalMinutes + 1440) % 1440;

    hours = Math.floor(totalMinutes / 60);
    mins = totalMinutes % 60;

    input.value =
        hours.toString().padStart(2, '0') + ':' +
        mins.toString().padStart(2, '0');
}

function loadLunches() {
    database.ref('lunches').on('value', (snapshot) => {
        const lunches = snapshot.val();
        if (!lunches) return;

        document.querySelectorAll('.lunch-time').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('lunch-time');
            cell.onclick = null;
        });

        Object.entries(lunches).forEach(([id, lunch]) => {
            const [startHour, startMinute] = lunch.start.split(':').map(Number);
            const [endHour, endMinute] = lunch.end.split(':').map(Number);
            const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
            const slotCount = Math.ceil(duration / 30);

            for (let i = 0; i < slotCount; i++) {
                const slotTime = (startHour * 60 + startMinute) + (i * 30);
                const hour = Math.floor(slotTime / 60);
                const minute = slotTime % 60;
                const cell = document.getElementById(`d${lunch.day}h${hour}m${minute}`);

                if (cell) {
                    cell.dataset.lunchId = id;
                    cell.classList.add('lunch-time');

                    const container = document.createElement('div');
                    container.className = 'lunch-container';

                    const timeText = document.createElement('span');
                    timeText.textContent = `${lunch.user}: ${lunch.start}-${lunch.end}`;

                    const deleteBtn = document.createElement('button');
                    if (lunch.user.includes('z') || lunch.user.includes('Z')) {
                        deleteBtn.textContent = 'z'
                        cell.style.backgroundColor = "#ff0080ff"
                        timeText.style.color = "#ffffffde"
                    } else {
                        deleteBtn.textContent = 'x'
                    }
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        deleteLunch(id, lunch.day, hour, minute);
                    };

                    container.appendChild(timeText);
                    container.appendChild(deleteBtn);
                    cell.appendChild(container);
                    cell.classList.add('lunch-time');
                    cell.dataset.lunchId = id;
                }
            }
        });
    });
}

function deleteLunch(id, day, hour, minute) {
    if (confirm('Удалить эту запись?')) {
        database.ref(`lunches/${id}`).remove()
            .then(() => {
                const cell = document.getElementById(`d${day}h${hour}m${minute}`);
                if (cell) {
                    cell.innerHTML = '';
                    cell.classList.remove('lunch-time');
                }
            })
            .catch(error => {
                alert('Ошибка при удалении: ' + error.message);
            });
    }
}

function addLunch() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const userName = document.getElementById('userName').value || 'Аноним';
    const day = (new Date().getDay() + 6) % 7;

    if (!isSlotAvailable(day, start, end)) {
        alert('Это время уже занято! Выберите другое время.');
        return;
    }

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (startTotal >= endTotal) {
        alert('Конец обеда должен быть позже начала!');
        return;
    }

    const duration = endTotal - startTotal;
    const slotCount = Math.ceil(duration / 30);

    for (let i = 0; i < slotCount; i++) {
        const slotTime = startTotal + (i * 30);
        const hour = Math.floor(slotTime / 60);
        const minute = slotTime % 60;
        const cell = document.getElementById(`d${day}h${hour}m${minute}`);

        if (cell) {
            cell.textContent = `${userName}: ${start}-${end}`;
            cell.classList.add('lunch-time');
        }
    }

    database.ref('lunches').push({
        user: userName,
        start: start,
        end: end,
        day: day,
        timestamp: Date.now()
    });
}

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

// ОПРЕДЕЛЕНИЕ ЗЗ/ВОЗРАСТА

const zodiacSigns = [
    { name: "Овен", start: { month: 3, day: 21 }, end: { month: 4, day: 20 } },
    { name: "Телец", start: { month: 4, day: 21 }, end: { month: 5, day: 20 } },
    { name: "Близнецы", start: { month: 5, day: 21 }, end: { month: 6, day: 21 } },
    { name: "Рак", start: { month: 6, day: 22 }, end: { month: 7, day: 22 } },
    { name: "Лев", start: { month: 7, day: 23 }, end: { month: 8, day: 23 } },
    { name: "Дева", start: { month: 8, day: 24 }, end: { month: 9, day: 23 } },
    { name: "Весы", start: { month: 9, day: 24 }, end: { month: 10, day: 23 } },
    { name: "Скорпион", start: { month: 10, day: 24 }, end: { month: 11, day: 22 } },
    { name: "Стрелец", start: { month: 11, day: 23 }, end: { month: 12, day: 21 } },
    { name: "Козерог", start: { month: 12, day: 22 }, end: { month: 1, day: 20 } },
    { name: "Водолей", start: { month: 1, day: 21 }, end: { month: 2, day: 20 } },
    { name: "Рыбы", start: { month: 2, day: 21 }, end: { month: 3, day: 20 } }
];

// Парсинг строки, удаление ненужных символов, проверка на число и на корректность ввода, относительно промежутка чисел

function parseDate (dateString){

    const clearing = dateString.replace (/[^\d.]/g, '');

    const parts = clearing.split('.');

    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Это должно быть число!';

    if (day < 1 || day > 31){
        alert('День должен быть корректным!');
        return;
    }else if(month < 1 || month > 12){
        alert('Месяц должен быть корректным!');
        return;
    }else if(year < 1900 || year > new Date().getFullYear()){
        alert('Год должен быть корректным!');
        return;
    }else{
        return {day, month, year}
    }
}

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
    checkLunchTime();
    setInterval(checkLunchTime, 60000);
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