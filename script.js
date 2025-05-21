const startTimePicker = document.getElementById('startTimePicker');
const endTimePicker = document.getElementById('endTimePicker');
const confirmBtn = document.getElementById('confrmBtn');

confirmBtn.addEventListener('click',()=>{
    const startTime = startTimePicker.value;
    const endTime = endTimePicker.value;
    alert(`Вы выбрали: ${startTime} - ${endTime}`);
});