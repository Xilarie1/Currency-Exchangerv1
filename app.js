// // https://api.vatcomply.com/

const VATCOMPLY_API_URL = "https://api.vatcomply.com/";

async function currencyData() {
  try {
    const currencyResponse = await fetch(`
      ${VATCOMPLY_API_URL}currencies`);
    const currency = await currencyResponse.json();
    console.log("Currencies", currency);

    const ratesResponse = await fetch(`${VATCOMPLY_API_URL}rates`);
    const ratesData = await ratesResponse.json();
    const rates = ratesData.rates;
    console.log("Rates", rates);

    const countryResponse = await fetch(`${VATCOMPLY_API_URL}countries`);
    const countryData = await countryResponse.json();
    console.log("country", countryData);

    return { currency, rates, countryData };
  } catch (error) {
    console.error("Error fetching currency data", error);
  }
}
currencyData();
