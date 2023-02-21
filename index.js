const calculateBtn = document.getElementById("calculateBtn");
const resultInput = document.getElementById("resultInput");
const paymentDateInput = document.getElementById("paymentDateInput");
const endDateInput = document.getElementById("endDateInput");
const startDateInput = document.getElementById("startDateInput");

  const config = {
    startDate: null, //С какой аты считаем, включительно. Дата в формате "ДД.ММ.ГГ", можно null
    endDate: null, //До какой даты считаем, включительно
    emptyDate: false, //Считать ли строки без даты завершения
    pageSize: 200,// Количество строк в запросе.
  }
  const statusNames = {
    'COMPLETE_WITH_INCOME':'Будет оплачено',
    'REVIEWING':'Закреплено за ревьюером',
    'LIMBO':'Период ожидания',
    'COMPLETE_WITHOUT_INCOME':'Оплата вне оферты',
  }

const dateToIputFormat = (date) => 
  `${date.getFullYear()}-${`0${date.getMonth() + 1}`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}`;

paymentDateInput.addEventListener('change', ({target}) => {
  const startDate = new Date(target.value);
  const endDate = new Date(target.value);
  
  endDate.setDate(endDate.getDate() - 16);
  
  startDate.setDate(0);
  startDate.setDate(0);
  startDate.setDate(startDate.getDate() - 14);
  
  config.startDate = dateToIputFormat(startDate);
  config.endDate = dateToIputFormat(endDate);

  endDateInput.value = config.endDate;
  startDateInput.value = config.startDate
});

calculateBtn.addEventListener("click",() => {
  const startDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);

  fetch(`https://partner.praktikum.yandex-team.ru/api/homeworks/reviews/me/?page=1&page_size=${config.pageSize}`)
    .then(response => response.json())
    .then(data => {
      const result = {
        sum: 0,
        status: {}
      } 
      const rows = data.results.filter(row => {
        let rowDate = row.review_end_time ? new Date(row.review_end_time) : null
        
        rowDate && rowDate.setHours(0,0,0,0);
        if (!config.emptyDate && !rowDate) return false
        if (startDate && (rowDate && startDate > rowDate)) return false
        if (endDate && (rowDate && endDate < rowDate) ) return false
        
        return true;
      });

      rows.forEach(row => {
        const price = Number(row.price.price);
        result.sum += price;
        if (!result.status[row.status]) {
            result.status[row.status] = {
                sum: price,
                count: 1,
            }
        } else {
            result.status[row.status].sum += price;
            result.status[row.status].count++
        }
      });

      resultInput.value = `${result.sum}руб.`;
    })
    .catch(err => console.log(err.message));
});


  // const getDate = (str) => {
  //   const dateString = `20${str[6]}${str[7]}-${str[3]}${str[4]}-${str[0]}${str[1]}`;
  //   const date = new Date(Date.parse(dateString));
  //   date.setHours(0,0,0,0);
  //   return date
  // }
  // const startDate = config.startDate && getDate(config.startDate);
  // const endDate = config.endDate && getDate(config.endDate);
  // const getData = async () => {
  //   const response = await fetch(`https://partner.praktikum.yandex-team.ru/api/homeworks/reviews/me/?page=1&page_size=${config.pageSize}`);
  //   const result = await response.json();
  //   return result;
  // }
  // const data = await getData();
  // const rows = data.results.filter(row => {
  //   let rowDate = row.review_end_time ? new Date(row.review_end_time) : null
  //   rowDate && rowDate.setHours(0,0,0,0);
  //   if (!config.emptyDate && !rowDate) return false
  //   if (startDate && (rowDate && startDate > rowDate)) return false
  //   if (endDate && (rowDate && endDate < rowDate) ) return false
  //   return true
  // });
  // rows.forEach(row => {
  //   const price = Number(row.price.price);
  //   result.sum += price;
  //   if (!result.status[row.status]) {
  //       result.status[row.status] = {
  //           sum: price,
  //           count: 1,
  //       }
  //   } else {
  //       result.status[row.status].sum += price;
  //       result.status[row.status].count++
  //   }
  // });
  // for (key in result.status) {
  //   const status = statusNames[key] || key;
    
  //   console.log(`%c${status}: ${result.status[key].sum} | ${result.status[key].count} шт.`, `color: green; font-size: 20px`);
  // }
  // console.log(`%cОбщая сумма: ${result.sum} | ${rows.length} шт.`, `color: green; font-size: 30px`);