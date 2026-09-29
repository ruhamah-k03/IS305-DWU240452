import { User } from "./User.js";

export class StudentRequester extends User {
  #programme;
  #yearLevel;

  constructor(userId, firstName, lastName, email, programme, yearLevel) {
    super(userId, firstName, lastName, email, "Student Requester");
    this.#programme = String(programme ?? "").trim();
    this.#yearLevel = Number(yearLevel);
    this.validateSpecialised();
  }

  get programme() { return this.#programme; }
  get yearLevel() { return this.#yearLevel; }

  validateSpecialised() {
    if (!this.#programme) throw new Error("Programme is required.");
    if (!Number.isInteger(this.#yearLevel) || this.#yearLevel < 1) {
      throw new Error("Year level must be a positive whole number.");
    }
  }

  displayInfo() {
    return `${super.displayInfo()} | Programme: ${this.#programme} | Year: ${this.#yearLevel}`;
  }

  toJSON() {
    return { ...super.toJSON(), programme: this.#programme, yearLevel: this.#yearLevel, classType: "StudentRequester" };
  }
}

export class StaffRequester extends User {
  #department;

  constructor(userId, firstName, lastName, email, department) {
    super(userId, firstName, lastName, email, "Staff Requester");
    this.#department = String(department ?? "").trim();
    if (!this.#department) throw new Error("Department is required.");
  }

  get department() { return this.#department; }

  displayInfo() {
    return `${super.displayInfo()} | Department: ${this.#department}`;
  }

  toJSON() {
    return { ...super.toJSON(), department: this.#department, classType: "StaffRequester" };
  }
}

export class ServiceOfficer extends User {
  #serviceSection;

  constructor(userId, firstName, lastName, email, serviceSection) {
    super(userId, firstName, lastName, email, "Service Officer");
    this.#serviceSection = String(serviceSection ?? "").trim();
    if (!this.#serviceSection) throw new Error("Service section is required.");
  }

  get serviceSection() { return this.#serviceSection; }

  displayInfo() {
    return `${super.displayInfo()} | Section: ${this.#serviceSection}`;
  }

  toJSON() {
    return { ...super.toJSON(), serviceSection: this.#serviceSection, classType: "ServiceOfficer" };
  }
}

export class Technician extends User {
  #technicalSpeciality;

  constructor(userId, firstName, lastName, email, technicalSpeciality) {
    super(userId, firstName, lastName, email, "Technician");
    this.#technicalSpeciality = String(technicalSpeciality ?? "").trim();
    if (!this.#technicalSpeciality) throw new Error("Technical speciality is required.");
  }

  get technicalSpeciality() { return this.#technicalSpeciality; }

  displayInfo() {
    return `${super.displayInfo()} | Speciality: ${this.#technicalSpeciality}`;
  }

  toJSON() {
    return { ...super.toJSON(), technicalSpeciality: this.#technicalSpeciality, classType: "Technician" };
  }
}