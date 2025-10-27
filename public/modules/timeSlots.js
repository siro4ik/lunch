import { database } from './firebase.js';


// Создание временных слотов
export function createTimeSlots() {
    const table = document.getElementById('slots');
    table.innerHTML = '';

    document.querySelectorAll('.current-time-line').forEach(el => el.remove());

    const line = document.createElement('div');
    line.className = 'current-time-line';
    document.getElementById('calendar').appendChild(line);

    for (let hour = 8; hour < 24; hour++) {
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

export function isSlotAvailable(day, start, end) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

     if (startTotal < 8 * 60 || endTotal > 24 * 60) {
        return false;
    }

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

export function updateCurrentTimeLine() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

     if (currentTotalMinutes < 8 * 60) {
        const line = document.querySelector('.current-time-line');
        if (line) line.style.display = 'none';
        return;
    }

    const table = document.getElementById('calendar');
    const timeSlots = document.querySelectorAll('#slots tr');

    if (timeSlots.length === 0) return;

    const tableRect = table.getBoundingClientRect();
    const firstRowRect = timeSlots[0].getBoundingClientRect();
    const lastRowRect = timeSlots[timeSlots.length - 1].getBoundingClientRect();

    const tableHeight = lastRowRect.bottom - firstRowRect.top;

    const workingDayMinutes = 16 * 60;
    const positionPercent = (currentTotalMinutes - 8 * 60) / workingDayMinutes;
    const positionPixels = positionPercent * tableHeight;

    const line = document.querySelector('.current-time-line');
    if (line) {
        line.style.top = `${firstRowRect.top + positionPixels - tableRect.top}px`;
        line.style.width = `${tableRect.width}px`;
    }
}

export function adjustTime(field, minutes) {
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

    if(totalMinutes < 8 * 60){
        totalMinutes = 8 * 60;
    }else if( totalMinutes > 24 * 60){
        totalMinutes = 24 * 60;
    }

    hours = Math.floor(totalMinutes / 60);
    mins = totalMinutes % 60;

    input.value =
        hours.toString().padStart(2, '0') + ':' +
        mins.toString().padStart(2, '0');
}



// сделать стилизацию для уведомления
// сделать уведомление относительно нынешнего времени, если таймлайн будет отбирать уведомления на основе прошлых или будущщих дней, то это будет ошибкой
// как вариант, если не получится сделать относительно всех таймлайнов - автоматическое удаление слотов времени у !времени сегодняшнего после 00 00


function createNotification(user, startTime, minutesUntil){

    const notification = new Notification("Скоро перерыв",{
        body: `${user} уходит на перерыв через ${minutesUntil} минут в ${startTime}`,
        tag: 'notificationl-lunch',
        // icon: 
        requireInteraction: true
    })


}

export function loadLunches() {
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

export function deleteLunch(id, day, hour, minute) {
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

export function addLunch() {
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

    if (startTotal < 8 * 60 || endTotal > 24 * 60){
        alert("Обед должен быть в пределах с 8:00 до 24:00!");
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