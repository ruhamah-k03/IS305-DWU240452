const DiningAccount = require('./DiningAccount');

class CreditDiningAccount extends DiningAccount {
  #creditLimit;

  constructor(accountNumber, openingBalance = 0, creditLimit = 0) {
    super(accountNumber, openingBalance);

    const limit = Number(creditLimit);
    if (Number.isNaN(limit) || limit < 0) {
      throw new Error('Credit limit cannot be negative.');
    }
    this.#creditLimit = limit;
  }

  get creditLimit() { return this.#creditLimit; }

  payForMeal(amount, description = 'Meal Payment') {
    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const availableCredit = this.getBalance() + this.#creditLimit;
    if (numAmount > availableCredit) {
      console.log(`Payment rejected: Credit limit exceeded. Available credit: K${availableCredit.toFixed(2)}, Required: K${numAmount.toFixed(2)}`);
      return false;
    }

    // Directly access base deposit/balance operations safely
    this.deposit(-numAmount, description);
    console.log('Payment successful (Credit Used)');
    return true;
  }
}

module.exports = CreditDiningAccount;