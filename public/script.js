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

function createTimeSlots() {
    const table = document.getElementById('slots');
    table.innerHTML = '';


    document.querySelectorAll('.current-time-line').forEach(el => el.remove());


    const line = document.createElement('div');
    line.className = 'current-time-line';
    document.getElementById('calendar').appendChild(line);

    for(let hour = 0; hour < 24; hour++) {
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
        // line.style.left = `${tableRect.left}px`;
        line.style.width = `${tableRect.width}px`;
    }
}



setInterval(updateCurrentTimeLine, 60000);
updateCurrentTimeLine();

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
                    deleteBtn.innerHTML = '×';
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

const oldLine = document.querySelector('.current-time-line');
if (oldLine) oldLine.remove();


const line = document.createElement('div');
line.className = 'current-time-line';
document.getElementById('calendar').appendChild(line);


window.onload = function() {
    createTimeSlots();
    loadLunches();
    updateCurrentTimeLine();
    setInterval(updateCurrentTimeLine, 30000);
};


let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCurrentTimeLine, 100);
});

window.addEventListener('scroll', updateCurrentTimeLine);
