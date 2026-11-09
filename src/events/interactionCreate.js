import { Events } from 'discord.js';
import { getQueue, deleteQueue } from '../music/queue.js';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embeds.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction, client) {
  // Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      const replyOptions = {
        embeds: [createErrorEmbed(`An error occurred while executing this command: ${error.message}`)],
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyOptions).catch(() => {});
      } else {
        await interaction.reply(replyOptions).catch(() => {});
      }
    }
    return;
  }

  // Handle Global Button Controls (e.g. Now Playing Controls)
  if (interaction.isButton()) {
    const customId = interaction.customId;

    if (customId === 'music_toggle_pause') {
      const queue = getQueue(interaction.guildId);
      if (!queue || !queue.currentSong) {
        return interaction.reply({ content: 'No song currently playing.', ephemeral: true });
      }

      if (queue.player.state.status === 'paused') {
        queue.player.unpause();
        return interaction.reply({ content: '▶️ Resumed playback.', ephemeral: true });
      } else {
        queue.player.pause();
        return interaction.reply({ content: '⏸️ Paused playback.', ephemeral: true });
      }
    }

    if (customId === 'music_skip') {
      const queue = getQueue(interaction.guildId);
      if (!queue || !queue.currentSong) {
        return interaction.reply({ content: 'No song currently playing.', ephemeral: true });
      }
      const skipped = queue.currentSong.title;
      queue.player.stop();
      return interaction.reply({ content: `⏭️ Skipped **${skipped}**.`, ephemeral: true });
    }

    if (customId === 'music_stop') {
      const queue = getQueue(interaction.guildId);
      if (!queue) {
        return interaction.reply({ content: 'Player already stopped.', ephemeral: true });
      }
      deleteQueue(interaction.guildId);
      return interaction.reply({ content: '⏹️ Stopped playback and left channel.', ephemeral: true });
    }
  }
}
