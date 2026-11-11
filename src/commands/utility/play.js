import { SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import play from 'play-dl';
import { createBaseEmbed } from '../../utils/embeds.js';

const queues = new Map();

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube in your voice channel')
  .addStringOption(opt => 
    opt.setName('query')
      .setDescription('Song name or YouTube URL')
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('query');
  const channel = interaction.member.voice.channel;

  if (!channel) {
    return interaction.editReply('❌ You need to join a voice channel first!');
  }

  try {
    let songInfo;
    if (play.yt_validate(query) === 'video') {
      const info = await play.video_info(query);
      songInfo = { title: info.video_details.title, url: info.video_details.url };
    } else {
      const searchResults = await play.search(query, { limit: 1 });
      if (!searchResults || searchResults.length === 0) {
        return interaction.editReply('❌ No songs found for your query!');
      }
      songInfo = { title: searchResults[0].title, url: searchResults[0].url };
    }

    let serverQueue = queues.get(interaction.guildId);

    if (!serverQueue) {
      serverQueue = {
        textChannel: interaction.channel,
        voiceChannel: channel,
        connection: null,
        player: createAudioPlayer(),
        songs: []
      };
      queues.set(interaction.guildId, serverQueue);
      serverQueue.songs.push(songInfo);

      try {
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        serverQueue.connection = connection;
        connection.subscribe(serverQueue.player);

        serverQueue.player.on(AudioPlayerStatus.Idle, () => {
          serverQueue.songs.shift();
          if (serverQueue.songs.length > 0) {
            playSong(interaction.guildId, serverQueue.songs[0]);
          } else {
            serverQueue.connection.destroy();
            queues.delete(interaction.guildId);
          }
        });

        playSong(interaction.guildId, serverQueue.songs[0]);
        
        const embed = createBaseEmbed('Music Player')
          .setTitle('🎶 Now Playing')
          .setDescription(`[${songInfo.title}](${songInfo.url})`);
        return interaction.editReply({ embeds: [embed] });

      } catch (err) {
        console.error(err);
        queues.delete(interaction.guildId);
        return interaction.editReply('❌ Could not join the voice channel.');
      }
    } else {
      serverQueue.songs.push(songInfo);
      const embed = createBaseEmbed('Music Player')
        .setTitle('➕ Added to Queue')
        .setDescription(`[${songInfo.title}](${songInfo.url})`);
      return interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error(error);
    return interaction.editReply(`❌ An error occurred: \`${error.message}\``);
  }
}

async function playSong(guildId, song) {
  const serverQueue = queues.get(guildId);
  if (!song) {
    serverQueue.connection.destroy();
    queues.delete(guildId);
    return;
  }

  try {
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    serverQueue.player.play(resource);
  } catch (err) {
    console.error(err);
  }
}
