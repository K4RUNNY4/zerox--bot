import { Events, ActivityType } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(client) {
  console.log(`🤖 Logged in as ${client.user.tag}!`);
  console.log(`📡 Serving ${client.guilds.cache.size} servers and ${client.users.cache.size} cached users.`);

  client.user.setPresence({
    activities: [
      {
        name: '/help | 🎮 Gaming • 💻 Coding • 🎵 Music',
        type: ActivityType.Custom
      }
    ],
    status: 'online'
  });
}
