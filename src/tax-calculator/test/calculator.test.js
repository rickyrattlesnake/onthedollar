const { expect } = require('chai');
const sinon = require('sinon');
const ratesApi = require('../rates-api');

const { calculateTax, processIncome } = require('../calculator');

describe('calculator', () => {

  let taxRates;
  let sandbox = sinon.createSandbox();

  beforeEach(() => {
    taxRates = [
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

    sandbox.stub(ratesApi, 'fetchRates').resolves(taxRates);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly calculate tax for minimum bracket', async () => {
    const taxAmount = await calculateTax(13200, 2018);
    expect(taxAmount).to.equal(0);
  });

  it('should correctly calculate tax for maximum bracket', async () => {
    const taxAmount = await calculateTax(234001, 2018);
    expect(taxAmount).to.equal(78532.45);
  });

  it('should correctly calculate tax for a middle bracket', async () => {
    const taxAmount = await calculateTax(43022.43, 2018);
    expect(taxAmount).to.equal(5529.28975);
  });

  it('should correctly calculate tax for bracket edges', async () => {
    let taxAmount = await calculateTax(87000, 2018);
    expect(taxAmount).to.equal(19822);

    taxAmount = await calculateTax(87001, 2018);
    expect(taxAmount).to.equal(19822.37);
  });

  it('should process income with super included, low income bracket', async () => {
    let processedIncome = await processIncome({
      income: 12000,
      includesSuper: true,
      superPercentage: 9.5,
      fiscalYear: 2018
    });

    expect(processedIncome.grossIncome).to.equal(10958.90410958904);
    expect(processedIncome.taxableIncome).to.equal(10958.90410958904);
    expect(processedIncome.taxAmount).to.equal(0);
    expect(processedIncome.superAmount).to.equal(1041.0958904109589);
    expect(processedIncome.netIncome).to.equal(10958.90410958904);
  });

  it('should process income without super included, high income bracket', async () => {
    let processedIncome = await processIncome({
      income: 192500,
      includesSuper: false,
      superPercentage: 11.5,
      fiscalYear: 2018
    });

    expect(processedIncome.grossIncome).to.equal(192500);
    expect(processedIncome.taxableIncome).to.equal(192500);
    expect(processedIncome.taxAmount).to.equal(59857);
    expect(processedIncome.superAmount).to.equal(22137.5);
    expect(processedIncome.netIncome).to.equal(132643);
  });
});
