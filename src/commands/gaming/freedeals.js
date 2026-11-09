import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('freedeals')
  .setDescription('Find currently 100% free PC games (Steam, Epic Games, GOG giveaways)')
  .addStringOption(option =>
    option.setName('platform')
      .setDescription('Filter by platform')
      .setRequired(false)
      .addChoices(
        { name: 'PC (All)', value: 'pc' },
        { name: 'Steam', value: 'steam' },
        { name: 'Epic Games Store', value: 'epic-games-store' },
        { name: 'GOG', value: 'gog' }
      )
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const platform = interaction.options.getString('platform') || 'pc';

  try {
    const res = await fetch(`https://www.gamerpower.com/api/giveaways?type=game&platform=${platform}`);
    if (!res.ok) {
      return interaction.editReply('❌ Could not fetch free game giveaways at this time.');
    }

    const games = await res.json();
    if (!Array.isArray(games) || games.length === 0) {
      return interaction.editReply('🎁 No active free game giveaways found right now. Check back soon!');
    }

    const topGames = games.slice(0, 5);
    const embed = createBaseEmbed('Gaming')
      .setTitle(`🎮 Free Games & Giveaways (${platform.toUpperCase()})`)
      .setDescription('Here are the top free PC games you can claim right now:')
      .setFooter({ text: 'Data provided by GamerPower' });

    topGames.forEach((game, index) => {
      const worth = game.worth && game.worth !== 'N/A' ? `~~${game.worth}~~ **FREE**` : '**FREE**';
      embed.addFields({
        name: `${index + 1}. ${game.title}`,
        value: `• **Platform:** ${game.platforms}\n• **Worth:** ${worth}\n• **Instructions:** ${game.instructions.substring(0, 100)}...\n• [**Claim Game Here**](${game.open_giveaway_url})`
      });
    });

    if (topGames[0].thumbnail) {
      embed.setThumbnail(topGames[0].thumbnail);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('Free deals error:', err);
    await interaction.editReply('❌ Failed to fetch game deals.');
  }
}
