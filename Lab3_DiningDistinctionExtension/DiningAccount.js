class DiningAccount {
  #accountNumber;
  #balance;
  #transactions;

  constructor(accountNumber, openingBalance = 0) {
    const cleanAccount = String(accountNumber ?? '').trim();
    if (!cleanAccount) throw new Error('Account number cannot be empty.');
    
    const initialBalance = Number(openingBalance);
    if (Number.isNaN(initialBalance) || initialBalance < 0) {
      throw new Error('Opening balance cannot be negative.');
    }

    this.#accountNumber = cleanAccount;
    this.#balance = initialBalance;
    this.#transactions = [];

    if (initialBalance > 0) {
      this.#recordTransaction('Deposit', initialBalance, 'Opening balance');
    }
  }

  get accountNumber() { return this.#accountNumber; }

  #recordTransaction(type, amount, description) {
    this.#transactions.push({
      type,
      amount,
      description,
      dateTime: new Date().toLocaleString(),
      balanceAfter: this.#balance
    });
  }

  deposit(amount, description = 'Deposit') {
    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Deposit amount must be greater than zero.');
    }
    this.#balance += numAmount;
    this.#recordTransaction('Deposit', numAmount, description);
  }

  payForMeal(amount, description = 'Meal Payment') {
    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (this.#balance < numAmount) {
      console.log(`Payment rejected: Insufficient funds. Available: K${this.#balance.toFixed(2)}, Required: K${numAmount.toFixed(2)}`);
      return false;
    }

    this.#balance -= numAmount;
    this.#recordTransaction('Meal Payment', numAmount, description);
    console.log('Payment successful');
    return true;
  }

  getBalance() { return this.#balance; }

  getTransactions() {
    return [...this.#transactions];
  }

  displayAccountSummary() {
    console.log(`Account Number: ${this.#accountNumber} | Type: ${this.constructor.name} | Balance: K${this.#balance.toFixed(2)}`);
  }
}

module.exports = DiningAccount;