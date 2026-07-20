// 1. Import the MealBooking class from File 1
// const MealBooking = require("./MealBooking");

console.log("--- Welcome to DWU Dining Services ---\n");

// 2. Create at least one MealBooking object
// Parameter order: studentId, studentName, mealDate, mealType, quantity, dietaryNote
const studentBooking = new MealBooking(
    "STU240156",
    "Alex Kain",
    "2026-07-21",
    "Dinner",
    2,
    "No Globe"
);

// 3. Call the object's methods & 5. Display the booking summary and calculated total
console.log(studentBooking.getSummary());

console.log("\n--------------------------------------");
console.log("Processing updates...");

// Demonstrate how getters/setters and methods can manipulate the data
studentBooking.bookingStatus = "Confirmed";
console.log(`Updated Status: ${studentBooking.bookingStatus}`);