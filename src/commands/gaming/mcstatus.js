import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('mcstatus')
  .setDescription('Check the status, ping, and player count of a Minecraft server')
  .addStringOption(option =>
    option.setName('server')
      .setDescription('Minecraft server address (e.g. hypixel.net or play.cubecraft.net)')
      .setRequired(true)
  );

export async function execute(interaction) {
  const address = interaction.options.getString('server');
  await interaction.deferReply();

  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`);
    if (!res.ok) {
      return interaction.editReply(`❌ Could not reach server status checker.`);
    }

    const data = await res.json();
    if (!data.online) {
      const offlineEmbed = createBaseEmbed('Gaming')
        .setColor(0xE74C3C)
        .setTitle(`⛏️ Minecraft Server: ${address}`)
        .setDescription('🔴 **Server is currently Offline or unreachable.**');
      return interaction.editReply({ embeds: [offlineEmbed] });
    }

    const motd = (data.motd?.clean || []).join('\n') || 'No MOTD provided';
    const playersOnline = data.players?.online ?? 0;
    const playersMax = data.players?.max ?? 0;
    const version = data.version || 'Unknown';

    const embed = createBaseEmbed('Gaming')
      .setColor(0x2ECC71)
      .setTitle(`⛏️ Minecraft Server: ${address}`)
      .setDescription(`🟢 **Server is Online!**\n\n\`\`\`\n${motd}\n\`\`\``)
      .addFields(
        { name: 'Players Online', value: `👥 **${playersOnline}** / ${playersMax}`, inline: true },
        { name: 'Version', value: `📦 ${version}`, inline: true },
        { name: 'IP / Host', value: `🌐 \`${data.hostname || data.ip || address}\``, inline: true }
      );

    if (data.icon) {
      // mcsrvstat returns base64 png in data.icon if present, or icon url
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('MCStatus error:', err);
    await interaction.editReply('❌ Failed to retrieve server status.');
  }
}
