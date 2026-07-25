const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

// Define meal prices (e.g., Breakfast: K10, Lunch: K15, Dinner: K20)
const MEAL_PRICES = {
  'Breakfast': 10,
  'Lunch': 15,
  'Dinner': 20
};

// ==========================================
// Class Definition
// ==========================================
class MealBooking {
  constructor(studentId, studentName, mealDate, mealType, quantity, dietaryNote) {
    this.studentId = studentId ? studentId.trim() : '';
    this.studentName = studentName ? studentName.trim() : '';
    this.mealDate = mealDate ? mealDate.trim() : '';
    this.mealType = mealType ? mealType.trim() : '';
    this.quantity = parseInt(quantity, 10);
    this.dietaryNote = dietaryNote ? dietaryNote.trim() : 'None';
    this.status = 'Pending';
  }

  // Requirement: validate()
  validate() {
    if (!this.studentId) {
      throw new Error("Student ID is required.");
    }
    if (!this.studentName) {
      throw new Error("Student name is required.");
    }
    if (!this.mealDate) {
      throw new Error("Meal date is required.");
    }
    
    // Check meal type case-insensitively
    const validMealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    const formattedType = validMealTypes.find(
      type => type.toLowerCase() === this.mealType.toLowerCase()
    );

    if (!formattedType) {
      throw new Error("Invalid meal type. Must be Breakfast, Lunch, or Dinner.");
    }
    this.mealType = formattedType; // Normalize case

    if (isNaN(this.quantity) || this.quantity < 1) {
      throw new Error("Quantity must be a number greater than or equal to 1.");
    }
  }

  // Requirement: calculateTotal()
  calculateTotal() {
    const price = MEAL_PRICES[this.mealType] || 0;
    return price * this.quantity;
  }

  // Requirement: confirmBooking()
  confirmBooking() {
    this.status = 'Confirmed';
  }

  // Requirement: cancelBooking()
  cancelBooking() {
    this.status = 'Cancelled';
  }

  // Requirement: getSummary()
  getSummary() {
    const total = this.calculateTotal().toFixed(2);
    return `
========================================
          BOOKING RECEIPT
========================================
Student: ${this.studentName} (${this.studentId})
Meal: ${this.mealType} x ${this.quantity}
Date: ${this.mealDate}
Dietary note: ${this.dietaryNote}
Status: ${this.status}
Total cost: K${total}
========================================`;
  }
}

// In-memory array storage (No DB allowed)
const bookingsArray = [];

// Helper function to check duplicate bookings
function isDuplicate(studentId, mealDate, mealType) {
  return bookingsArray.some(b => 
    b.studentId.toLowerCase() === studentId.toLowerCase() &&
    b.mealDate === mealDate &&
    b.mealType.toLowerCase() === mealType.toLowerCase()
  );
}

// ==========================================
// Interactive Console & Testing Logic
// ==========================================
async function main() {
  const rl = readline.createInterface({ input, output });

  console.log("========================================");
  console.log("       DWU DINING MEAL BOOKING          ");
  console.log("========================================\n");

  try {
    // 1. Prompt User Inputs
    const studentId = await rl.question("Student ID: ");
    const studentName = await rl.question("Student name: ");
    const mealDate = await rl.question("Meal date (YYYY-MM-DD): ");
    const mealType = await rl.question("Meal type (Breakfast/Lunch/Dinner): ");
    const quantity = await rl.question("Quantity: ");
    const dietaryNote = await rl.question("Dietary note: ");

    // 2. Instantiate Object
    const booking = new MealBooking(
      studentId, 
      studentName, 
      mealDate, 
      mealType, 
      quantity, 
      dietaryNote
    );

    // 3. Validation
    booking.validate();

    // 4. Check Duplicate Entry in Array
    if (isDuplicate(booking.studentId, booking.mealDate, booking.mealType)) {
      throw new Error(`A booking for Student ID ${booking.studentId} on ${booking.mealDate} for ${booking.mealType} already exists.`);
    }

    // 5. Store in Array
    bookingsArray.push(booking);

    // 6. Display Receipt
    console.log(booking.getSummary());

  } catch (error) {
    // Error Handling
    console.log("\n========================================");
    console.log("             BOOKING ERROR              ");
    console.log("========================================");
    console.log(`Error: ${error.message}`);
    console.log("========================================\n");
  } finally {
    rl.close();
  }
}

// Run the application
main();