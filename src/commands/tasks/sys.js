import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';
import os from 'node:os';

export const data = new SlashCommandBuilder()
  .setName('sys')
  .setDescription('Check bot container performance and system resource statistics');

export async function execute(interaction) {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  const memoryUsage = process.memoryUsage();
  const heapMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);

  const embed = createBaseEmbed('System Monitor')
    .setTitle('⚡ Zerox Bot Performance Diagnostics')
    .addFields(
      { name: 'Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
      { name: 'Memory Heap', value: `${heapMB} MB`, inline: true },
      { name: 'Total RSS Memory', value: `${rssMB} MB`, inline: true },
      { name: 'Platform / OS', value: `${os.type()} (${os.release()})`, inline: false }
    );

  return interaction.reply({ embeds: [embed] });
}

