const Student = require('./Student');

const MEAL_PRICES = { Breakfast: 10, Lunch: 15, Dinner: 20 };

class MealBooking {
  #student;
  #mealDate;
  #mealType;
  #quantity;
  #dietaryNote;
  #bookingStatus;

  constructor(student, mealDate, mealType, quantity, dietaryNote = 'None') {
    if (!(student instanceof Student)) throw new Error('A valid Student object is required.');
    this.#student = student;
    this.mealDate = mealDate;
    this.mealType = mealType;
    this.quantity = quantity;
    this.dietaryNote = dietaryNote;
    this.#bookingStatus = 'Pending';
  }

  get student() { return this.#student; }
  get mealDate() { return this.#mealDate; }
  set mealDate(value) {
    const clean = String(value ?? '').trim();
    if (!clean) throw new Error('Meal date is required.');
    this.#mealDate = clean;
  }
  get mealType() { return this.#mealType; }
  set mealType(value) {
    const clean = String(value ?? '').trim().toLowerCase();
    const types = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
    if (!types[clean]) throw new Error('Invalid meal type. Must be Breakfast, Lunch, or Dinner.');
    this.#mealType = types[clean];
  }
  get quantity() { return this.#quantity; }
  set quantity(value) {
    const number = Number.parseInt(value, 10);
    if (Number.isNaN(number) || number < 1) throw new Error('Quantity must be a number greater than or equal to 1.');
    this.#quantity = number;
  }
  get dietaryNote() { return this.#dietaryNote; }
  set dietaryNote(value) { this.#dietaryNote = String(value ?? '').trim() || 'None'; }
  get bookingStatus() { return this.#bookingStatus; }

  validate() {
    if (!(this.#student instanceof Student)) throw new Error('A valid Student object is required.');
    if (!this.#mealDate || !this.#mealType || this.#quantity < 1) throw new Error('Invalid booking information.');
    return true;
  }
  calculateTotal() { return MEAL_PRICES[this.#mealType] * this.#quantity; }
  confirmBooking() { this.#bookingStatus = 'Confirmed'; }
  cancelBooking() { this.#bookingStatus = 'Cancelled'; }
  getSummary() {
    return `========================================\n          BOOKING RECEIPT\n========================================\nStudent: ${this.#student.getFullName()} (${this.#student.studentId})\nMeal: ${this.#mealType} x ${this.#quantity}\nDate: ${this.#mealDate}\nDietary note: ${this.#dietaryNote}\nStatus: ${this.#bookingStatus}\nTotal cost: K${this.calculateTotal().toFixed(2)}\n========================================`;
  }
}
module.exports = MealBooking;
