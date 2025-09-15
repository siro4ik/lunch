

// Создание временных слотов
export function createTimeSlots() {
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

export function isSlotAvailable(day, start, end) {
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