const DiningAccount = require('./DiningAccount');

class RewardsDiningAccount extends DiningAccount {
  #rewardRate;

  constructor(accountNumber, openingBalance = 0, rewardRate = 0) {
    super(accountNumber, openingBalance);
    
    const rate = Number(rewardRate);
    if (Number.isNaN(rate) || rate < 0) {
      throw new Error('Reward rate cannot be negative.');
    }
    this.#rewardRate = rate;
  }

  get rewardRate() { return this.#rewardRate; }

  calculateReward() {
    return (this.getBalance() * this.#rewardRate) / 100;
  }

  applyReward() {
    const reward = this.calculateReward();
    if (reward > 0) {
      this.deposit(reward, `Reward Applied (${this.#rewardRate}%)`);
    }
    return reward;
  }
}

module.exports = RewardsDiningAccount;