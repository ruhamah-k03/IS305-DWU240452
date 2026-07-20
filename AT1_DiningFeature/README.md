 # DWU Dining Services - Meal Booking System

## Student Information
* **Student Name:** RUHAMAH KAIRAT  
* **Student ID:** STU240452  

## GitHub Repository
* **Repository URL:** 

---

## Program Description
This application is a console-based **Dining Meal Booking System** built using Object-Oriented Programming (OOP) principles in JavaScript (Node.js). The system allows students to create meal bookings while ensuring strict **data encapsulation** using private fields (`#`). 
The application automatically calculates the total cost of a booking based on the designated pricing structure for DWU Dining Services and includes data validation to reject invalid inputs (such as negative meal quantities).

---

## Submitted Files

File Name & Purpose
`MealBooking.js` - Contains the core blueprint `MealBooking` class. Defines the private fields, class constructor, getters/setters for encapsulation, and the business logic methods (`calculateTotal()` and `getSummary()`).
`DiningApp.js` - The main executable driver file. It imports the `MealBooking` class, instantiates booking objects, manipulates data via setters, and displays outputs to the console interface.
`README.md` - Provides documentation, file overviews, setup instructions, and testing summaries for the project. |

---

## How to Run the Program

### Prerequisites
Ensure you have **Node.js** installed on your machine. You can verify this by running `node -v` in your terminal.

### Execution Steps
1. Open your terminal or command prompt (or use the built-in terminal in VS Code: `Ctrl + \``).
2. Navigate to the directory containing your project files:
   ``bash
   cd <directory_name>
3. Run the command `node DiningApp.js`. 