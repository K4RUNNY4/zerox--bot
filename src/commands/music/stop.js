import { SlashCommandBuilder } from 'discord.js';
import { getQueue, deleteQueue } from '../../music/queue.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop music playback, clear queue, and leave voice channel');

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue) {
    return interaction.reply({
      embeds: [createErrorEmbed('The bot is not currently in a voice channel!')],
      ephemeral: true
    });
  }

  deleteQueue(interaction.guild.id);

  return interaction.reply({
    embeds: [createSuccessEmbed('Stopped', 'Music playback stopped, queue cleared, and disconnected from the channel.')]
  });
}
