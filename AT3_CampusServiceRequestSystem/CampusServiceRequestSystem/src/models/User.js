export class User {
  #userId;
  #firstName;
  #lastName;
  #email;
  #userType;

  constructor(userId, firstName, lastName, email, userType = "Requester") {
    this.#userId = userId;
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#email = email;
    this.#userType = userType;
    this.validate();
  }

  get userId() { return this.#userId; }
  get firstName() { return this.#firstName; }
  get lastName() { return this.#lastName; }
  get email() { return this.#email; }
  get userType() { return this.#userType; }

  set firstName(value) {
    if (!String(value ?? "").trim()) throw new Error("First name is required.");
    this.#firstName = String(value).trim();
  }

  set lastName(value) {
    if (!String(value ?? "").trim()) throw new Error("Last name is required.");
    this.#lastName = String(value).trim();
  }

  set email(value) {
    if (!User.isValidEmail(value)) throw new Error("Invalid email address.");
    this.#email = String(value).trim();
  }

  set userType(value) {
    if (!String(value ?? "").trim()) throw new Error("User type is required.");
    this.#userType = String(value).trim();
  }

  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  validate() {
    if (!String(this.#userId ?? "").trim()) throw new Error("User ID is required.");
    if (!String(this.#firstName ?? "").trim()) throw new Error("First name is required.");
    if (!String(this.#lastName ?? "").trim()) throw new Error("Last name is required.");
    if (!User.isValidEmail(this.#email)) throw new Error("Invalid email address.");
    if (!String(this.#userType ?? "").trim()) throw new Error("User type is required.");
    return true;
  }

  displayInfo() {
    return `${this.#userId} | ${this.getFullName()} | ${this.#email} | ${this.#userType}`;
  }

  toJSON() {
    return {
      userId: this.#userId,
      firstName: this.#firstName,
      lastName: this.#lastName,
      email: this.#email,
      userType: this.#userType
    };
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? "").trim());
  }
}