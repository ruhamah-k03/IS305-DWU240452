import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class FileRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async loadAll() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      if (!raw.trim()) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("Data file must contain an array.");
      return data;
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.saveAll([]);
        return [];
      }
      throw new Error(`Could not read ${path.basename(this.filePath)}: ${error.message}`);
    }
  }

  async saveAll(records) {
    try {
      await mkdir(path.dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, JSON.stringify(records, null, 2), "utf8");
    } catch (error) {
      throw new Error(`Could not write ${path.basename(this.filePath)}: ${error.message}`);
    }
  }

  async create(record) {
    const records = await this.loadAll();
    records.push(record);
    await this.saveAll(records);
    return record;
  }

  async findById(id, field = "id") {
    const records = await this.loadAll();
    return records.find(record => record[field] === id) ?? null;
  }

  async findByRequester(userId) {
    const records = await this.loadAll();
    return records.filter(record => record.requesterId === userId);
  }

  async findByTechnician(technicianId) {
    const records = await this.loadAll();
    return records.filter(record => record.assignedTechnicianId === technicianId);
  }

  async update(id, changes, field = "id") {
    const records = await this.loadAll();
    const index = records.findIndex(record => record[field] === id);
    if (index === -1) throw new Error(`Record ${id} was not found.`);
    records[index] = { ...records[index], ...changes };
    await this.saveAll(records);
    return records[index];
  }
}

export class UserFileRepository extends FileRepository {
  constructor(filePath) { super(filePath); }
}

export class ServiceRequestFileRepository extends FileRepository {
  constructor(filePath) { super(filePath); }
}

export class AuditFileRepository extends FileRepository {
  constructor(filePath) { super(filePath); }
}