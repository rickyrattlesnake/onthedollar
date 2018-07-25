const ratesApi = require('./rates-api');

module.exports = {
  calculateTax
};

/**
 *
 * @param { number } taxableIncome
 * @param { number } fiscalYear
 */
async function calculateTax(taxableIncome, fiscalYear) {
  const rates = await ratesApi.fetchRates(fiscalYear);

  const rateItem = rates.find(({ bracket }) => {
    const [bracketMin, bracketMax] = bracket;
    return (taxableIncome >= bracketMin && taxableIncome <= bracketMax)
  });

  if (rateItem == null) {
    throw new Error('Tax bracket not found!');
  }

  const { bracket: [bracketMin, _], rate, minTaxAmount } = rateItem;

  const taxableAmountInBracket = taxableIncome - (bracketMin - 1);
  return minTaxAmount + rate * taxableAmountInBracket;
}
