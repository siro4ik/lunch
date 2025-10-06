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