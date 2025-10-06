import { binData } from "./binDatabase.js";

// Валидация значения БИНов
export function checkBIN(bin){
  let cleanBIN = bin.replace(/\D/g, '');

  if (cleanBIN === ""){
    return {isValid: false, message: 'Введите корректный БИН!'}
  }

  if (cleanBIN.length > 6){
    cleanBIN = cleanBIN.slice(0, 6);
  }

  if(cleanBIN.length < 6){
    return{isValid: false, message:'Введите корректный БИН!'}
  }

  const binData = binDatabase[cleanBIN];
  if(!binData){
    return{isValid: false, message: 'БИН не найден в базе!'}
  }

  return{isValid: true, data: binData};
}


function dataChange (data) {
  let binBrand = document.querySelector('#bin-brand');
  let cardType = document.querySelector('#card-type');
  let bankCountry = document.querySelector('#bank-country');
  let bankName = document.querySelector('#bank-name');

  binBrand.textContent = data.brand;
  cardType.textContent = data.type;
  bankCountry.textContent = data.country;
  bankName.textContent = data.bank;

}