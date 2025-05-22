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

function loadLunches() {
    database.ref('lunches').on('value', (snapshot) => {
        const lunches = snapshot.val();
        if (!lunches) return;


        document.querySelectorAll('.lunch-time').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('lunch-time');
        });


        Object.values(lunches).forEach(lunch => {
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
                    cell.textContent = `${lunch.user}: ${lunch.start}-${lunch.end}`;
                    cell.classList.add('lunch-time');
                }
            }
        });
    });
}

function addLunch() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const userName = document.getElementById('userName').value || 'Аноним';
    const day = new Date().getDay();


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


window.onload = function() {
    createTimeSlots();
    loadLunches();
};