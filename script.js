const startTimePicker = document.getElementById('startTimePicker');
const endTimePicker = document.getElementById('endTimePicker');
const confirmBtn = document.getElementById('confrmBtn');

confirmBtn.addEventListener('click',()=>{
    const startTime = startTimePicker.value;
    const endTime = endTimePicker.value;

    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);

    if(endMinutes  - startMinutes > 60){
        alert ('Нельзя перегуливать!')
    }else{
        alert(`Вы выбрали: ${startTime} - ${endTime}`);
    }
});

function convertTimeToMinutes(timeStr){
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};


