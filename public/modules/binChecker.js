document.querySelector('#binForm').addEventListener('submit', function(e){
    e.preventDefault();

    const cardNumber = document.querySelector('#cardNumber').value;

    const bin = cardNumber.replace(/\D/g, '').substring(0, 6);

    if (bin.length < 6){
        alert('Бин номер должен быть корректным!')
    }else{
        return bin;
    }


});