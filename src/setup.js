import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = query => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('\n======================================================');
  console.log('🤖 Discord Bot Quick Setup & Configuration Wizard');
  console.log('======================================================\n');
  console.log('Need a Bot Token? Follow these steps:');
  console.log('1. Visit: https://discord.com/developers/applications');
  console.log('2. Click "New Application" and name your bot.');
  console.log('3. Under "Bot", click "Reset Token" to copy your token.');
  console.log('4. Under "General Information", copy your "Application ID" (Client ID).\n');

  const token = await ask('🔑 1. Enter your DISCORD_TOKEN: ');
  if (!token.trim()) {
    console.error('❌ Token cannot be empty!');
    rl.close();
    process.exit(1);
  }

  const clientId = await ask('🆔 2. Enter your CLIENT_ID: ');
  if (!clientId.trim()) {
    console.error('❌ Client ID cannot be empty!');
    rl.close();
    process.exit(1);
  }

  const guildId = await ask('🏰 3. Enter your GUILD_ID (Server ID for instant testing, or press Enter to skip): ');

  const envContent = [
    `# Discord Bot Credentials`,
    `DISCORD_TOKEN=${token.trim()}`,
    `CLIENT_ID=${clientId.trim()}`,
    `GUILD_ID=${guildId.trim()}`,
    ``
  ].join('\n');

  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log('\n✅ Saved credentials to .env successfully!');

  const deployAnswer = await ask('\n🚀 Would you like to register slash commands to Discord now? (y/N): ');
  if (deployAnswer.trim().toLowerCase() === 'y') {
    console.log('\n⏳ Registering commands...');
    try {
      execSync('node src/deploy-commands.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    } catch (e) {
      console.error('Failed to deploy commands. Check credentials.');
    }
  }

  const startAnswer = await ask('\n🤖 Would you like to start the bot now? (y/N): ');
  rl.close();

  if (startAnswer.trim().toLowerCase() === 'y') {
    console.log('\n🟢 Starting bot...');
    execSync('npm start', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
  } else {
    console.log('\n✨ Setup complete! Whenever you want to start the bot, run:');
    console.log('   cd ~/projects/discord-bot');
    console.log('   npm start\n');
  }
}

main().catch(console.error);
