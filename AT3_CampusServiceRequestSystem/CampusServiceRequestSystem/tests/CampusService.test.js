import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { User } from "../src/models/User.js";
import { StudentRequester, ServiceOfficer, Technician } from "../src/models/RequesterTypes.js";
import { ICTSupportRequest, MaintenanceRequest, CleaningRequest, GeneralCampusServiceRequest } from "../src/models/SpecialisedRequests.js";
import { ServiceRequestManager } from "../src/services/ServiceRequestManager.js";
import { UserFileRepository, ServiceRequestFileRepository } from "../src/repositories/FileRepository.js";
import { ServiceRequestFactory } from "../src/factories/ServiceRequestFactory.js";

function makeUsers() {
  const student = new StudentRequester("STU001", "Ana", "Kila", "ana@example.com", "Information Systems", 3);
  const officer = new ServiceOfficer("OFF001", "Mila", "Pita", "mila@example.com", "ICT Services");
  const tech = new Technician("TECH001", "Toma", "Lau", "toma@example.com", "Networking");
  return { student, officer, tech };
}

test("valid User construction", () => {
  const user = new User("U001", "John", "Doe", "john@example.com");
  assert.equal(user.getFullName(), "John Doe");
});

test("invalid email is rejected", () => {
  assert.throws(() => new User("U001", "John", "Doe", "bad-email"), /Invalid email/);
});

test("StudentRequester uses inheritance and specialised validation", () => {
  const { student } = makeUsers();
  assert.equal(student.userType, "Student Requester");
  assert.equal(student.programme, "Information Systems");
});

test("duplicate user IDs are rejected", () => {
  const manager = new ServiceRequestManager();
  const user = new User("U001", "A", "B", "a@example.com");
  manager.registerUser(user);
  assert.throws(() => manager.registerUser(new User("U001", "C", "D", "c@example.com")), /Duplicate user ID/);
});

test("specialised ICT request validates fields", () => {
  const { student } = makeUsers();
  const request = new ICTSupportRequest({
    requestId: "REQ001", requester: student, title: "Wi-Fi issue",
    description: "Cannot connect", location: "Library", category: "ICT Support", priority: "High"
  }, {
    deviceType: "Laptop", systemName: "Campus Wi-Fi", faultType: "Connection",
    networkImpact: "Single user"
  });
  assert.equal(request.status, "Submitted");
  assert.equal(request.calculatePriorityScore(), 80);
});

test("invalid status transition is rejected", () => {
  const { student } = makeUsers();
  const request = new ICTSupportRequest({
    requestId: "REQ001", requester: student, title: "Wi-Fi issue",
    description: "Cannot connect", location: "Library", category: "ICT Support"
  }, { deviceType: "Laptop", systemName: "Wi-Fi", faultType: "Connection", networkImpact: "Single user" });
  assert.throws(() => request.transitionTo("Closed", "OFF001", "Service Officer"), /Invalid status transition/);
});

test("only a Service Officer can assign a Technician", () => {
  const { student } = makeUsers();
  const request = new ICTSupportRequest({
    requestId: "REQ001", requester: student, title: "Wi-Fi issue",
    description: "Cannot connect", location: "Library", category: "ICT Support"
  }, { deviceType: "Laptop", systemName: "Wi-Fi", faultType: "Connection", networkImpact: "Single user" });
  request.transitionTo("Reviewed", "OFF001", "Service Officer");
  assert.throws(() => request.assignTechnician("TECH001", "TECH001", "Technician"), /Only a Service Officer/);
});

test("assigned Technician can progress and resolve", () => {
  const { student } = makeUsers();
  const request = new ICTSupportRequest({
    requestId: "REQ001", requester: student, title: "Wi-Fi issue",
    description: "Cannot connect", location: "Library", category: "ICT Support"
  }, { deviceType: "Laptop", systemName: "Wi-Fi", faultType: "Connection", networkImpact: "Single user" });
  request.transitionTo("Reviewed", "OFF001", "Service Officer");
  request.assignTechnician("TECH001", "OFF001", "Service Officer");
  request.addProgressNote("TECH001", "Checked access point.");
  request.resolve("TECH001");
  assert.equal(request.status, "Resolved");
});

test("polymorphic specialised summaries work", () => {
  const { student } = makeUsers();
  const requests = [
    new ICTSupportRequest({ requestId: "I1", requester: student, title: "WiFi", description: "x", location: "A", category: "ICT Support" },
      { deviceType: "Laptop", systemName: "WiFi", faultType: "Network", networkImpact: "Single user" }),
    new MaintenanceRequest({ requestId: "M1", requester: student, title: "Door", description: "x", location: "B", category: "Facilities Maintenance" },
      { building: "A", roomNumber: "2", hazardLevel: "Low", equipmentAffected: "Door" }),
    new CleaningRequest({ requestId: "C1", requester: student, title: "Clean", description: "x", location: "C", category: "Cleaning and Sanitation" },
      { cleaningArea: "Toilet", hygieneRisk: "High", serviceType: "Deep clean", preferredServiceTime: "10:00" })
  ];
  const summaries = requests.map(r => r.getRequestSummary());
  assert.equal(summaries.length, 3);
  assert.ok(summaries[0].includes("[ICT]"));
  assert.ok(summaries[1].includes("[MAINTENANCE]"));
  assert.ok(summaries[2].includes("[CLEANING]"));
});

test("JSON repository saves and loads records", async () => {
  const folder = await mkdtemp(path.join(tmpdir(), "campus-test-"));
  const file = path.join(folder, "users.json");
  const repo = new UserFileRepository(file);
  await repo.saveAll([{ userId: "U1", firstName: "A" }]);
  const data = await repo.loadAll();
  assert.equal(data[0].userId, "U1");
  await rm(folder, { recursive: true, force: true });
});

test("factory restores specialised request objects", () => {
  const { student } = makeUsers();
  const data = {
    requestId: "REQ001", requestType: "ICTSupportRequest", requesterId: student.userId,
    title: "WiFi", description: "x", location: "Library", category: "ICT Support",
    priority: "High", status: "Submitted",
    dateSubmitted: new Date().toISOString(), dateUpdated: new Date().toISOString(),
    assignedTechnicianId: null, progressNotes: [], history: [],
    specialisedData: { deviceType: "Laptop", systemName: "WiFi", faultType: "Connection", networkImpact: "Single user" }
  };
  const restored = ServiceRequestFactory.createFromData(data, student);
  assert.ok(restored instanceof ICTSupportRequest);
});

test("manager reports use array processing correctly", () => {
  const { student } = makeUsers();
  const manager = new ServiceRequestManager();
  manager.registerUser(student);
  manager.submitRequest(new ICTSupportRequest({
    requestId: "REQ001", requester: student, title: "WiFi", description: "x",
    location: "Library", category: "ICT Support", priority: "Urgent"
  }, { deviceType: "Laptop", systemName: "WiFi", faultType: "Connection", networkImpact: "Campus" }));
  assert.equal(manager.getUrgentRequests().length, 1);
  assert.equal(manager.getReportByCategory()["ICT Support"], 1);
});

test("General Campus Service request is supported and restorable", () => {
  const { student } = makeUsers();
  const request = new GeneralCampusServiceRequest({
    requestId: "G1", requester: student, title: "Campus sign",
    description: "Repair a sign", location: "Main gate",
    category: "General Campus Service", priority: "Normal"
  }, {
    serviceArea: "Grounds",
    serviceDetails: "Repair sign",
    preferredDate: "Friday"
  });
  assert.equal(request.category, "General Campus Service");
  assert.ok(request.getRequestSummary().includes("[GENERAL]"));
});
