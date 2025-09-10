export const zodiacSigns = [
    { name: "Овен", start: { month: 3, day: 21 }, end: { month: 4, day: 20 } },
    { name: "Телец", start: { month: 4, day: 21 }, end: { month: 5, day: 20 } },
    { name: "Близнецы", start: { month: 5, day: 21 }, end: { month: 6, day: 21 } },
    { name: "Рак", start: { month: 6, day: 22 }, end: { month: 7, day: 22 } },
    { name: "Лев", start: { month: 7, day: 23 }, end: { month: 8, day: 23 } },
    { name: "Дева", start: { month: 8, day: 24 }, end: { month: 9, day: 23 } },
    { name: "Весы", start: { month: 9, day: 24 }, end: { month: 10, day: 23 } },
    { name: "Скорпион", start: { month: 10, day: 24 }, end: { month: 11, day: 22 } },
    { name: "Стрелец", start: { month: 11, day: 23 }, end: { month: 12, day: 21 } },
    { name: "Козерог", start: { month: 12, day: 22 }, end: { month: 1, day: 20 } },
    { name: "Водолей", start: { month: 1, day: 21 }, end: { month: 2, day: 20 } },
    { name: "Рыбы", start: { month: 2, day: 21 }, end: { month: 3, day: 20 } }
];


// Парсинг строки, удаление ненужных символов, проверка на число и на корректность ввода, относительно промежутка чисел

export function parseDate (dateString){

    const clearing = dateString.replace(/[^\d.]/g, '');

    const parts = clearing.split('.');

    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Это должно быть число!';
    if (day < 1 || day > 31){
        alert('День должен быть корректным!');
        return;
    }else if(month < 1 || month > 12){
        alert('Месяц должен быть корректным!');
        return;
    }else if(year < 1900 || year > new Date().getFullYear()){
        alert('Год должен быть корректным!');
        return;
    }else{
        return {day, month, year}
    }
}

// ФУНКЦИЯ ЗЗ

export function getZodiacSign(day, month){

    

    const checkDate = new Date(2000, month - 1, day);
    console.log('Check date:', checkDate);

    if(month === 1){
        
        const nextYearDate = new Date(2001, month - 1, day);
        const capricornStart = new Date(2000, 11, 22);
        const capricornEnd = new Date (2001, 0, 20); 

        if(nextYearDate >= capricornStart && nextYearDate <= capricornEnd){
            return "Козерог"
        }
    }

    for (const sign of zodiacSigns){
        const startDate = new Date(2000, sign.start.month - 1, sign.start.day);
        const endDate = new Date (2000, sign.end.month - 1, sign.end.day);
        console.log(sign.name, 'start:', startDate, 'end:', endDate); 

        if( sign.start.month > sign.end.month){
            endDate.setFullYear(2001);
            console.log('Fixed end date for Capricorn:', endDate);
        }

        if( checkDate >= startDate && checkDate <= endDate){
            return sign.name;
        }
        
    }
    return 'Не удалось определить!'
}

// РАСЧЕТ ВОЗРАСТА
export function calculateAge (day, month, year){
    
    const birthDate = new Date (year, month - 1 , day);

    const today = new Date();

    const age = today.getFullYear() - birthDate.getFullYear();

    const currentMonth = today.getMonth();
    const birthMonth = birthDate.getMonth();

    if(currentMonth < birthMonth || (currentMonth === birthMonth && today.getDate() < day)){
        return age - 1;
    }
    return age;
}