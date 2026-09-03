# DWU Dining Meal Booking - Lab 2

Name: Ruhamah Kairat

## Files
- `Student.js` - Student class with private fields, validation, getters, setters, and display methods.
- `MealBooking.js` - Meal booking class connected to a Student object.
- `DiningApp.js` - Console application for creating students, bookings, duplicate checking, booking history, and controlled student name updates.
- 'CreditDiningAccount.js'
- 'DiningAccount.js'
- 'RewardsDiningAccount.js'

## Run
```bash
node DiningApp.js
```

## Features
- Rejects empty student ID, first name, and last name.
- Uses one Student object shared by related MealBooking objects.
- Validates meal type and quantity.
- Prevents duplicate bookings for the same student, date, and meal type.
- Calculates meal costs.
- Displays booking history and combined cost.
- Demonstrates shared object references by updating a student's name after bookings are created.
