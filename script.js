'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-08-16T23:36:17.929Z',
    '2022-08-19T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Data
/* the below data is for section 11 course 
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
*/

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// functions
const formatMovmentDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daypassed = calcDaysPassed(new Date(), date);

  if (daypassed === 0) return 'Today';
  if (daypassed === 1) return 'Yesterday';
  if (daypassed <= 7) return `${daypassed} days`;

  // const day = `${date.getDate()}`.padStart(2, 0); // get 2 digit format for day and month
  // const month = `${date.getMonth() + 1}`.padStart(2, 0); // month is 0 base, so + 1
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  //or
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovement = function (acc, sort = false) {
  // to empty everything in <div class="movements">
  containerMovements.innerHTML = '';

  // to sort movement display
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements; // use .slice to make a shallow copy so we don't change the original movements array when .sort is called

  // to add movement into html
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovmentDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accum, mov) => accum + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((accum, curr) => accum + curr, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((accum, curr) => accum + curr, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((accum, int) => accum + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

const updateUI = function (acc) {
  // display movements
  displayMovement(acc);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    // call the timer every second
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    // when 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'log in to get started';
      containerApp.style.opacity = 0;
    } // function tick created first and ran immediately, not inside of creating setInterval(), in order to avoid extra first 1 sec

    // decrease 1 second
    time--;
  }; // decreasing after if (time === 0) to avoid extra 1 sec counted at the end

  // set time to 5 minutes
  let time = 300;

  tick(); // call tick() first in order to avoid extra first 1 sec
  const timer = setInterval(tick, 1000);
  return timer;
};

// event handlers
let currentAccount, timer;

// // fake always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// /////////////////////////////////

btnLogin.addEventListener('click', function (e) {
  // <button> is inside of <form>, <form> does submission when we press <button>, in order to stop submitting, we use .preventDefault()
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    // create current date and time
    const now = new Date();

    // const day = `${now.getDate()}`.padStart(2, 0); // get 2 digit format for day and month
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); // month is 0 base, so + 1
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
    // or
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // or 'long' or '2-digit', present in different format
      year: 'numeric', // or '2-digit', present in different format
      weekday: 'long', // or 'short' or 'narrow', present in different format
    };
    // const locale = navigator.language;
    // choose local languages to display

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now); // we generally use automatic selection for languages instead of hard code 'en-AU'

    inputLoginUsername.value = inputLoginPin.value = ''; // clear data and cursor in the input field
    inputLoginUsername.blur(); // removing the focus (cursor)
    inputLoginPin.blur();

    // countdown the time
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
    // use optional chaining (?.) to check if the receiver exist and use !== to ensure not to transfer to the same account
  ) {
    // doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // update UI
    updateUI(currentAccount);

    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(function () {
      // add movement
      currentAccount.movements.push(amount);

      // add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // update UI
      updateUI(currentAccount);

      // reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    ); //.findIndex return the first result index of the arry

    // delete account
    accounts.splice(index, 1);

    // hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovement(currentAccount, !sorted); // passing !false (true) only, sorted has not changed
  sorted = !sorted; // changing sorted to !sorted (true)
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
let arr = ['a', 'b', 'c', 'd', 'e'];

// slice
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(-1));
console.log(arr.slice(1, -2));
// to creat a "shallow" copy of arry, .slice() or [...array]
console.log(arr.slice());
console.log(...arr);

// splice - changes the original arry, remove / extract elements from array, parameter 1 is index and parameter 2 is number of extraction, both parameters in .slice are index
// console.log(arr.splice(2));
console.log(arr.splice(-1)); // removing
console.log(arr); // extracting, left over in the arry
console.log(arr.splice(1, 2)); // removing
console.log(arr); // extracting, left over in the arry

// reverse - changes the original arry
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// concat
arr = ['a', 'b', 'c', 'd', 'e'];
const letters = arr.concat(arr2);
console.log(letters); // === console.log(...arr, ...arr2);

// join
console.log(letters.join('-'));

// at
const arr = [23, 11, 64];
console.log(arr.at(0)); // === console.log(arr[0]);
// getting the last arry element, below three ways
console.log(arr[arr.length - 1]);
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));
// at also works on strings
console.log('jonas'.at(0));
console.log('jonas'.at(-1));
*/

