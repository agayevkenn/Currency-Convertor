let leftCurrency = "RUB";
let rightCurrency = "USD";
let leftInput = document.querySelector(".left-convertor input");
let rightInput = document.querySelector(".right-convertor input");

document.querySelector(".burger-icon").addEventListener("click", () => {
  document.querySelector("header").classList.toggle("active");
});

document.querySelectorAll(".currency-button").forEach((item, index) => {
  let buttons = item.querySelectorAll("button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      if (index == 0) leftCurrency = button.textContent;
      else rightCurrency = button.textContent;

      currencyConverter(true);
    });
  });
});

let commaTimer;

[leftInput, rightInput].forEach((input, index) => {
  input.addEventListener("input", () => {
    clearTimeout(commaTimer);
    let value = input.value;

    if (value.includes(",")) {
      commaTimer = setTimeout(() => {
        value = value.replace(/,/g, ".");
        input.value = value;

        processInputValue();
      }, 500);
    } else {
      processInputValue();
    }

    function processInputValue() {
      value = input.value.replace(/[^0-9.]/g, "");
      let firstDot = value.indexOf(".");

      if (firstDot !== -1) {
        let beforeDot = value.slice(0, firstDot + 1);
        let afterDot = value.slice(firstDot + 1).replace(/\./g, "");

        afterDot = afterDot.slice(0, 5);

        value = beforeDot + afterDot;

        if ((value.match(/\./g) || []).length > 1) {
          value = value.slice(0, -1);
        }
      }

      if (!value.startsWith("0.") && value.startsWith("0")) {
        value = value.replace(/^0+(?=\d)/, "");
      }

      input.value = value;
      currencyConverter(index == 0);
    }
  });
});

async function currencyConverter(fromLeft = true) {
  let fromInput, toInput;
  let from, to;

  if (fromLeft) {
    fromInput = leftInput;
    toInput = rightInput;

    from = leftCurrency;
    to = rightCurrency;
  } else {
    fromInput = rightInput;
    toInput = leftInput;

    from = rightCurrency;
    to = leftCurrency;
  }

  let amount = Number(fromInput.value);

  let access_key = "cdeb12ce3901a324866d134a60b2e435";

  if (!fromInput.value || isNaN(amount) || amount == 0) {
    fetch(
      `https://api.currencylayer.com/live?access_key=${access_key}&source=${from}&currencies=${to}`
    )
      .then((res) => res.json())
      .then((data) => {
        let rateKey = `${from}${to}`;
        let rate = data.quotes[rateKey];

        if (data.success && rate) {
          let spans = document.querySelectorAll(".currency-input span");
          spans[0].textContent = `1 ${leftCurrency} = ${rate.toFixed(
            4
          )} ${rightCurrency}`;
          spans[1].textContent = `1 ${rightCurrency} = ${(1 / rate).toFixed(
            4
          )} ${leftCurrency}`;
        }
      })
      .catch((error) => {
        console.error("Rate fetch error:", error);
      });

    toInput.value = "";
    return;
  }

  if (from == to) {
    toInput.value = fromInput.value;

    let spans = document.querySelectorAll(".currency-input span");
    spans[0].textContent = `1 ${leftCurrency} = 1 ${rightCurrency}`;
    spans[1].textContent = `1 ${rightCurrency} = 1 ${leftCurrency}`;

    return;
  }

  if (!isOnline) {
    toInput.value = "";
    return;
  }

  fetch(
    `https://api.currencylayer.com/live?access_key=${access_key}&source=${from}&currencies=${to}`
  )
    .then((res) => res.json())
    .then((data) => {
      let rateKey = `${from}${to}`;
      let rate = data.quotes[rateKey];

      if (data.success && rate) {
        let result = (amount * rate).toFixed(5);
        toInput.value = result;

        let spans = document.querySelectorAll(".currency-input span");

        if (fromLeft) {
          spans[0].textContent = `1 ${leftCurrency} = ${rate.toFixed(
            4
          )} ${rightCurrency}`;
          spans[1].textContent = `1 ${rightCurrency} = ${(1 / rate).toFixed(
            4
          )} ${leftCurrency}`;
        } else {
          spans[1].textContent = `1 ${rightCurrency} = ${rate.toFixed(
            4
          )} ${leftCurrency}`;
          spans[0].textContent = `1 ${leftCurrency} = ${(1 / rate).toFixed(
            4
          )} ${rightCurrency}`;
        }
      } else {
        console.error("API error:", data.error);
        toInput.value = "";
      }
    })
    .catch((error) => {
      console.error("Conversion error:", error);
      toInput.value = "";
    });
}

let isOnline = navigator.onLine;
let connection = document.querySelector(".connection");

window.addEventListener("online", () => {
  isOnline = true;
  connection.style.display = "none";
  currencyConverter(true);
});

window.addEventListener("offline", () => {
  isOnline = false;
  connection.style.display = "block";
});

currencyConverter(true);
