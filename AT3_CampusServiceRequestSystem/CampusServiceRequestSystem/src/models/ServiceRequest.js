export const CATEGORIES = [
  "ICT Support",
  "Facilities Maintenance",
  "Cleaning and Sanitation",
  "General Campus Service"
];

export const PRIORITIES = ["Low", "Normal", "High", "Urgent"];

export const STATUSES = [
  "Submitted",
  "Reviewed",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Cancelled"
];

const allowedTransitions = {
  "Submitted": ["Reviewed", "Cancelled"],
  "Reviewed": ["Assigned", "Cancelled"],
  "Assigned": ["In Progress", "Cancelled"],
  "In Progress": ["Resolved", "Cancelled"],
  "Resolved": ["Closed"],
  "Closed": [],
  "Cancelled": []
};

export class ServiceRequest {
  #requestId;
  #requester;
  #title;
  #description;
  #location;
  #category;
  #priority;
  #status;
  #dateSubmitted;
  #dateUpdated;
  #assignedTechnicianId;
  #progressNotes;
  #history;

  constructor({
    requestId, requester, title, description, location, category,
    priority = "Normal", status = "Submitted",
    dateSubmitted = new Date().toISOString(),
    dateUpdated = dateSubmitted,
    assignedTechnicianId = null,
    progressNotes = [],
    history = []
  }) {
    this.#requestId = String(requestId ?? "").trim();
    this.#requester = requester;
    this.#title = String(title ?? "").trim();
    this.#description = String(description ?? "").trim();
    this.#location = String(location ?? "").trim();
    this.#category = String(category ?? "").trim();
    this.#priority = String(priority ?? "").trim();
    this.#status = String(status ?? "").trim();
    this.#dateSubmitted = dateSubmitted;
    this.#dateUpdated = dateUpdated;
    this.#assignedTechnicianId = assignedTechnicianId;
    this.#progressNotes = Array.isArray(progressNotes) ? [...progressNotes] : [];
    this.#history = Array.isArray(history) ? [...history] : [];
    this.validate();
  }

