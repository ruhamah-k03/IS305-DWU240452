class Student {
  #studentId;
  #firstName;
  #lastName;

  constructor(studentId, firstName, lastName) {
    this.studentId = studentId;
    this.firstName = firstName;
    this.lastName = lastName;
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

  getFullName() { return `${this.#firstName} ${this.#lastName}`; }

  displayInfo() {
    return `========================================\n             STUDENT DETAILS\n========================================\nStudent ID: ${this.#studentId}\nStudent Name: ${this.getFullName()}\n========================================`;
  }
}

module.exports = Student;
