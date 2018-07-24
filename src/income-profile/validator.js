module.exports = {
  validate,
};

function validate({
      profileName,
      superannuationPercentage,
      incomeAmount,
      incomeIncludesSuper,
      taxRatesYear
    }) {

  if (!isValidProfileName(profileName)) {
    return {
      valid: false,
      message: 'invalid profile name'
    };
  }

  if (!isValidSuperannuationPercentage(superannuationPercentage)) {
    return {
      valid: false,
      message: 'invalid superannuation percentage'
    }
  }


  if (!isValidIncomeAmount(incomeAmount)) {
    return {
      valid: false,
      message: 'invalid income amount'
    }
  }
  if (!isValidIncomeIncludesSuper(incomeIncludesSuper)) {
    return {
      valid: false,
      message: 'invalid incomeIncludesSuper'
    }
  }
  if (!isValidTaxRatesYear(taxRatesYear)) {
    return {
      valid: false,
      message: 'invalid tax rates year'
    }
  }

  return {
    valid: true
  };
}

function isValidProfileName(profileName) {
  return typeof profileName === 'string' && profileName !== '';
}

function isValidSuperannuationPercentage(superPct) {
  return typeof superPct === 'number' &&
    superPct >= 9.5 &&
    superPct < 100;
}

function isValidIncomeAmount(incomeAmt) {
  return typeof incomeAmt === 'number' && incomeAmt > 0;
}

function isValidIncomeIncludesSuper(incomeIncSuper) {
  return typeof incomeIncSuper === 'boolean';
}

function isValidTaxRatesYear(year) {
  return typeof year === 'number';
}
