document.querySelector('#binForm').addEventListener('submit', function(e){
    e.preventDefault();

    const cardNumber = document.querySelector('#cardNumber');

    const bin = cardNumber.replace(/\D/g, '').substring(0, 6);
});