import { SlashCommandBuilder } from 'discord.js';
import { getQueue } from '../../music/queue.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the currently playing track');

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue || !queue.currentSong) {
    return interaction.reply({
      embeds: [createErrorEmbed('There is no song currently playing to skip!')],
      ephemeral: true
    });
  }

  const skippedTitle = queue.currentSong.title;
  queue.player.stop(); // Causes Idle event, automatically triggering playNext

  return interaction.reply({
    embeds: [createSuccessEmbed('Skipped', `Skipped **${skippedTitle}**`)]
  });
}
