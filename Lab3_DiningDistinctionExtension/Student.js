const DiningAccount = require('./DiningAccount');

class Student {
  #studentId;
  #firstName;
  #lastName;
  #diningAccount;

  constructor(studentId, firstName, lastName) {
    this.studentId = studentId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.#diningAccount = null;
  }

  get studentId() { return this.#studentId; }
  set studentId(value) {
    const clean = String(value ?? '').trim();
    if (!clean) throw new Error('Student ID cannot be empty.');
    this.#studentId = clean;
  }

  get firstName() { return this.#firstName; }
  set firstName(value) {
    const clean = String(value ?? '').trim();
    if (!clean) throw new Error('First name cannot be empty.');
    this.#firstName = clean;
  }

  get lastName() { return this.#lastName; }
  set lastName(value) {
    const clean = String(value ?? '').trim();
    if (!clean) throw new Error('Last name cannot be empty.');
    this.#lastName = clean;
  }

  get diningAccount() { return this.#diningAccount; }

  assignDiningAccount(account) {
    if (!(account instanceof DiningAccount)) {
      throw new Error('Must assign a valid DiningAccount or descendant instance.');
    }
    this.#diningAccount = account;
  }

  getFullName() { return `${this.#firstName} ${this.#lastName}`; }

  displayInfo() {
    return `========================================\n             STUDENT DETAILS\n========================================\nStudent ID: ${this.#studentId}\nStudent Name: ${this.getFullName()}\n========================================`;
  }
}

module.exports = Student;
