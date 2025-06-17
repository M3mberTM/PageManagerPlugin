import os from "os";
export const LOG_FILE_PREFIX = "PMlog";
export const PATH_DELIMITER = os.platform() == "win32" ? "\\" : "/";
export const LOG_FILE_LIMIT = 4;
export const LOG_FOLDER = "logs";
export const STORAGE_FOLDER = "storage"
export const SETTINGS_FOLDER = "settings"
export const LOG = true;
export const PRESET_FILE = 'presets.json'
export const PROJECT_FILE = 'projects.json'
