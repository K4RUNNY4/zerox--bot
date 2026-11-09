import { SlashCommandBuilder } from 'discord.js';
import { getQueue } from '../../music/queue.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Adjust the playback volume (1% to 100%)')
  .addIntegerOption(option =>
    option.setName('percent')
      .setDescription('Volume level (1-100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  );

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue || !queue.isPlaying) {
    return interaction.reply({
      embeds: [createErrorEmbed('There is no song currently playing!')],
      ephemeral: true
    });
  }

  const percent = interaction.options.getInteger('percent');
  queue.volume = percent;

  if (queue.currentResource && queue.currentResource.volume) {
    queue.currentResource.volume.setVolume(percent / 100);
  }

  return interaction.reply({
    embeds: [createSuccessEmbed('Volume Adjusted', `Playback volume set to **${percent}%**`)]
  });
}
