import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.DISCORD_TOKEN;

if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
  console.error('\n❌ ERROR: Discord bot token is missing or not configured!');
  console.error('👉 Please open .env and replace YOUR_BOT_TOKEN_HERE with your real token from:');
  console.error('   https://discord.com/developers/applications\n');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

async function init() {
  // 1. Load Commands
  const commandsPath = path.join(__dirname, 'commands');
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      const command = await import(pathToFileURL(filePath).href);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`⚠️ The command at ${filePath} is missing a required "data" or "execute" export.`);
      }
    }
  }

  console.log(`✅ Loaded ${client.commands.size} slash commands.`);

  // 2. Load Events
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(pathToFileURL(filePath).href);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  console.log(`✅ Registered ${eventFiles.length} event listeners.`);

  // 3. Connect to Discord
  console.log('🔄 Logging in to Discord...');
  await client.login(token);
}

process.on('unhandledRejection', error => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

init().catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