  get requestId() { return this.#requestId; }
  get requester() { return this.#requester; }
  get title() { return this.#title; }
  get description() { return this.#description; }
  get location() { return this.#location; }
  get category() { return this.#category; }
  get priority() { return this.#priority; }
  get status() { return this.#status; }
  get dateSubmitted() { return this.#dateSubmitted; }
  get dateUpdated() { return this.#dateUpdated; }
  get assignedTechnicianId() { return this.#assignedTechnicianId; }
  get progressNotes() { return [...this.#progressNotes]; }
  get history() { return [...this.#history]; }

  set title(value) {
    if (!String(value ?? "").trim()) throw new Error("Request title is required.");
    this.#title = String(value).trim();
    this._touch();
  }

  set description(value) {
    if (!String(value ?? "").trim()) throw new Error("Request description is required.");
    this.#description = String(value).trim();
    this._touch();
  }

  set location(value) {
    if (!String(value ?? "").trim()) throw new Error("Campus location is required.");
    this.#location = String(value).trim();
    this._touch();
  }

  set priority(value) {
    if (!PRIORITIES.includes(value)) throw new Error("Unsupported priority value.");
    this.#priority = value;
    this._touch();
  }

  validate() {
    if (!this.#requestId) throw new Error("Request ID is required.");
    if (!this.#requester?.userId) throw new Error("A valid requester is required.");
    if (!this.#title) throw new Error("Request title is required.");
    if (!this.#description) throw new Error("Request description is required.");
    if (!this.#location) throw new Error("Campus location is required.");
    if (!CATEGORIES.includes(this.#category)) throw new Error("Unsupported request category.");
    if (!PRIORITIES.includes(this.#priority)) throw new Error("Unsupported priority value.");
    if (!STATUSES.includes(this.#status)) throw new Error("Unsupported status value.");
    return true;
  }

  updateDetails(changes = {}) {
    if (this.#status !== "Submitted") {
      throw new Error("Only Submitted requests can be updated by a requester.");
    }
    if (changes.title !== undefined) this.title = changes.title;
    if (changes.description !== undefined) this.description = changes.description;
    if (changes.location !== undefined) this.location = changes.location;
    if (changes.priority !== undefined) this.priority = changes.priority;
    this.validate();
    return this;
  }

  cancelRequest() {
    if (this.#status === "Cancelled") throw new Error("Request is already Cancelled.");
    if (this.#status !== "Submitted") throw new Error("Only Submitted requests can be cancelled by a requester.");
    this.#status = "Cancelled";
    this._touch();
    return this;
  }

  transitionTo(newStatus, actorId, actorRole, comment = "") {
    if (!STATUSES.includes(newStatus)) throw new Error("Unsupported status value.");
    if (newStatus === this.#status) throw new Error("Request is already in that status.");
    if (!allowedTransitions[this.#status].includes(newStatus)) {
      throw new Error(`Invalid status transition: ${this.#status} -> ${newStatus}`);
    }
    const previousStatus = this.#status;
    this.#status = newStatus;
    this._touch();
    this.#history.push({
      previousStatus,
      newStatus,
      action: `Status changed to ${newStatus}`,
      actorId,
      actorRole,
      comment,
      dateTime: this.#dateUpdated
    });
  }

  assignTechnician(technicianId, actorId, actorRole) {
    if (actorRole !== "Service Officer") throw new Error("Only a Service Officer may assign a Technician.");
    if (this.#status !== "Reviewed") throw new Error("Only Reviewed requests can be assigned.");
    if (!technicianId) throw new Error("Technician ID is required.");
    this.#assignedTechnicianId = technicianId;
    this.transitionTo("Assigned", actorId, actorRole, `Assigned to ${technicianId}`);
  }

  addProgressNote(technicianId, note) {
    if (this.#status !== "Assigned" && this.#status !== "In Progress") {
      throw new Error("Progress can only be added to Assigned or In Progress requests.");
    }
    if (technicianId !== this.#assignedTechnicianId) {
      throw new Error("Only the assigned Technician may update work progress.");
    }
    if (!String(note ?? "").trim()) throw new Error("Progress note is required.");
    if (this.#status === "Assigned") {
      this.transitionTo("In Progress", technicianId, "Technician", "Technician began work.");
    }
    this.#progressNotes.push({
      technicianId,
      note: String(note).trim(),
      dateTime: new Date().toISOString()
    });
    this._touch();
  }

  resolve(technicianId, comment = "Work resolved.") {
    if (technicianId !== this.#assignedTechnicianId) {
      throw new Error("Only the assigned Technician may resolve the request.");
    }
    if (this.#status !== "In Progress") throw new Error("Only In Progress requests can be resolved.");
    this.transitionTo("Resolved", technicianId, "Technician", comment);
  }

  close(officerId, comment = "Completion verified.") {
    if (this.#status !== "Resolved") throw new Error("Only Resolved requests can be closed.");
    this.transitionTo("Closed", officerId, "Service Officer", comment);
  }

  calculatePriorityScore() {
    throw new Error("Abstract method calculatePriorityScore() must be implemented by a specialised request class.");
  }

  getTargetResolutionHours() {
    throw new Error("Abstract method getTargetResolutionHours() must be implemented by a specialised request class.");
  }

  getRequestSummary() {
    throw new Error("Abstract method getRequestSummary() must be implemented by a specialised request class.");
  }

  _touch() {
    this.#dateUpdated = new Date().toISOString();
  }

  _addHistory(entry) {
    this.#history.push(entry);
  }

  toJSON() {
    return {
      requestId: this.#requestId,
      requestType: this.constructor.name,
      requesterId: this.#requester.userId,
      title: this.#title,
      description: this.#description,
      location: this.#location,
      category: this.#category,
      priority: this.#priority,
      status: this.#status,
      dateSubmitted: this.#dateSubmitted,
      dateUpdated: this.#dateUpdated,
      assignedTechnicianId: this.#assignedTechnicianId,
      progressNotes: this.#progressNotes,
      history: this.#history,
      specialisedData: this.getSpecialisedData()
    };
  }

  getSpecialisedData() {
    return {};
  }
}