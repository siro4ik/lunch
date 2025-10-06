import { binData } from "./modules/binDatabase.js";


function checkBIN(bin){
  let cleanBIN = bin.replace(/\D/g, '');

  if (cleanBIN === ""){
    return {isValid: false, message: 'Введите корректный БИН!'}
  }

  if (cleanBIN > 6){
    cleanBIN = cleanBIN.slice(0, 6);
  }

  const binData = binDatabase[cleanBIN];
  if(!binData){
    return{isValid: false, message: 'БИН не найден в базе!'}
  }

  return{isValid: true, data: binData};
}