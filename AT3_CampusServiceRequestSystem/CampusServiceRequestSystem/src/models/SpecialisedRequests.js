import { ServiceRequest } from "./ServiceRequest.js";

export class ICTSupportRequest extends ServiceRequest {
  #deviceType;
  #systemName;
  #faultType;
  #networkImpact;

  constructor(commonRequestData, specialisedData = {}) {
    super(commonRequestData);
    this.#deviceType = String(specialisedData.deviceType ?? "").trim();
    this.#systemName = String(specialisedData.systemName ?? "").trim();
    this.#faultType = String(specialisedData.faultType ?? "").trim();
    this.#networkImpact = String(specialisedData.networkImpact ?? "").trim();
    this.validateSpecialisedFields();
  }

  validateSpecialisedFields() {
    if (!this.#deviceType || !this.#systemName || !this.#faultType || !this.#networkImpact) {
      throw new Error("ICT request requires device type, system name, fault type and network impact.");
    }
  }

  calculatePriorityScore() {
    const impact = this.#networkImpact.toLowerCase();
    return this.priority === "Urgent" || impact.includes("campus") ? 100 : this.priority === "High" ? 80 : 50;
  }

  getTargetResolutionHours() {
    return this.priority === "Urgent" ? 4 : this.priority === "High" ? 8 : 24;
  }

  getRequestSummary() {
    return `[ICT] ${this.requestId} | ${this.title} | Device: ${this.#deviceType} | System: ${this.#systemName} | Status: ${this.status}`;
  }

  getSpecialisedData() {
    return {
      deviceType: this.#deviceType,
      systemName: this.#systemName,
      faultType: this.#faultType,
      networkImpact: this.#networkImpact
    };
  }
}

export class MaintenanceRequest extends ServiceRequest {
  #building;
  #roomNumber;
  #hazardLevel;
  #equipmentAffected;

  constructor(commonRequestData, specialisedData = {}) {
    super(commonRequestData);
    this.#building = String(specialisedData.building ?? "").trim();
    this.#roomNumber = String(specialisedData.roomNumber ?? "").trim();
    this.#hazardLevel = String(specialisedData.hazardLevel ?? "").trim();
    this.#equipmentAffected = String(specialisedData.equipmentAffected ?? "").trim();
    this.validateSpecialisedFields();
  }

  validateSpecialisedFields() {
    if (!this.#building || !this.#roomNumber || !this.#hazardLevel || !this.#equipmentAffected) {
      throw new Error("Maintenance request requires building, room number, hazard level and equipment affected.");
    }
  }

  calculatePriorityScore() {
    return this.#hazardLevel.toLowerCase().includes("high") ? 100 :
      this.priority === "Urgent" ? 95 : this.priority === "High" ? 80 : 50;
  }

  getTargetResolutionHours() {
    return this.#hazardLevel.toLowerCase().includes("high") ? 4 :
      this.priority === "High" ? 12 : 48;
  }

  getRequestSummary() {
    return `[MAINTENANCE] ${this.requestId} | ${this.title} | ${this.#building}, Room ${this.#roomNumber} | Hazard: ${this.#hazardLevel} | Status: ${this.status}`;
  }

  getSpecialisedData() {
    return {
      building: this.#building,
      roomNumber: this.#roomNumber,
      hazardLevel: this.#hazardLevel,
      equipmentAffected: this.#equipmentAffected
    };
  }
}

export class CleaningRequest extends ServiceRequest {
  #cleaningArea;
  #hygieneRisk;
  #serviceType;
  #preferredServiceTime;

  constructor(commonRequestData, specialisedData = {}) {
    super(commonRequestData);
    this.#cleaningArea = String(specialisedData.cleaningArea ?? "").trim();
    this.#hygieneRisk = String(specialisedData.hygieneRisk ?? "").trim();
    this.#serviceType = String(specialisedData.serviceType ?? "").trim();
    this.#preferredServiceTime = String(specialisedData.preferredServiceTime ?? "").trim();
    this.validateSpecialisedFields();
  }

  validateSpecialisedFields() {
    if (!this.#cleaningArea || !this.#hygieneRisk || !this.#serviceType || !this.#preferredServiceTime) {
      throw new Error("Cleaning request requires cleaning area, hygiene risk, service type and preferred service time.");
    }
  }

  calculatePriorityScore() {
    return this.#hygieneRisk.toLowerCase().includes("high") ? 100 :
      this.priority === "Urgent" ? 95 : this.priority === "High" ? 80 : 50;
  }

  getTargetResolutionHours() {
    return this.#hygieneRisk.toLowerCase().includes("high") ? 6 :
      this.priority === "High" ? 12 : 36;
  }

  getRequestSummary() {
    return `[CLEANING] ${this.requestId} | ${this.title} | Area: ${this.#cleaningArea} | Risk: ${this.#hygieneRisk} | Status: ${this.status}`;
  }

  getSpecialisedData() {
    return {
      cleaningArea: this.#cleaningArea,
      hygieneRisk: this.#hygieneRisk,
      serviceType: this.#serviceType,
      preferredServiceTime: this.#preferredServiceTime
    };
  }
}

export class GeneralCampusServiceRequest extends ServiceRequest {
  #serviceArea;
  #serviceDetails;
  #preferredDate;

  constructor(commonRequestData, specialisedData = {}) {
    super(commonRequestData);
    this.#serviceArea = String(specialisedData.serviceArea ?? "").trim();
    this.#serviceDetails = String(specialisedData.serviceDetails ?? "").trim();
    this.#preferredDate = String(specialisedData.preferredDate ?? "").trim();
    this.validateSpecialisedFields();
  }

  validateSpecialisedFields() {
    if (!this.#serviceArea || !this.#serviceDetails || !this.#preferredDate) {
      throw new Error("General service request requires service area, service details and preferred date.");
    }
  }

  calculatePriorityScore() {
    return this.priority === "Urgent" ? 95 : this.priority === "High" ? 80 : 50;
  }

  getTargetResolutionHours() {
    return this.priority === "Urgent" ? 8 : this.priority === "High" ? 24 : 72;
  }

  getRequestSummary() {
    return `[GENERAL] ${this.requestId} | ${this.title} | Area: ${this.#serviceArea} | Status: ${this.status}`;
  }

  getSpecialisedData() {
    return {
      serviceArea: this.#serviceArea,
      serviceDetails: this.#serviceDetails,
      preferredDate: this.#preferredDate
    };
  }
}
