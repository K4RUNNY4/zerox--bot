import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed, createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Set a reminder with a timer (e.g., 10m, 1h, 30s)')
  .addStringOption(option =>
    option.setName('time')
      .setDescription('Time duration (e.g. 30s, 10m, 2h, 1d)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('message')
      .setDescription('What do you want to be reminded about?')
      .setRequired(true)
  );

function parseDuration(str) {
  const match = str.trim().toLowerCase().match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return null;
  const val = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return val * 1000;
    case 'm': return val * 60 * 1000;
    case 'h': return val * 3600 * 1000;
    case 'd': return val * 86400 * 1000;
    default: return null;
  }
}

export async function execute(interaction) {
  const timeStr = interaction.options.getString('time');
  const message = interaction.options.getString('message');

  const durationMs = parseDuration(timeStr);
  if (!durationMs || durationMs < 1000 || durationMs > 7 * 86400 * 1000) {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid duration format! Use formats like `30s`, `10m`, `2h`, or `1d` (max 7 days).')],
      ephemeral: true
    });
  }

  const dueTimestamp = Math.floor((Date.now() + durationMs) / 1000);
  const channel = interaction.channel;
  const user = interaction.user;

  // Set timeout for the reminder
  setTimeout(async () => {
    try {
      const reminderEmbed = createBaseEmbed('Tasks')
        .setTitle('🔔 Reminder Due!')
        .setDescription(`Hey <@${user.id}>, you asked me to remind you:\n\n**${message}**`)
        .setFooter({ text: 'Scheduled reminder' });

      await channel.send({
        content: `<@${user.id}>`,
        embeds: [reminderEmbed]
      });
    } catch (err) {
      console.error('Failed to deliver reminder:', err);
    }
  }, durationMs);

  return interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Reminder Scheduled',
        `I will remind you about **"${message}"** in **${timeStr}** (<t:${dueTimestamp}:R>).`
      )
    ]
  });
}
