import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
  console.error('❌ Error: DISCORD_TOKEN is missing or set to placeholder in .env!');
  console.error('👉 Please edit .env and provide your bot token.');
  process.exit(1);
}

if (!clientId || clientId === 'YOUR_APPLICATION_ID_HERE') {
  console.error('❌ Error: CLIENT_ID is missing or set to placeholder in .env!');
  console.error('👉 Please edit .env and provide your application/client ID.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

async function loadCommands() {
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);
      const command = await import(pathToFileURL(filePath).href);
      if (command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
        console.log(`📦 Loaded command [/${command.data.name}] from ${category}/${file}`);
      } else {
        console.warn(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
}

async function deploy() {
  await loadCommands();
  const rest = new REST().setToken(token);

  try {
    console.log(`\n🚀 Started refreshing ${commands.length} application (/) commands...`);

    if (guildId && guildId.trim() !== '') {
      console.log(`📍 Registering commands specifically to Guild ID: ${guildId} (Instant deployment)`);
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId.trim()),
        { body: commands }
      );
      console.log(`✅ Successfully reloaded ${data.length} guild (/) commands!`);
    } else {
      console.log(`🌍 Registering commands globally (Available in all servers)`);
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Successfully reloaded ${data.length} global (/) commands!`);
    }
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
}

deploy();