/*
// forEach for arry
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const [i, movement] of movements.entries) {
//   if (movement > 0) {
//     console.log(`Movement ${i + 1} You deposited ${movement}`);
//   } else {
//     console.log(`Movement ${i + 1} You withdrew ${Math.abs(movement)}`);
//   } // Math.abs() keeps number positive
// }
// we can use ".forEach(call back function)" higher order function to do the same, looping each element of the arry by using .forEach

movements.forEach(function (mov, i, arr) {
  // arry.forEach can take three parameters, current element, index and the whole array
  if (mov > 0) {
    console.log(`Movement ${i + 1} You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1} You withdrew ${Math.abs(mov)}`);
  }
});
// how it works....forEach call the function every loop
// 0: function(200)
// 1: function(450)
// 2: function(-400)
//...until .forEach loops to the last element
// break and continue do not work on .forEach loop

// forEach for map
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  // map.forEach can take three parameters, value, key and the whole map
  console.log(`${key}: ${value}`);
});

// forEach for set
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);
currenciesUnique.forEach(function (value, _, set) {
  // set.forEach can take three parameters, value, value(same as value 1) and the whole set
  console.log(_, set);
  console.log(`${value}: ${value}`);
});
*/

// coding challenge 1
/*
const checkDogs = function (dogsJulia, dogsKate) {
  const correctDogsJulia = dogsJulia.slice();
  // removing elements
  correctDogsJulia.splice(0, 1);
  correctDogsJulia.splice(-2);
  console.log(correctDogsJulia);
  // or extracting elements
  //const correctDogsJulia2 = correctDogsJulia.splice(1, 2);
  //console.log(correctDogsJulia2);

  const bothArr = correctDogsJulia.concat(dogsKate);

  bothArr.forEach(function (age, i) {
    age >= 3
      ? console.log(`Dog number ${i + 1} is an adult, and is ${age} years old`)
      : console.log(`Dog number ${i + 1} is still a puppy 🐶`);
  });
};

const juliasData1 = [3, 5, 2, 12, 7];
const katesData1 = [4, 1, 15, 8, 3];
const juliasData2 = [9, 16, 6, 8, 3];
const katesData2 = [10, 5, 6, 1, 4];

checkDogs(juliasData1, katesData1);
checkDogs(juliasData2, katesData2);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// data transformation - .map
// .map is similar to .forEach, .forEach return individual elements but .map return values in an array
const movements1 = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

const movmenetsUSD = movements1.map(function (mov) {
  return mov * eurToUsd;
});
// or with arrow function
const movementsArrow = movements1.map(mov => mov * eurToUsd);

// or the old way
const movementsUsdFor = [];
for (const mov of movements1) movementsUsdFor.push(mov * eurToUsd);

console.log(movements1);
console.log(movmenetsUSD);
console.log(movementsArrow);
console.log(movementsUsdFor);

const movementsDescriptions = movements1.map(
  (mov, i, arr) =>
    // .map() can take three parameters, value, index and the whole array
    `Movement ${i + 1} You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
console.log(movementsDescriptions);

// data transformation - .filter
// .filter is similar to .forEach, .forEach return individual elements but .filter return values in an array
const deposits = movements1.filter(function (mov, i, arr) {
  // .filter() can take three parameters, value, index and the whole array
  return mov > 0;
});

// or the old way
const depositsFor = [];
for (const mov of movements1) if (mov > 0) depositsFor.push(mov);

console.log(deposits);
console.log(depositsFor);

const withdrawals = movements1.filter(mov => mov < 0);
console.log(withdrawals);

// data transformation - .reduce
// .reduce is similar to .forEach, both return individual elements
const balance = movements1.reduce(function (accum, mov, i, arr) {
  // .reduce() can take four parameters, accumulated value, current value, index and the whole array
  console.log(`Iteration ${i}: ${accum}`);
  return accum + mov;
}, 0);
//.reduce() have two arguments 1st is "call back function" and 2nd is "the start point of the accumulated value", it's set to 0 in this case

// or with arrow function
const balanceArrow = movements1.reduce((accum, mov) => accum + mov, 0);

// or the old way
let sum = 0;
for (const mov of movements1) sum += mov;

console.log(balance);
console.log(balanceArrow);
console.log(sum);

// obtain maximum value by using .reduce
const maxValue = movements1.reduce(
  (accum, curr) => (curr > accum ? curr : accum),
  movements1[0]
);
console.log(maxValue);

// coding challenge 2
const calcAverageHumanAge = function (ages) {
  return ages
    .map(dogAge => (dogAge <= 2 ? dogAge * 2 : dogAge * 4 + 16))
    .filter(humanAge => humanAge >= 18)
    .reduce((accumAge, currAge, i, arr) => accumAge + currAge / arr.length, 0);
};

console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
const movements2 = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

// chaining method
const totalDepositsUSD = movements2
  .filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((accum, curr) => accum + curr, 0);
console.log(totalDepositsUSD);

// coding challenge 3
const calcAverageHumanAge = ages =>
  ages
    .map(dogAge => (dogAge <= 2 ? dogAge * 2 : dogAge * 4 + 16))
    .filter(humanAge => humanAge >= 18)
    .reduce((accumAge, currAge, i, arr) => accumAge + currAge / arr.length, 0);

console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
const movements3 = [200, 450, -400, 3000, -650, -130, 70, 1300];

// .find - similar to .filter, but oinstead of returning a new array like .filter, .find only return the first element of the array that fits the conditions
const firstWithdrawal = movements3.find(mov => mov < 0);
console.log(firstWithdrawal);

const account = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(account);

// using for-of loop to do the same as above
let jDaccount;
for (const accountForOf of accounts) {
  if (accountForOf.owner === 'Jessica Davis') {
    jDaccount = accountForOf;
    break;
  }
}

// .findIndex - take arrys and find the index of the element that fits set condutions

// both .find and .findIndex return booleam
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
const movements4 = [200, 450, -400, 3000, -650, -130, 70, 1300];

// .some - similar to .include, but .some take condition
// .include for equality
console.log(movements4.includes(-130));

// .some for condition
console.log(movements4.some(mov => mov === -130));

const anyDeposits = movements4.some(mov => mov > 1500);
console.log(anyDeposits);

// .every - all the elements in an arrys pass the conditions, return booleam
console.log(movements4.every(mov => mov > 0));
console.log(account4.movements.every(mov => mov > 0));

// separate callback for higher order array functions that accept functions returning booleam
const deposit = mov => mov > 0; // a function returning booleam
console.log(movements4.some(deposit));
console.log(movements4.every(deposit));
console.log(movements4.filter(deposit));
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// .flat - .flat() means default .flat(1)
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat());

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat(1)); // flat 1 layer
console.log(arrDeep.flat(2)); // flat 2 layers

const overalBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((accum, curr) => accum + curr, 0);
console.log(overalBalance);

// flatMap = .map + .flat, takes the same arguments as .map and can only flat 1 layer
const overalBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((accum, curr) => accum + curr, 0);
console.log(overalBalance2);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// .sort, it mutates the original arry
// .sort string - alphabetically
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners); // owner arry has been mutated

// .sort number - negative to positive and thensmall numbers to big numbers
const movements5 = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements5);
console.log(movements5.sort());

// .sort number - to sort numbers in an arry from small to big or vice vera
// ascending
movements5.sort((a, b) => {
  if (a > b) return 1;
  if (a < b) return -1;
});
console.log(movements5);
// or
movements5.sort((a, b) => a - b);
console.log(movements5);

// descending
movements5.sort((a, b) => {
  if (a > b) return -1;
  if (a < b) return 1;
});
console.log(movements5);
// or
movements5.sort((a, b) => b - a);
console.log(movements5);

// return < 0, a, b (keep order)
// return > 0, a, b (switch order)
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// empty arry & .fill
const x = new Array(7); // !== [7], it will creat an empty array with 7 positions and cannot use with any method apart from .fill
console.log(x);
x.fill(1, 3, 5); // 1st argument is the data we would like to fill in, 2nd and 3rd are start and end points
console.log(x);
x.fill(1); // fill up all the positions with 1
console.log(x);

const arr = [1, 2, 3, 4, 5, 6, 7];
arr.fill(23, 2, 6); // replace position 2-5 with 23
console.log(arr);

// Array.from - it is not a method use on an array, we use "Array.form"
const y = Array.from({ length: 7 }, () => 1); // 1st argument is the length of the array we are creating and 2nd is a callback function
console.log(y);

const z = Array.from({ length: 7 }, (_, i) => i + 1); // the callback function is like .map, 1st argument is current element and 2nd is index
console.log(z);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    element => Number(element.textContent.replace('€', ''))
  ); // creat an array with data from nodelist of the DOM, they are iterable so we can turn them into an array, in this case we select all .movements__value
  // 2nd argument we grab text (number) from the element and replace eur sign to none like using .map
  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')]; // it also creats an array with all .movements__value, but we wont be able to .map after it
});
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// array method practice
// 1.
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((accum, curr) => accum + curr, 0);
console.log(bankDepositSum);

// 2.
const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, curr) => (curr >= 1000 ? ++count : count), 0);
// we cannot use count++ here as the callback function "return" count value before ++ operator run, we use prefixed ++ operator
console.log(numDeposits1000);
// prefixed ++ operator
let a = 10;
console.log(a++); // log(a) before ++ run, a + 1 happens after console.log
console.log(++a); // log(11++)
console.log(a);

// 3.
const sums = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (accum, curr) => {
      curr > 0 ? (accum.deposit += curr) : (accum.withdrawal += curr);
      return accum;
    },
    { deposit: 0, withdrawal: 0 }
  );
console.log(sums);
// or
const { deposit, withdrawal } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (accum, curr) => {
      accum[curr > 0 ? 'deposit' : 'withdrawal'] += curr;
      return accum;
    },
    { deposit: 0, withdrawal: 0 }
  );
console.log(deposit, withdrawal);

// 4.
const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);
  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];
  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (!exceptions.includes(word) ? capitalize(word) : word))
    .join(' ');

  return capitalize(titleCase);
};
console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));

// coding challenge 4
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

const isRecommendedAmount = function (dog) {
  return (
    dog.curFood < dog.recommended * 1.1 && dog.curFood > dog.recommended * 0.9
  );
};

// 1.
dogs.forEach(
  dogObj => (dogObj.recommended = Math.trunc(dogObj.weight ** 0.75 * 28))
);
console.log(dogs);

// 2.
const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));

console.log(
  `the dog is eating too ${
    dogSarah.curFood < dogSarah.recommended ? 'little' : 'much'
  }`
);

// 3. and 4.
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recommended)
  .flatMap(dog => dog.owners)
  .join(' and ')
  .concat("'s dogs eat too much!");

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recommended)
  .flatMap(dog => dog.owners)
  .join(' and ')
  .concat("'s dogs eat too little!");
console.log(ownersEatTooMuch);
console.log(ownersEatTooLittle);

// 5.
console.log(dogs.some(dog => dog.curFood === dog.recommended));

// 6.
console.log(dogs.some(isRecommendedAmount));

// 7.
console.log(dogs.filter(isRecommendedAmount));

// 8.
const dogsCopy = dogs.slice().sort((a, b) => a.recommended - b.recommended);
console.log(dogsCopy);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// all numbers in JS are "floating point numbers" and in "binary base 2" whcih is coded with 0 and 1
// example 0.1 + 0.2 !== 0.3
console.log(0.1 + 0.2); // === 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

// converting string to number
console.log(Number('23'));
// or
console.log(+'23');

// parsing - must start with number and will convert string to number
// .parseInt - "integer", the 2nd parameter to choose "binary base 2" and "base 10", 2 or 10
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e23')); // not working

// .parseFloat - "floating point numbers", it shows the number after decimal
console.log(Number.parseInt('   2.5rem   '));
console.log(Number.parseFloat('   2.5rem   '));

// .isNaN - check if it is "not a number (NaN)"
console.log(Number.isNaN(20)); // is a number
console.log(Number.isNaN('20')); // is a string
console.log(Number.isNaN(+'20x')); // is NaN
console.log(Number.isNaN(23 / 0)); // is an infinity

// .isFinite - opposite to infinite, use to check if value is a number
console.log(Number.isFinite(20)); // is finite
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0));

// .isInteger - use to check if value is integer
console.log(Number.isInteger(20)); // is integer
console.log(Number.isInteger(20.0)); // is integer
console.log(Number.isInteger(20.5)); // is not integer
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// Math.sqrt - square root
console.log(Math.sqrt(25));
// or
console.log(25 ** (1 / 2));
// to calculate cubic root
console.log(8 ** (1 / 3));

// Math.max and .min - to get maximum and minimum value from numbers
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2)); // does coercion
console.log(Math.max(5, 18, '23px', 11, 2)); // does not parsing
console.log(Math.min(5, 18, 23, 11, 2));

// Math.PI - we can use to calculate the area of the circle
console.log(Math.PI);
console.log(Math.PI * Number.parseFloat('10px') ** 2); // in this case, we get radius from user interface by using .parseFloat

// Math.random - to create a random number between 0 - 1, but not includes 0 and 1
console.log(Math.random());
// to obtain a random number between two number
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

// rounding integers - they do coercion
console.log(Math.round('23.3')); // round to the closet number 23
console.log(Math.round(23.9)); // round to the closet number 24
// Math.ceil - to round up
console.log(Math.ceil('23.3'));
console.log(Math.ceil(23.9));
// Math.floor - to round down, similar to Math.trunc, but different in negative number
console.log(Math.floor('23.3'));
console.log(Math.floor(23.9));
console.log(Math.trunc('23.3'));
// in negative numbers
console.log(Math.floor('-23.3'));
console.log(Math.trunc('-23.3'));

// rounding decimals - return a "string"
console.log((2.5).toFixed(0)); // no number after decimal
console.log((2.5).toFixed(3)); // three digits after decimal
console.log((2.5656546).toFixed(2)); // only shows two digits after decimal
console.log(+(2.5656546).toFixed(2)); // use + or Number() to convert to number
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// remainder operator
console.log(5 % 2); // 5 = 2 * 2 + 1, the remainder is 1
console.log(8 % 3); // 8 = 2 * 3 + 2, the remainder is 2

// use remainder operator to check even or odd number, even number remainder is 0, an integer
const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

// other usefull situations
labelBalance.addEventListener('click', function () {
  // document.querySelectorAll('.movements__row') returns a node list which is iterable, we use separate operator to put them into an array and use .forEach to work on it
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0, 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    // 0, 3, 6, 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// numeric separater "_" - use for big numbers, it can be used to separate every three digits (thousand) or used as decimal
// it does not affect the result, just easier to read
const diameter = 287_460_000_000; // 287,460,000,000
console.log(diameter); // JS ignores _

const price = 345_99; // in cents, means 345.99, but the result is still 34599
console.log(price);

const transferFee1 = 15_00; //means 15.00, but the result is still 1500
const transferFee2 = 1_500; //means 1,500, but the result is still 1500

// cannot use it with string coverted to number
console.log(Number('230_000'));
console.log(parseInt('230_000')); // only takes the valid part 230
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// bigInt - new function in SE2020
// JS can only calculate numbers under "safe number - 9007199254740991", everything over the safe number usually is not correct
console.log(2 ** 53 - 1); // the number in JS is 64 bit, only 53 are stored the actually number, the rest are stored in other places
console.log(Number.MAX_SAFE_INTEGER);

// Unsafe number - calculation result over 9007199254740991, the results are not always correct
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(8486456561561545456156164184516515616846151); // larger than safe number
console.log(8486456561561545456156164184516515616846151n); // add "n" to present correctly
console.log(BigInt(8486456561561545456156164184516515616846151)); // BigInt() still cannot present huge numbers exactly correct, but works on smaller numbers
console.log(BigInt(8486456561561547));

// BigInt operation
console.log(5565156156151484655465464546n * 1000000000n);

//console.log(Math.sqrt(16n)); Math function does not work with BigInt

const huge = 5565156156151484655465464546n;
const num = 23;
//console.log(huge * num); error, BigInt cannot be mixed with other types
console.log(huge * BigInt(num)); // to fix it

// exception, with logic operators
console.log(20n > 15);
console.log(20n === 20); // false with strict equality operater, bigint !== number
console.log(20n == '20'); // true with loose equality operater
console.log(huge + ' is really big!!');

// division
console.log(10n / 3n); // return the closet number
console.log(10 / 3);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// internationalizing date

// creating dates
const now = new Date();
console.log(now);

// by entering date and time, JS will work out
console.log(new Date('Aug 22 2021 16:51:51'));
console.log(new Date('December 24 2015'));
console.log(new Date(account1.movementsDates[0]));

// time format - year, month, date, hour, minute, second
// only month is 0 base
console.log(new Date(2037, 10, 19, 15, 23, 5));

// if the date is incorrect, JS will forward automatically
console.log(new Date(2037, 10, 31)); // no Nov 31, it became Dec 01

// unix time
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // to calculate 3 days after unix time, 3 days * 24 hrs * 60 mins * 60 secs * 1000 milliseconds

// working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth()); // 0 base
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // generating the time format that all PC use
console.log(future.getTime()); // get time that has been passed since unix time
console.log(new Date(2142217380000)); // entering timestamps that has been pass since unix time, we will get calculated time
console.log(Date.now()); // current timestamp
future.setFullYear(2040); // to change year, there are other methods to change month, date, day...etc
console.log(future);

// calculating time
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 5, 4), new Date(2037, 5, 14));
console.log(days1);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// internationalizing number
const num = 3884763.23;
const option = {
  style: 'currency', // or 'unit' or 'percentage'...etc
  unit: 'celsius', // or mile-per-hour...etc
  currency: 'EUR', // if style set 'currency', we must define 'currency'
  useGrouping: true, // or false to turn off the number separator
};

console.log(
  'US:'.padEnd(15),
  new Intl.NumberFormat('en-US', option).format(num)
);
console.log(
  'Germany:'.padEnd(15),
  new Intl.NumberFormat('de-DE', option).format(num)
);
console.log(
  'Syria:'.padEnd(15),
  new Intl.NumberFormat('ar-SY', option).format(num)
);
console.log(
  navigator.language.padEnd(15),
  new Intl.NumberFormat(navigator.language, option).format(num)
); // "navigator.language" is to use user's browser language
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
// to set a timer
setTimeout(() => console.log('Here is your pizza'), 3000); // setTimeout() need a callback function as the 1st parameter and set when the callback function will be executed in the 2nd parameter in milliseconds
console.log('waiting...'); // setTimeout() runs first and display the result 3sec later after 'waiting...'

// how to pass parameter into setTimeout()
setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  'olive',
  'spinach'
); // set parameters in setTimeout(), pass them at the end
// or
const ingredients = ['olive', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients // use spread operator if we pass an arry as parameters
);

// to clear a timer
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setInterval - runs functions every period we set
setInterval(function () {
  const now = new Date();

  console.log(
    new Intl.DateTimeFormat(navigator.language, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(now)
  );
}, 1000);
*/
