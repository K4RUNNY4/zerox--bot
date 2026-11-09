import { SlashCommandBuilder } from 'discord.js';
import { getQueue } from '../../music/queue.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the currently playing track');

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue || !queue.isPlaying) {
    return interaction.reply({
      embeds: [createErrorEmbed('There is no song currently playing!')],
      ephemeral: true
    });
  }

  const success = queue.player.pause();
  if (success) {
    return interaction.reply({
      embeds: [createSuccessEmbed('Paused', 'Music playback has been paused. Use `/resume` to continue.')]
    });
  } else {
    return interaction.reply({
      embeds: [createErrorEmbed('Failed to pause playback or player is already paused.')],
      ephemeral: true
    });
  }
}
