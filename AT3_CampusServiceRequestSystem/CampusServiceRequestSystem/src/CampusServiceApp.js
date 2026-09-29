import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { mkdir } from "node:fs/promises";
import { User } from "./models/User.js";
import { StudentRequester, StaffRequester, ServiceOfficer, Technician } from "./models/RequesterTypes.js";
import { ICTSupportRequest, MaintenanceRequest, CleaningRequest, GeneralCampusServiceRequest } from "./models/SpecialisedRequests.js";
import { ServiceRequestManager } from "./services/ServiceRequestManager.js";
import { AuditService } from "./services/AuditService.js";
import { UserFileRepository, ServiceRequestFileRepository, AuditFileRepository } from "./repositories/FileRepository.js";
import { ServiceRequestFactory } from "./factories/ServiceRequestFactory.js";
import { paths, dataDirectory } from "./utils/dataPaths.js";

const rl = readline.createInterface({ input, output });

const userRepo = new UserFileRepository(paths.users);
const requestRepo = new ServiceRequestFileRepository(paths.requests);
const auditRepo = new AuditFileRepository(paths.audit);
const auditService = new AuditService(auditRepo);
const manager = new ServiceRequestManager({ userRepository: userRepo, requestRepository: requestRepo, auditRepository: auditRepo });

async function saveUsers() {
  await userRepo.saveAll(manager.getUsers().map(u => u.toJSON()));
}

async function saveRequests() {
  const records = manager.getAllRequests().map(r => r.toJSON());
  await requestRepo.saveAll(records);
  const allHistory = records.flatMap(r => r.history.map(h => ({
    requestId: r.requestId,
    ...h
  })));
  const historyRepo = new ServiceRequestFileRepository(paths.history);
  await historyRepo.saveAll(allHistory);
}

async function loadData() {
  await mkdir(dataDirectory, { recursive: true });
  const savedUsers = await userRepo.loadAll();
  const users = savedUsers.map(data => {
    switch (data.classType) {
      case "StudentRequester":
        return new StudentRequester(data.userId, data.firstName, data.lastName, data.email, data.programme, data.yearLevel);
      case "StaffRequester":
        return new StaffRequester(data.userId, data.firstName, data.lastName, data.email, data.department);
      case "ServiceOfficer":
        return new ServiceOfficer(data.userId, data.firstName, data.lastName, data.email, data.serviceSection);
      case "Technician":
        return new Technician(data.userId, data.firstName, data.lastName, data.email, data.technicalSpeciality);
      default:
        return new User(data.userId, data.firstName, data.lastName, data.email, data.userType);
    }
  });

  const savedRequests = await requestRepo.loadAll();
  const requests = savedRequests.map(data => {
    const requester = users.find(u => u.userId === data.requesterId);
    if (!requester) throw new Error(`Requester ${data.requesterId} is missing for ${data.requestId}.`);
    return ServiceRequestFactory.createFromData(data, requester);
  });

  manager.setUsers(users);
  manager.setRequests(requests);
}

function printRequests(requests) {
  if (!requests.length) {
    console.log("No requests found.");
    return;
  }
  requests.forEach(r => console.log(r.getRequestSummary()));
}

