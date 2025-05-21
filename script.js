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


window.onload = createTimeSlots;

function createTimeSlots() {
    const table = document.getElementById('slots');
    table.innerHTML = '';

    for(let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const row = document.createElement('tr');


            const timeCell = document.createElement('td');
            timeCell.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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

function addLunch() {
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    const start = startInput.value;
    const end = endInput.value;


    const today = new Date().getDay();


    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);


    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if(startTotal >= endTotal) {
        alert('Конец обеда должен быть позже начала!');
        return;
    }

    for(let time = startTotal; time < endTotal; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const cell = document.getElementById(`d${today}h${hour}m${minute}`);

        if (cell) {
            const userName = document.getElementById('userName').value || 'Аноним';
            cell.classList.add('lunch-time');
            cell.textContent = `${userName}: ${start}-${end}`;
        }
    }
}