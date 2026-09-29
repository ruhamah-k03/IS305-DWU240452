import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const srcDirectory = path.dirname(path.dirname(currentFile));
export const projectRoot = path.dirname(srcDirectory);
export const dataDirectory = path.join(projectRoot, "data");
export const paths = {
  users: path.join(dataDirectory, "users.json"),
  requests: path.join(dataDirectory, "serviceRequests.json"),
  history: path.join(dataDirectory, "requestHistory.json"),
  audit: path.join(dataDirectory, "auditLog.json")
};