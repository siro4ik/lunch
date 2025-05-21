window.onload = function() {
    createTimeSlots();
};


function createTimeSlots(){
    const table = document.getElementById('slots');

    for(let hour = 0; hour<24; hour++){
        for ( let minute = 0; minute < 60; minute+=30){
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            timeCell.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            row.appendChild(timeCell)

            for (let day = 0; day<7; day++){
                const cell = document.createElement('td');
                cell.id = `d${day}h${hour}m${minute}`;
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    }
}

function addLunch (){
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');

    const start = startInput.value;
    const end = endInput.value;

    const today = new Date().getDay();

    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);

    if(start >= end){
        alert('Ты че делаешь?');
        return;
    }

    const cell = document.getElementById(`d${today}h${startHour}`);
    const userName = document.getElementById('userName').value;

    if (cell) {
        cell.classList.add('lunch-time');
        cell.textContent = `${userName}: ${start}-${end}`;
    }
}


