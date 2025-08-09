
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

// появление/скрытие кота (черного и серого)
// const blackCatDisappear = document.querySelector("#cat");
// const greyCatDisappear = document.querySelector("#cat2");



// function disappearCat(){

//     if (!blackCatDisappear || !greyCatDisappear) {
//   console.error("Один из элементов не найден!");
//   return;
//     }

//     if (document.body.classList.contains("dark-theme")){
//         blackCatDisappear.style.opacity = '0';
//         greyCatDisappear.style.opacity = '1';
//     }else{
//         blackCatDisappear.style.opacity = '1';
//         greyCatDisappear.style.opacity = '0';
//     }

//     colorToggle.addEventListener("change", ()=>{
//     toggle();
//     disappearCat();
// });

  
// };

// сокрытие элемента при скролле
const hide = document.querySelector (".element-to-hide");
const scrollDistance = 309;


window.addEventListener('scroll',()=>{
    if ( window.scrollY > scrollDistance){
        hide.textContent = '';
    }else{
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
                    if(lunch.user.includes('z') || lunch.user.includes('Z')){
						deleteBtn.textContent = 'z'
							}else{
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

const oldLine = document.querySelector('.current-time-line');
if (oldLine) oldLine.remove();


const line = document.createElement('div');
line.className = 'current-time-line';
document.getElementById('calendar').appendChild(line);


// Уведомления - доделать

// function checkLunchTime() {
//     const now = new Date();
//     const currentHour = now.getHours();
//     const currentMinute = now.getMinutes();

//     console.log('Текущее время:', currentHour, ':', currentMinute);
    
//     database.ref('lunches').once('value').then((snapshot) => {
//         const lunches = snapshot.val();
//         if (!lunches) return;

//         Object.values(lunches).forEach(lunch => {
//             const [startHour, startMinute] = lunch.start.split(':').map(Number);

//             if (currentHour === startHour && currentMinute === startMinute - 5) {
//                 alert(`Скоро обед у ${lunch.user}! Начало в ${lunch.start}`);
//             }
//         });
//     });
// }

// Модальное окно, изменение цвета кнопки - сделать

const OpenModalButton = document.querySelector('#setting-btn');

OpenModalButton.addEventListener('click', ()=>{

  const wrapper = document.createElement('div');
  wrapper.className = 'modalWrapper';


  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.addEventListener('click', () =>{
    wrapper.remove();
  });



  const modalWindow = document.createElement('div');
  modalWindow.className = 'modalWindow';



  const buttonCross = createModalButton ('buttonCross', 'x', closeModal);

  const settingsHeader = document.createElement('div');
  settingsHeader.className = "settingsHeader";
  
  const settingsHeaderText = document.createElement('h2');
  settingsHeaderText.textContent = 'Настройки';

  settingsHeader.appendChild(settingsHeaderText);

  const themes = document.createElement ('div');
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

  toggleInputTheme.addEventListener('change', function() {
    document.body.classList.toggle('dark-theme', this.checked);
    localStorage.setItem('darkTheme', this.checked);
  });

 
const toggleSlider = document.createElement('span');
toggleSlider.className = "toggle-slider";




toggleContainerBlack.appendChild(toggleInputTheme);
toggleContainerBlack.appendChild(toggleSlider);
themeTextBlack.appendChild(themeLabel);
themeTextBlack.appendChild(toggleContainerBlack);


toggleInputTheme.addEventListener('change', function() {
  document.body.classList.toggle('dark-theme', this.checked);
  localStorage.setItem('darkTheme', this.checked);
});

const sergeyTheme = document.createElement('div');
sergeyTheme.className = 'sergeyTheme';

const sergeyThemeText = document.createElement('h2');
sergeyThemeText.className = 'sergeyThemeText';
sergeyThemeText.textContent = 'Сережка';

const toggleContainerSergey = document.createElement('label');
toggleContainerSergey.className = 'toggle-container';

const toggleInputSergey = document.createElement ('input');
toggleInputSergey.type = 'checkbox';
toggleInputSergey.className = "toggle-input";
toggleInputSergey.checked = localStorage.getItem('sergeyRainMode') ==='true';

toggleInputSergey.addEventListener('change', function() {
    const rainContainer = document.getElementById('rain-container');
    rainContainer.style.display = this.checked ? 'block' : 'none';
    localStorage.setItem('sergeyRainMode', this.checked);
});

const toggleSliderSergey = document.createElement('span');
toggleSliderSergey.className = "toggle-slider";

sergeyTheme.appendChild(sergeyThemeText);
sergeyTheme.appendChild(toggleContainerSergey);

toggleContainerSergey.appendChild(toggleInputSergey);
toggleContainerSergey.appendChild(toggleSliderSergey);




  themes.appendChild(themeText);
  themes.appendChild(themeTextBlack);
  sergeyTheme.appendChild(sergeyThemeText);
  themes.appendChild(sergeyTheme);

  wrapper.appendChild(modalWindow);
  wrapper.appendChild(backdrop);

  modalWindow.appendChild(buttonCross);
  modalWindow.appendChild(settingsHeader);
  modalWindow.appendChild(themes);
  
  document.body.appendChild(wrapper);
  

})



function closeModal(){
  const modal = document.querySelector('.modalWrapper')

  if (!modal){
    console.log('Модальное окно не найдено');
    return;
  }

  modal.remove();
}

function createModalButton(className, text, func){
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.className = className;
  button.innerText = text;
  button.addEventListener('click', () => {
    func();
  })

  return button;


}

// Дождь для Sergey mode

document.addEventListener('DOMContentLoaded', () => {
  const rainContainer = document.getElementById('rain-container');
  const rainDropsCount = 200;

  for (let i = 0; i < rainDropsCount; i++) {
    createRainDrop();
  }

  function createRainDrop() {
    const raindrop = document.createElement('div');
    raindrop.classList.add('raindrop');

    const posX = Math.random() * window.innerWidth;
    const delay = Math.random() * 2;
    const duration = 0.5 + Math.random() * 1;

    raindrop.style.left = `${posX}px`;
    raindrop.style.top = `${-20 - Math.random() * 20}px`; 
    raindrop.style.animationDelay = `${delay}s`;
    raindrop.style.animationDuration = `${duration}s`;

    rainContainer.appendChild(raindrop);

    setTimeout(() => {
      raindrop.remove();
      createRainDrop();
    }, duration * 1000);
  }

  window.addEventListener('resize', () => {
    rainContainer.style.height = `${document.body.scrollHeight}px`;
  });
});

// Сделать эффекты hover мышки 

document.addEventListener('DOMContentLoaded', () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  const isRainEnabled = localStorage.getItem('sergeyRainMode') === 'true';

  const rainContainer = document.getElementById('rain-container');
  rainContainer.style.display = isRainEnabled ? 'block' : 'none'; 

  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
  }
  
  createTimeSlots();
  loadLunches();
  updateCurrentTimeLine();
  setInterval(updateCurrentTimeLine, 30000);
});



// window.onload = function() {
    // createTimeSlots();
    // loadLunches();
    // updateCurrentTimeLine();
    // disappearCat();

    // checkLunchTime();
    // setInterval(checkLunchTime, 60000);
// };


let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCurrentTimeLine, 100);
});

window.addEventListener('scroll', updateCurrentTimeLine);




