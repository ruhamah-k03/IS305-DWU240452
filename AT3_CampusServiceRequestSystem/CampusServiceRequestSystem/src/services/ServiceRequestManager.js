import { CATEGORIES, PRIORITIES } from "../models/ServiceRequest.js";

export class ServiceRequestManager {
  #users = [];
  #requests = [];

  constructor({ userRepository = null, requestRepository = null, auditRepository = null } = {}) {
    this.userRepository = userRepository;
    this.requestRepository = requestRepository;
    this.auditRepository = auditRepository;
  }

  setUsers(users) { this.#users = users; }
  setRequests(requests) { this.#requests = requests; }

  registerUser(user) {
    user.validate();
    if (this.findUserById(user.userId)) throw new Error("Duplicate user ID.");
    this.#users.push(user);
    return user;
  }

  findUserById(userId) {
    return this.#users.find(user => user.userId === userId) ?? null;
  }

  submitRequest(request) {
    request.validate();
    if (this.findRequestById(request.requestId)) throw new Error("Duplicate request ID.");
    this.#requests.push(request);
    return request;
  }

  findRequestById(requestId) {
    return this.#requests.find(request => request.requestId === requestId) ?? null;
  }

  getRequestsByUser(userId) {
    return this.#requests.filter(request => request.requester.userId === userId);
  }

  getAllRequests() {
    return [...this.#requests];
  }

  updateRequest(requestId, userId, changes) {
    const request = this.findRequestById(requestId);
    if (!request) throw new Error("Request not found.");
    if (request.requester.userId !== userId) throw new Error("You may only update your own request.");
    request.updateDetails(changes);
    return request;
  }

  cancelRequest(requestId, userId) {
    const request = this.findRequestById(requestId);
    if (!request) throw new Error("Request not found.");
    if (request.requester.userId !== userId) throw new Error("You may only cancel your own request.");
    request.cancelRequest();
    return request;
  }

  searchRequests(searchText) {
    const term = String(searchText ?? "").trim().toLowerCase();
    return this.#requests.filter(request =>
      request.requestId.toLowerCase().includes(term) ||
      request.title.toLowerCase().includes(term)
    );
  }

  filterByCategory(category) {
    return this.#requests.filter(request => request.category === category);
  }

  filterByStatus(status) {
    return this.#requests.filter(request => request.status === status);
  }

  filterByPriority(priority) {
    return this.#requests.filter(request => request.priority === priority);
  }

  filterByTechnician(technicianId) {
    return this.#requests.filter(request => request.assignedTechnicianId === technicianId);
  }

  sortByDateSubmitted(descending = false) {
    return [...this.#requests].sort((a, b) =>
      (new Date(a.dateSubmitted) - new Date(b.dateSubmitted)) * (descending ? -1 : 1)
    );
  }

  sortByPriority() {
    const order = { Urgent: 1, High: 2, Normal: 3, Low: 4 };
    return [...this.#requests].sort((a, b) => order[a.priority] - order[b.priority]);
  }

  getRequestSummaryByStatus() {
    return this.#requests.reduce((summary, request) => {
      summary[request.status] = (summary[request.status] ?? 0) + 1;
      return summary;
    }, {});
  }

  getReportByCategory() {
    return this.#requests.reduce((summary, request) => {
      summary[request.category] = (summary[request.category] ?? 0) + 1;
      return summary;
    }, {});
  }

  getReportByPriority() {
    return this.#requests.reduce((summary, request) => {
      summary[request.priority] = (summary[request.priority] ?? 0) + 1;
      return summary;
    }, {});
  }

  getUrgentRequests() {
    return this.#requests.filter(request => request.priority === "Urgent");
  }

  getOverdueRequests() {
    const now = Date.now();
    return this.#requests.filter(request => {
      if (["Closed", "Cancelled"].includes(request.status)) return false;
      const hours = request.getTargetResolutionHours();
      return (now - new Date(request.dateSubmitted).getTime()) / 3600000 > hours;
    });
  }

  getRequestsByTechnician() {
    return this.#requests.reduce((summary, request) => {
      const tech = request.assignedTechnicianId ?? "Unassigned";
      if (!summary[tech]) summary[tech] = [];
      summary[tech].push(request);
      return summary;
    }, {});
  }

  getCompletedByTechnician() {
    return this.#requests
      .filter(request => request.status === "Closed" && request.assignedTechnicianId)
      .reduce((summary, request) => {
        summary[request.assignedTechnicianId] = (summary[request.assignedTechnicianId] ?? 0) + 1;
        return summary;
      }, {});
  }

  getAverageResolutionTimeHours() {
    const completed = this.#requests.filter(r => r.status === "Closed");
    if (!completed.length) return 0;
    const total = completed.reduce((sum, r) => {
      return sum + (new Date(r.dateUpdated) - new Date(r.dateSubmitted)) / 3600000;
    }, 0);
    return Number((total / completed.length).toFixed(2));
  }

  getVolumeByLocation() {
    return this.#requests.reduce((summary, request) => {
      summary[request.location] = (summary[request.location] ?? 0) + 1;
      return summary;
    }, {});
  }

  getUsers() { return [...this.#users]; }
  getCategories() { return [...CATEGORIES]; }
  getPriorities() { return [...PRIORITIES]; }
}