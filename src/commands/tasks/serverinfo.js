import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Display detailed information and statistics about this server');

export async function execute(interaction) {
  const guild = interaction.guild;
  if (!guild) {
    return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
  }

  const owner = await guild.fetchOwner();
  const channels = guild.channels.cache;
  const textCount = channels.filter(c => c.type === 0).size;
  const voiceCount = channels.filter(c => c.type === 2).size;
  const memberCount = guild.memberCount;
  const roleCount = guild.roles.cache.size;

  const embed = createBaseEmbed('Tasks')
    .setTitle(`🏰 Server Info: ${guild.name}`)
    .addFields(
      { name: 'Owner', value: `${owner.user.tag} (<@${owner.id}>)`, inline: true },
      { name: 'Server ID', value: `\`${guild.id}\``, inline: true },
      { name: 'Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
      { name: 'Members', value: `👥 ${memberCount}`, inline: true },
      { name: 'Channels', value: `💬 ${textCount} text | 🔊 ${voiceCount} voice`, inline: true },
      { name: 'Roles', value: `🏷️ ${roleCount} roles`, inline: true },
      { name: 'Boost Tier', value: `🚀 Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true }
    );

  if (guild.iconURL()) {
    embed.setThumbnail(guild.iconURL({ dynamic: true }));
  }

  return interaction.reply({ embeds: [embed] });
}
