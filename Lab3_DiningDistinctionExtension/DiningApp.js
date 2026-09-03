const Student = require('./Student');
const MealBooking = require('./MealBooking');
const DiningAccount = require('./DiningAccount');
const RewardsDiningAccount = require('./RewardsDiningAccount');
const CreditDiningAccount = require('./CreditDiningAccount');

function runPart1Demonstration() {
  console.log('========================================');
  console.log('       STANDARD DINING ACCOUNT');
  console.log('========================================');
  const stdAccount = new DiningAccount('DA001', 1000);
  console.log(`Account Number: ${stdAccount.accountNumber}`);
  console.log('Opening Balance: K1000.00');

  stdAccount.deposit(500, 'Weekly allowance');
  console.log('Deposit: K500.00');

  console.log('Meal Payment: K200.00');
  const status = stdAccount.payForMeal(200, 'Dinner payment');
  console.log(`Payment Status: ${status ? 'Successful' : 'Failed'}`);
  console.log(`Final Balance: K${stdAccount.getBalance().toFixed(2)}`);

  console.log('========================================');
  console.log('        REWARDS DINING ACCOUNT');
  console.log('========================================');
  const rewardsAccount = new RewardsDiningAccount('RA001', 1500, 2.5);
  console.log(`Account Number: ${rewardsAccount.accountNumber}`);
  rewardsAccount.deposit(500);
  console.log(`Balance Before Reward: K${rewardsAccount.getBalance().toFixed(2)}`);
  console.log(`Reward Rate: ${rewardsAccount.rewardRate}%`);

  const rewardEarned = rewardsAccount.calculateReward();
  console.log(`Reward Earned: K${rewardEarned.toFixed(2)}`);
  rewardsAccount.applyReward();
  console.log(`Final Balance: K${rewardsAccount.getBalance().toFixed(2)}`);
  console.log('========================================\n');
}

function runPart2Demonstration() {
  // Demonstration of Polymorphism
  const accounts = [
    new DiningAccount('DA001', 100),
    new RewardsDiningAccount('RA001', 100, 5),
    new CreditDiningAccount('CA001', 100, 500)
  ];

  console.log('--- Demonstrating Polymorphic Account Summaries ---');
  for (const acc of accounts) {
    acc.displayAccountSummary();
  }

  // Integrated Student & Booking Workflow
  const student = new Student('DWU2026001', 'Maria', 'Kila');
  const rewardsAcc = new RewardsDiningAccount('RA001', 100, 2.5);
  student.assignDiningAccount(rewardsAcc);

  console.log('\n========================================');
  console.log('          STUDENT DINING ACCOUNT');
  console.log('========================================');
  console.log(`Student: ${student.getFullName()}`);
  console.log(`Student ID: ${student.studentId}`);
  console.log(`Account Type: ${student.diningAccount.constructor.name}`);
  console.log(`Account Number: ${student.diningAccount.accountNumber}`);
  console.log(`Opening Balance: K${student.diningAccount.getBalance().toFixed(2)}`);

  const booking = new MealBooking(student, '2026-09-04', 'Dinner', 2);
  console.log('\n========================================');
  console.log('             MEAL BOOKING');
  console.log('========================================');
  console.log(`Meal: ${booking.mealType}`);
  console.log(`Quantity: ${booking.quantity}`);
  console.log(`Total Cost: K${booking.calculateTotal().toFixed(2)}`);

  const paymentSuccess = booking.processPayment(student.diningAccount);
  console.log(`Payment Status: ${paymentSuccess ? 'Successful' : 'Failed'}`);
  console.log(`Booking Status: ${booking.bookingStatus}`);
  console.log(`Remaining Balance: K${student.diningAccount.getBalance().toFixed(2)}`);

  // Transaction History Display
  console.log('\n========================================');
  console.log('          TRANSACTION HISTORY');
  console.log('========================================');
  const history = student.diningAccount.getTransactions();
  history.forEach((tx, idx) => {
    console.log(`${idx + 1}. ${tx.type} - K${tx.amount.toFixed(2)}`);
    console.log(`   Description: ${tx.description}`);
    console.log(`   Balance: K${tx.balanceAfter.toFixed(2)}`);
  });
  console.log(`Total Transactions: ${history.length}`);
  console.log('========================================');
}

function main() {
  runPart1Demonstration();
  runPart2Demonstration();
}

main();