const VATCOMPLY_API_URL = "https://api.vatcomply.com/";
let cachedRates = null;

const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const fromAmount = document.getElementById("from-amount");
const toAmount = document.getElementById("to-amount");
const fromCountryBox = document.getElementById("from-country-info");
const toCountryBox = document.getElementById("to-country-info");

const euroCountries = [
  {
    name: "Germany",
    emoji: "🇩🇪",
    capital: "Berlin",
    currency: "EUR",
    iso3: "DEU",
  },
  {
    name: "France",
    emoji: "🇫🇷",
    capital: "Paris",
    currency: "EUR",
    iso3: "FRA",
  },
  {
    name: "Spain",
    emoji: "🇪🇸",
    capital: "Madrid",
    currency: "EUR",
    iso3: "ESP",
  },
  { name: "Italy", emoji: "🇮🇹", capital: "Rome", currency: "EUR", iso3: "ITA" },
  {
    name: "Belgium",
    emoji: "🇧🇪",
    capital: "Brussels",
    currency: "EUR",
    iso3: "BEL",
  },
];

const preferredCountry = {
  NOK: "NOR",
  USD: "USA",
  GBP: "GBP",
  CAD: "CAN",
  AUD: "AUS",
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function getCurrencies() {
  const cached = localStorage.getItem("currencies");
  if (cached) return JSON.parse(cached);

  const data = await fetchJSON(`${VATCOMPLY_API_URL}currencies`);
  localStorage.setItem("currencies", JSON.stringify(data));
  return data;
}

async function getCountries() {
  const cached = localStorage.getItem("countries");
  if (cached) return JSON.parse(cached);

  const data = await fetchJSON(`${VATCOMPLY_API_URL}countries`);
  localStorage.setItem("countries", JSON.stringify(data));
  return Object.values(data);
}

async function getRates() {
  if (cachedRates) return cachedRates;

  const data = await fetchJSON(`${VATCOMPLY_API_URL}rates`);
  cachedRates = data.rates;
  return cachedRates;
}

async function populateDropdowns() {
  const [currencies, rates] = await Promise.all([getCurrencies(), getRates()]);

  const availableCurrencies = Object.keys(currencies).filter(
    (code) => rates[code]
  );

  availableCurrencies.forEach((code) => {
    const option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = `${currencies[code].name} ${code}`;
    fromSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = `${currencies[code].name} ${code}`;
    toSelect.appendChild(option2);
  });

  fromSelect.value = "USD";
  toSelect.value = "EUR";

  updateDropdownDisable();
  updateCountryInfo("from");
  updateCountryInfo("to");
  convertLeftToRight();
}

async function getCountryInfo(currency) {
  const countries = await getCountries();

  if (currency === "EUR") return euroCountries; // assumes euroCountries exists

  const preferredISO = preferredCountry[currency];
  if (preferredISO) {
    const match = countries.find(
      (c) => c.currency === currency && c.iso3 === preferredISO
    );
    if (match) return [match];
  }

  return countries.filter((c) => c.currency === currency);
}

async function updateCountryInfo(side) {
  const select = side === "from" ? fromSelect : toSelect;
  const box = side === "from" ? fromCountryBox : toCountryBox;
  const currency = select.value;

  const matchedCountries = await getCountryInfo(currency);

  if (matchedCountries.length) {
    box.innerHTML = matchedCountries
      .map(
        (c) =>
          `<div class="country-flag">${c.emoji}</div>
           <strong>${c.name}</strong><br/>
           Capital: ${c.capital}<br/>
           Currency: ${c.currency}<br/>`
      )
      .join("<hr>");
  } else {
    box.innerHTML = "No country info available";
  }
}

async function convertLeftToRight() {
  const rates = await getRates();
  const amount = parseFloat(fromAmount.value) || 0;
  const fromRate = rates[fromSelect.value];
  const toRate = rates[toSelect.value];
  toAmount.value = ((amount * toRate) / fromRate).toFixed(2);
}

async function convertRightToLeft() {
  const rates = await getRates();
  const amount = parseFloat(toAmount.value) || 0;
  const fromRate = rates[fromSelect.value];
  const toRate = rates[toSelect.value];
  fromAmount.value = ((amount * fromRate) / toRate).toFixed(2);
}

function updateDropdownDisable() {
  const fromVal = fromSelect.value;
  const toVal = toSelect.value;

  Array.from(fromSelect.options).forEach(
    (opt) => (opt.disabled = opt.value === toVal)
  );
  Array.from(toSelect.options).forEach(
    (opt) => (opt.disabled = opt.value === fromVal)
  );
}

fromSelect.addEventListener("change", () => {
  updateDropdownDisable();
  updateCountryInfo("from");
  convertLeftToRight();
});

toSelect.addEventListener("change", () => {
  updateDropdownDisable();
  updateCountryInfo("to");
  convertLeftToRight();
});

fromAmount.addEventListener("input", convertLeftToRight);
toAmount.addEventListener("input", convertRightToLeft);

populateDropdowns();
