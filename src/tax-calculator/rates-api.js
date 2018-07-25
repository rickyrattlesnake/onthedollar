/** Mock Api to simulate an external callout to 3rd party service */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const taxRatesFile = fs.readFileSync(path.join(__dirname, 'rates.yml'), { encoding: 'utf8' });
const ratesSpec = yaml.safeLoad(taxRatesFile);

module.exports = {
  fetchRates,
};

/**
 *
 * @param { number } fiscalYear : e.g. 2018 refers to the tax period of July 2017- June 2018
 */
async function fetchRates(fiscalYear) {

  const defaultRatesSpec = [
    {
      bracket: [0, 18200],
      rate: 0.00,
      minTaxAmount: 0,
    },
    {
      bracket: [18201, 37000],
      rate: 0.19,
      minTaxAmount: 0,
    },
    {
      bracket: [37001, 87000],
      rate: 0.325,
      minTaxAmount: 3572,
    },
    {
      bracket: [87001, 180000],
      rate: 0.37,
      minTaxAmount: 19822,
    },
    {
      bracket: [180001, Infinity],
      rate: 0.45,
      minTaxAmount: 54232,
    },
  ];

  const ratesSpecForYear = ratesSpec.filter(spec => spec.fiscalYear === fiscalYear)[0];

  return (ratesSpecForYear == null) ? defaultRatesSpec : ratesSpecForYear;
}
