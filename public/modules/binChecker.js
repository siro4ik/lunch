document.querySelector('#binForm').addEventListener('submit',async function(e){
    e.preventDefault();

    const data = await lookup(bin);
    console.log(data);
    const cardNumber = document.querySelector('#cardNumber').value;


    const bin = cardNumber.replace(/\D/g, '').substring(0, 6);

 

    if (bin.length < 6){
        alert('Бин номер должен быть корректным!')
    }else{
       try{
        const response = await fetch(`https://lookup.binlist.net/${bin}`);
        const data = await response.json();
        console.log(data);

        const binIin = document.querySelector('#bin-iin');
        const cardMark = document.querySelector('#card-mark');
        const bankName = document.querySelector('#bank-name');

        binIin.textContent = bin;
        cardMark.textContent = data.brand || 'Неизвестно';
        bankName.textContent = data.bank?.name || 'Неизвестно';
       }catch(error){
        alert('Ошибка при проверке БИН')
       }
    }
});