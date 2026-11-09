import { SlashCommandBuilder } from 'discord.js';
import { getQueue } from '../../music/queue.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resume paused music playback');

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue || !queue.currentSong) {
    return interaction.reply({
      embeds: [createErrorEmbed('There is no song to resume!')],
      ephemeral: true
    });
  }

  const success = queue.player.unpause();
  if (success) {
    return interaction.reply({
      embeds: [createSuccessEmbed('Resumed', `Resumed playing [**${queue.currentSong.title}**](${queue.currentSong.url})`)]
    });
  } else {
    return interaction.reply({
      embeds: [createErrorEmbed('Failed to resume playback or player is already playing.')],
      ephemeral: true
    });
  }
}
