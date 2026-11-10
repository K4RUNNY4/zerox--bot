import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('mc')
  .setDescription('Check live status of a Minecraft server')
  .addStringOption(opt => opt.setName('ip').setDescription('Server IP or domain (e.g. hypixel.net)').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const ip = interaction.options.getString('ip');

  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
    const data = await res.json();

    if (!data.online) {
      return interaction.editReply(`❌ The Minecraft server **${ip}** is currently offline or unreachable.`);
    }

    const embed = createBaseEmbed('Minecraft Server Status')
      .setTitle(`🟢 Server Online: ${ip}`)
      .addFields(
        { name: 'Players Online', value: `${data.players.online} / ${data.players.max}`, inline: true },
        { name: 'Version', value: data.version || 'Unknown', inline: true },
        { name: 'MOTD', value: data.motd?.clean?.join('\n') || 'No MOTD' }
      );

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return interaction.editReply(`❌ Failed to fetch server status: \`${error.message}\``);
  }
}

