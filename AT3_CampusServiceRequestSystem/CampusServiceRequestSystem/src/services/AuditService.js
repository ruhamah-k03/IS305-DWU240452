export class AuditService {
  constructor(auditRepository) {
    this.auditRepository = auditRepository;
  }

  async record(actorId, action, requestId, description, outcome = "Success") {
    const entries = await this.auditRepository.loadAll();
    entries.push({
      auditId: `AUD${String(entries.length + 1).padStart(3, "0")}`,
      actorId,
      action,
      affectedRequestId: requestId ?? null,
      description,
      dateTime: new Date().toISOString(),
      outcome
    });
    await this.auditRepository.saveAll(entries);
  }
}