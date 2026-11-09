import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { getQueue } from '../../music/queue.js';
import { createBaseEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('nowplaying')
  .setDescription('Show details and controls for the currently playing track');

export async function execute(interaction) {
  const queue = getQueue(interaction.guild.id);
  if (!queue || !queue.currentSong) {
    return interaction.reply({
      embeds: [createErrorEmbed('There is no song currently playing!')],
      ephemeral: true
    });
  }

  const song = queue.currentSong;
  const embed = createBaseEmbed('Music')
    .setTitle('🎶 Now Playing')
    .setDescription(`[**${song.title}**](${song.url})`)
    .addFields(
      { name: 'Duration', value: `\`${song.duration}\``, inline: true },
      { name: 'Volume', value: `${queue.volume}%`, inline: true },
      { name: 'Requested By', value: song.requestedBy, inline: true },
      { name: 'Status', value: queue.player.state.status === 'paused' ? '⏸️ Paused' : '▶️ Playing', inline: true }
    );

  if (song.thumbnail) {
    embed.setThumbnail(song.thumbnail);
  }

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_toggle_pause')
      .setLabel(queue.player.state.status === 'paused' ? 'Resume' : 'Pause')
      .setEmoji(queue.player.state.status === 'paused' ? '▶️' : '⏸️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel('Skip')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel('Stop')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger)
  );

  return interaction.reply({
    embeds: [embed],
    components: [buttons]
  });
}
