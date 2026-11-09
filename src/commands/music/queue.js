import { SlashCommandBuilder } from 'discord.js';
import { getQueue } from '../../music/queue.js';
import { createBaseEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('View the current music queue');

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue || (!queue.currentSong && queue.songs.length === 0)) {
    return interaction.reply({
      embeds: [createErrorEmbed('The queue is currently empty!')],
      ephemeral: true
    });
  }

  const embed = createBaseEmbed('Music')
    .setTitle(`🎶 Queue for ${interaction.guild.name}`)
    .addFields({
      name: 'Now Playing',
      value: queue.currentSong
        ? `[**${queue.currentSong.title}**](${queue.currentSong.url}) | \`${queue.currentSong.duration}\` | Requested by ${queue.currentSong.requestedBy}`
        : 'Nothing currently playing'
    });

  if (queue.songs.length > 0) {
    const songList = queue.songs
      .slice(0, 10)
      .map((song, i) => `\`${i + 1}.\` [**${song.title}**](${song.url}) | \`${song.duration}\` | ${song.requestedBy}`)
      .join('\n');

    const remaining = queue.songs.length > 10 ? `\n*...and ${queue.songs.length - 10} more*` : '';
    embed.addFields({
      name: `Upcoming Tracks (${queue.songs.length})`,
      value: `${songList}${remaining}`
    });
  } else {
    embed.addFields({
      name: 'Upcoming Tracks',
      value: 'No more songs in queue.'
    });
  }

  return interaction.reply({ embeds: [embed] });
}