async function registerUser() {
  console.log("\n1. Student  2. Staff  3. Service Officer  4. Technician  5. General User");
  const type = await rl.question("Select user type: ");
  const id = await rl.question("User ID: ");
  const first = await rl.question("First name: ");
  const last = await rl.question("Last name: ");
  const email = await rl.question("Email: ");

  try {
    let user;
    if (type === "1") {
      user = new StudentRequester(id, first, last, email,
        await rl.question("Programme: "), await rl.question("Year level: "));
    } else if (type === "2") {
      user = new StaffRequester(id, first, last, email, await rl.question("Department: "));
    } else if (type === "3") {
      user = new ServiceOfficer(id, first, last, email, await rl.question("Service section: "));
    } else if (type === "4") {
      user = new Technician(id, first, last, email, await rl.question("Technical speciality: "));
    } else {
      user = new User(id, first, last, email, "Requester");
    }
    manager.registerUser(user);
    await saveUsers();
    await auditService.record(user.userId, "user registration", null, `Registered ${user.getFullName()}`);
    console.log("User registered successfully.");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function submitRequest() {
  try {
    const requesterId = await rl.question("Requester ID: ");
    const requester = manager.findUserById(requesterId);
    if (!requester) throw new Error("Requester not found.");

    const requestId = await rl.question("Request ID: ");
    const title = await rl.question("Title: ");
    const description = await rl.question("Description: ");
    const location = await rl.question("Campus location: ");
    console.log(manager.getCategories().map((c, i) => `${i + 1}. ${c}`).join("\n"));
    const category = manager.getCategories()[Number(await rl.question("Category number: ")) - 1];
    const priority = await rl.question("Priority (Low/Normal/High/Urgent): ");

    let request;
    const common = { requestId, requester, title, description, location, category, priority };

    if (category === "ICT Support") {
      request = new ICTSupportRequest(common, {
        deviceType: await rl.question("Device type: "),
        systemName: await rl.question("System name: "),
        faultType: await rl.question("Fault type: "),
        networkImpact: await rl.question("Network impact: ")
      });
    } else if (category === "Facilities Maintenance") {
      request = new MaintenanceRequest(common, {
        building: await rl.question("Building: "),
        roomNumber: await rl.question("Room number: "),
        hazardLevel: await rl.question("Hazard level: "),
        equipmentAffected: await rl.question("Equipment affected: ")
      });
    } else if (category === "Cleaning and Sanitation") {
      request = new CleaningRequest(common, {
        cleaningArea: await rl.question("Cleaning area: "),
        hygieneRisk: await rl.question("Hygiene risk: "),
        serviceType: await rl.question("Service type: "),
        preferredServiceTime: await rl.question("Preferred service time: ")
      });
    } else {
      request = new GeneralCampusServiceRequest(common, {
        serviceArea: await rl.question("Service area: "),
        serviceDetails: await rl.question("Service details: "),
        preferredDate: await rl.question("Preferred date: ")
      });
    }

    manager.submitRequest(request);
    await saveRequests();
    await auditService.record(requesterId, "request creation", request.requestId, request.title);
    console.log("Request submitted successfully.");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function viewById() {
  const id = await rl.question("Request ID: ");
  const request = manager.findRequestById(id);
  console.log(request ? request.getRequestSummary() : "Request not found.");
}

async function viewMine() {
  const id = await rl.question("Your user ID: ");
  printRequests(manager.getRequestsByUser(id));
}

async function updateMine() {
  try {
    const userId = await rl.question("Your user ID: ");
    const requestId = await rl.question("Request ID: ");
    const changes = {};
    const title = await rl.question("New title (leave blank to keep): ");
    const description = await rl.question("New description (leave blank to keep): ");
    const location = await rl.question("New location (leave blank to keep): ");
    if (title) changes.title = title;
    if (description) changes.description = description;
    if (location) changes.location = location;
    manager.updateRequest(requestId, userId, changes);
    await saveRequests();
    await auditService.record(userId, "request updates", requestId, "Requester updated request.");
    console.log("Request updated successfully.");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function cancelMine() {
  try {
    const userId = await rl.question("Your user ID: ");
    const requestId = await rl.question("Request ID: ");
    manager.cancelRequest(requestId, userId);
    await saveRequests();
    await auditService.record(userId, "request cancellation", requestId, "Requester cancelled request.");
    console.log("Request cancelled successfully.");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

async function search() {
  const term = await rl.question("Search by request ID or title: ");
  printRequests(manager.searchRequests(term));
}

function showReports() {
  console.log("\nRequests by status:", manager.getRequestSummaryByStatus());
  console.log("Requests by category:", manager.getReportByCategory());
  console.log("Requests by priority:", manager.getReportByPriority());
  console.log("Urgent requests:", manager.getUrgentRequests().map(r => r.requestId));
  console.log("Overdue requests:", manager.getOverdueRequests().map(r => r.requestId));
  console.log("Completed by technician:", manager.getCompletedByTechnician());
  console.log("Average resolution hours:", manager.getAverageResolutionTimeHours());
  console.log("Volume by location:", manager.getVolumeByLocation());
}

async function main() {
  try {
    await loadData();
    let running = true;
    while (running) {
      console.log(`
============================================
     CAMPUS SERVICE REQUEST SYSTEM
============================================
1. Register User
2. Submit Service Request
3. View Request by ID
4. View My Requests
5. View All Requests
6. Update My Request
7. Cancel My Request
8. Search Requests
9. View Request Summary
10. Exit
============================================`);
      const choice = await rl.question("Choose an option: ");
      try {
        if (choice === "1") await registerUser();
        else if (choice === "2") await submitRequest();
        else if (choice === "3") await viewById();
        else if (choice === "4") await viewMine();
        else if (choice === "5") printRequests(manager.getAllRequests());
        else if (choice === "6") await updateMine();
        else if (choice === "7") await cancelMine();
        else if (choice === "8") await search();
        else if (choice === "9") showReports();
        else if (choice === "10") running = false;
        else console.log("Invalid menu choice.");
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Application startup error: ${error.message}`);
  } finally {
    rl.close();
  }
}

main();