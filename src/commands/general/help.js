import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('List all available bot commands and features');

export async function execute(interaction) {
  const embed = createBaseEmbed('Primary')
    .setTitle('🤖 Bot Command Guide')
    .setDescription('Here are all the slash commands available across Gaming, Coding, Tasks, and Music!')
    .addFields(
      {
        name: '🎮 Gaming Commands',
        value:
          '• `/rps` — Play Rock, Paper, Scissors with interactive buttons\n' +
          '• `/tictactoe [opponent]` — Play interactive 3x3 Tic-Tac-Toe vs Bot or a friend\n' +
          '• `/trivia [category]` — Interactive multiple-choice trivia quiz (Gaming, Tech, Science)\n' +
          '• `/dice [count] [sides] [modifier]` — Roll customizable dice (e.g. 2d6, 1d20)\n' +
          '• `/coinflip` — Flip a coin (Heads or Tails)\n' +
          '• `/freedeals [platform]` — Browse active 100% free PC games (Steam, Epic, GOG)\n' +
          '• `/mcstatus <server>` — Check Minecraft server ping, players & status\n'
      },
      {
        name: '💻 Coding Commands',
        value:
          '• `/run <language> <code> [stdin]` — Run code in Python, JS, TS, C++, Rust, Go, Java\n' +
          '• `/github repo|user <query>` — Inspect GitHub repositories or user profiles\n' +
          '• `/docs <source> <topic>` — Quick documentation lookup (MDN, Python, React, Rust, Docker)\n' +
          '• `/snippet save|get|list|delete` — Save and manage reusable code snippets\n' +
          '• `/format <language> <code>` — Prettify and highlight code blocks with line numbers\n'
      },
      {
        name: '📋 Tasks & Utilities',
        value:
          '• `/todo add|list|complete|clear` — Manage your personal to-do list\n' +
          '• `/remind <time> <message>` — Set a timer reminder (e.g. `10m`, `1h`, `2d`)\n' +
          '• `/poll <question> <options...>` — Create interactive voting polls with live bars\n' +
          '• `/calc <expression>` — Evaluate math equations and expressions\n' +
          '• `/serverinfo` — View server statistics, channels, and member counts\n' +
          '• `/userinfo [target]` — View user avatar, join dates, and roles\n'
      },
      {
        name: '🎵 Music Commands',
        value:
          '• `/play <query>` — Play audio from YouTube, SoundCloud, or streams\n' +
          '• `/pause` — Pause current playback\n' +
          '• `/resume` — Resume paused music\n' +
          '• `/skip` — Skip to the next track\n' +
          '• `/stop` — Stop playback, clear queue, and leave voice channel\n' +
          '• `/queue` — View the current queue list\n' +
          '• `/nowplaying` — Show currently playing track with interactive controls\n' +
          '• `/volume <percent>` — Adjust playback volume (1% - 100%)\n'
      }
    )
    .setFooter({ text: 'All commands are slash commands (type / to begin)' });

  return interaction.reply({ embeds: [embed] });
}
