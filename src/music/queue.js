import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  demuxProbe,
  StreamType
} from '@discordjs/voice';
import { Ytdl } from '@distube/ytdl-core';
import play from 'play-dl';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import { createBaseEmbed, createErrorEmbed } from '../utils/embeds.js';

const queues = new Map();
const ytdl = new Ytdl();

export function getQueue(guildId) {
  return queues.get(guildId);
}

export function deleteQueue(guildId) {
  const queue = queues.get(guildId);
  if (queue) {
    if (queue.timeout) clearTimeout(queue.timeout);
    try {
      queue.player.stop();
      queue.connection.destroy();
    } catch (e) {
      // Ignored
    }
    queues.delete(guildId);
  }
}

export async function searchTrack(query, requestedBy) {
  // Check if it's already a YouTube URL
  if (query.startsWith('http://') || query.startsWith('https://')) {
    try {
      const info = await ytdl.getInfo(query);
      return {
        title: info.videoDetails.title,
        url: info.videoDetails.video_url,
        duration: formatSeconds(parseInt(info.videoDetails.lengthSeconds, 10)),
        durationSec: parseInt(info.videoDetails.lengthSeconds, 10),
        thumbnail: info.videoDetails.thumbnails?.[0]?.url || null,
        requestedBy
      };
    } catch {
      // Fallback: direct audio stream (e.g. mp3 / radio / soundcloud)
      return {
        title: query.split('/').pop().split('?')[0] || 'Audio Stream',
        url: query,
        duration: 'Live / Unknown',
        durationSec: 0,
        thumbnail: null,
        requestedBy,
        isDirectStream: true
      };
    }
  }

  // Text search via play-dl
  const results = await play.search(query, { limit: 1 });
  if (!results || results.length === 0) {
    return null;
  }

  const track = results[0];
  return {
    title: track.title,
    url: track.url,
    duration: track.durationRaw || formatSeconds(track.durationInSec || 0),
    durationSec: track.durationInSec || 0,
    thumbnail: track.thumbnails?.[0]?.url || null,
    requestedBy
  };
}

export async function createQueue(interaction) {
  const member = interaction.member;
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    throw new Error('You need to be in a voice channel to play music!');
  }

  const permissions = voiceChannel.permissionsFor(interaction.client.user);
  if (!permissions.has('Connect') || !permissions.has('Speak')) {
    throw new Error('I do not have permission to join or speak in your voice channel!');
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator
  });

  const player = createAudioPlayer();
  connection.subscribe(player);

  const queue = {
    guild: interaction.guild,
    voiceChannel,
    textChannel: interaction.channel,
    connection,
    player,
    songs: [],
    volume: 100,
    currentResource: null,
    currentSong: null,
    isPlaying: false,
    timeout: null
  };

  queues.set(interaction.guild.id, queue);

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
      ]);
    } catch {
      deleteQueue(interaction.guild.id);
    }
  });

  player.on(AudioPlayerStatus.Idle, () => {
    queue.currentSong = null;
    queue.isPlaying = false;
    playNext(interaction.guild.id);
  });

  player.on('error', (error) => {
    console.error(`[Guild ${interaction.guild.id}] Audio player error:`, error.message);
    queue.textChannel.send({
      embeds: [createErrorEmbed(`Playback error: ${error.message}`)]
    }).catch(() => {});
    playNext(interaction.guild.id);
  });

  return queue;
}

export async function playNext(guildId) {
  const queue = queues.get(guildId);
  if (!queue) return;

  if (queue.songs.length === 0) {
    queue.currentSong = null;
    queue.isPlaying = false;
    // Disconnect after 3 minutes of inactivity
    queue.timeout = setTimeout(() => {
      if (queue.songs.length === 0 && !queue.isPlaying) {
        queue.textChannel.send({
          embeds: [
            createBaseEmbed('Music')
              .setTitle('👋 Leaving Channel')
              .setDescription('Queue finished and no new songs added for 3 minutes. Disconnecting.')
          ]
        }).catch(() => {});
        deleteQueue(guildId);
      }
    }, 180_000);
    return;
  }

  if (queue.timeout) {
    clearTimeout(queue.timeout);
    queue.timeout = null;
  }

  const song = queue.songs.shift();
  queue.currentSong = song;
  queue.isPlaying = true;

  try {
    let resource;

    if (song.isDirectStream) {
      // Direct stream via FFmpeg
      const ffmpeg = spawn(ffmpegPath, [
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
        '-i', song.url,
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1'
      ]);
      resource = createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw,
        inlineVolume: true
      });
    } else {
      // YouTube stream via ytdl
      const stream = await ytdl.download(song.url, {
        filter: { hasAudio: true, hasVideo: false },
        quality: 'highestaudio'
      });
      const probe = await demuxProbe(stream);
      resource = createAudioResource(probe.stream, {
        inputType: probe.type,
        inlineVolume: true
      });
    }

    resource.volume.setVolume(queue.volume / 100);
    queue.currentResource = resource;
    queue.player.play(resource);

    const embed = createBaseEmbed('Music')
      .setTitle('🎶 Now Playing')
      .setDescription(`[**${song.title}**](${song.url})`)
      .addFields(
        { name: 'Duration', value: `\`${song.duration}\``, inline: true },
        { name: 'Requested By', value: song.requestedBy, inline: true },
        { name: 'Volume', value: `${queue.volume}%`, inline: true }
      );

    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }

    queue.textChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    console.error('Failed to stream song:', err);
    queue.textChannel.send({
      embeds: [createErrorEmbed(`Failed to play **${song.title}**: ${err.message}`)]
    }).catch(() => {});
    playNext(guildId);
  }
}

export function formatSeconds(totalSec) {
  if (isNaN(totalSec) || totalSec <= 0) return '0:00';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);

  const paddedSecs = secs.toString().padStart(2, '0');
  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, '0');
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins}:${paddedSecs}`;
}
