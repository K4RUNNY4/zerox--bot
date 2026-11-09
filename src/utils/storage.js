import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/storage.json');

const defaultData = {
  todos: {},      // guildId or userId -> [{ id, text, createdAt, completed }]
  snippets: {},   // guildId or userId -> { [name]: { code, language, author, createdAt } }
  reminders: []   // [{ id, userId, channelId, text, dueAt }]
};

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

export function readData() {
  try {
    ensureFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read storage.json:', err);
    return defaultData;
  }
}

export function writeData(data) {
  try {
    ensureFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write storage.json:', err);
  }
}
