import {
  ICTSupportRequest,
  MaintenanceRequest,
  CleaningRequest,
  GeneralCampusServiceRequest
} from "../models/SpecialisedRequests.js";

export class ServiceRequestFactory {
  static createFromData(data, requester) {
    const common = {
      requestId: data.requestId,
      requester,
      title: data.title,
      description: data.description,
      location: data.location,
      category: data.category,
      priority: data.priority,
      status: data.status,
      dateSubmitted: data.dateSubmitted,
      dateUpdated: data.dateUpdated,
      assignedTechnicianId: data.assignedTechnicianId,
      progressNotes: data.progressNotes,
      history: data.history
    };

    switch (data.requestType) {
      case "ICTSupportRequest":
        return new ICTSupportRequest(common, data.specialisedData);
      case "MaintenanceRequest":
        return new MaintenanceRequest(common, data.specialisedData);
      case "CleaningRequest":
        return new CleaningRequest(common, data.specialisedData);
      case "GeneralCampusServiceRequest":
        return new GeneralCampusServiceRequest(common, data.specialisedData);
      default:
        throw new Error(`Unsupported saved request type: ${data.requestType}`);
    }
  }
}
