import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Display information about a server member or yourself')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The member to view (leave blank for yourself)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('target') || interaction.user;
  const member = interaction.guild?.members.cache.get(targetUser.id);

  const embed = createBaseEmbed('Tasks')
    .setTitle(`👤 User Info: ${targetUser.username}`)
    .addFields(
      { name: 'User Tag', value: targetUser.tag, inline: true },
      { name: 'User ID', value: `\`${targetUser.id}\``, inline: true },
      { name: 'Bot Account?', value: targetUser.bot ? 'Yes 🤖' : 'No 👤', inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true }
    );

  if (member) {
    embed.addFields(
      { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: 'Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(' ') || 'None', inline: false }
    );
  }

  embed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }));

  return interaction.reply({ embeds: [embed] });
}
