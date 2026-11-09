import { SlashCommandBuilder } from 'discord.js';
import { getQueue, createQueue, searchTrack, playNext } from '../../music/queue.js';
import { createBaseEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube, soundcloud or direct stream URL')
  .addStringOption(option =>
    option.setName('query')
      .setDescription('Song title, artist, or URL')
      .setRequired(true)
  );

export async function execute(interaction) {
  const query = interaction.options.getString('query');
  const voiceChannel = interaction.member.voice?.channel;

  if (!voiceChannel) {
    return interaction.reply({
      embeds: [createErrorEmbed('You must be in a voice channel to use this command!')],
      ephemeral: true
    });
  }

  await interaction.deferReply();

  try {
    const track = await searchTrack(query, `<@${interaction.user.id}>`);
    if (!track) {
      return interaction.editReply({
        embeds: [createErrorEmbed(`No results found for \`${query}\`. Try different keywords.`)]
      });
    }

    let queue = getQueue(interaction.guild.id);
    if (!queue) {
      queue = await createQueue(interaction);
    }

    queue.songs.push(track);

    if (!queue.isPlaying) {
      await interaction.editReply({
        embeds: [
          createBaseEmbed('Music')
            .setTitle('🎵 Track Loaded')
            .setDescription(`Starting playback for [**${track.title}**](${track.url})`)
        ]
      });
      playNext(interaction.guild.id);
    } else {
      const position = queue.songs.length;
      const embed = createBaseEmbed('Music')
        .setTitle('➕ Added to Queue')
        .setDescription(`[**${track.title}**](${track.url})`)
        .addFields(
          { name: 'Duration', value: `\`${track.duration}\``, inline: true },
          { name: 'Position in Queue', value: `#${position}`, inline: true },
          { name: 'Requested By', value: track.requestedBy, inline: true }
        );

      if (track.thumbnail) {
        embed.setThumbnail(track.thumbnail);
      }

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Play command error:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(`Failed to play song: ${error.message}`)]
    });
  }
}
