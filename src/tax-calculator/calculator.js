const ratesApi = require('./rates-api');

module.exports = {
  calculateTax,
  processIncome,
};

/**
 *
 * @param { number } taxableIncome
 * @param { num ber } fiscalYear
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

  const { bracket: [bracketMin, ], rate, minTaxAmount } = rateItem;

  const taxableAmountInBracket = taxableIncome - (bracketMin - 1);
  return minTaxAmount + rate * taxableAmountInBracket;
}



/**
 * @param { { income: number, includesSuper: boolean, superPercentage: number, fiscalYear: number }} *
 * @return { { grossIncome: number, superAmount: number, taxableIncome: number }}
 */
async function processIncome({ income, includesSuper, superPercentage, fiscalYear }) {
  let grossIncome;
  let superAmount;

  if (includesSuper) {
    grossIncome = income / (1 + (superPercentage / 100));
    superAmount = grossIncome * (superPercentage / 100);
  } else {
    grossIncome = income;
    superAmount = income * (superPercentage / 100);
  }

  let taxableIncome = grossIncome;
  let taxAmount = await calculateTax(taxableIncome, fiscalYear);
  let netIncome = grossIncome - taxAmount;

  return {
    grossIncome,
    taxableIncome,
    netIncome,
    taxAmount,
    superAmount,
  };
}
