const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const Student = require('./Student');
const MealBooking = require('./MealBooking');

const bookingsArray = [];

function isDuplicate(student, mealDate, mealType) {
  return bookingsArray.some(booking =>
    booking.student.studentId.toLowerCase() === student.studentId.toLowerCase() &&
    booking.mealDate === mealDate &&
    booking.mealType.toLowerCase() === mealType.toLowerCase()
  );
}

function displayBookingHistory(student, bookings) {
  const studentBookings = bookings.filter(booking =>
    booking.student.studentId.toLowerCase() === student.studentId.toLowerCase()
  );
  const combinedCost = studentBookings.reduce((total, booking) => total + booking.calculateTotal(), 0);

  console.log('\n========================================');
  console.log('          STUDENT INFORMATION');
  console.log('========================================');
  console.log(`Student ID: ${student.studentId}`);
  console.log(`Student Name: ${student.getFullName()}`);
  console.log('\n========================================');
  console.log('            BOOKING HISTORY');
  console.log('========================================');

  if (studentBookings.length === 0) console.log('No bookings found for this student.');
  studentBookings.forEach((booking, index) => {
    console.log(`${index + 1}. ${booking.mealType} - ${booking.mealDate}`);
    console.log(`   Quantity: ${booking.quantity}`);
    console.log(`   Status: ${booking.bookingStatus}`);
    console.log(`   Cost: K${booking.calculateTotal().toFixed(2)}\n`);
  });
  console.log(`Total Bookings: ${studentBookings.length}`);
  console.log(`Combined Cost: K${combinedCost.toFixed(2)}`);
  console.log('========================================');
}

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('========================================');
  console.log('       DWU DINING MEAL BOOKING');
  console.log('========================================\n');

  try {
    const studentId = await rl.question('Student ID: ');
    const firstName = await rl.question('First name: ');
    const lastName = await rl.question('Last name: ');
    const student = new Student(studentId, firstName, lastName);
    console.log('\n' + student.displayInfo());

    let addAnother = 'yes';
    while (addAnother.toLowerCase() === 'yes' || addAnother.toLowerCase() === 'y') {
      console.log('\nEnter meal booking details:');
      const mealDate = await rl.question('Meal date (YYYY-MM-DD): ');
      const mealType = await rl.question('Meal type (Breakfast/Lunch/Dinner): ');
      const quantity = await rl.question('Quantity: ');
      const dietaryNote = await rl.question('Dietary note: ');

      const booking = new MealBooking(student, mealDate, mealType, quantity, dietaryNote);
      booking.validate();
      if (isDuplicate(student, booking.mealDate, booking.mealType)) {
        throw new Error(`A ${booking.mealType} booking for ${booking.mealDate} already exists for this student.`);
      }
      booking.confirmBooking();
      bookingsArray.push(booking);
      console.log('\n' + booking.getSummary());
      addAnother = await rl.question('\nAdd another booking for this student? (yes/no): ');
    }

    const updateName = await rl.question('\nWould you like to update the student name? (yes/no): ');
    if (updateName.toLowerCase() === 'yes' || updateName.toLowerCase() === 'y') {
      const which = await rl.question('Update first name or last name? (first/last): ');
      if (which.toLowerCase() === 'first') student.firstName = await rl.question('New first name: ');
      else if (which.toLowerCase() === 'last') student.lastName = await rl.question('New last name: ');
      else throw new Error('Please choose first or last.');
      console.log('\nStudent updated successfully. Existing booking summaries now use the updated Student object.');
    }

    displayBookingHistory(student, bookingsArray);
    if (bookingsArray.length > 0) console.log('\nUpdated booking summary:\n' + bookingsArray[0].getSummary());
  } catch (error) {
    console.log('\n========================================');
    console.log('             APPLICATION ERROR');
    console.log('========================================');
    console.log(`Error: ${error.message}`);
    console.log('========================================');
  } finally { rl.close(); }
}

main();
module.exports = { displayBookingHistory, isDuplicate };
