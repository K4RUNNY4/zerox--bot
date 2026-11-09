import { SlashCommandBuilder } from 'discord.js';
import { evaluate } from 'mathjs';
import { createBaseEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('calc')
  .setDescription('Evaluate a mathematical expression (e.g. 2 + 2, sqrt(144), 5 * (3 + 2)^2, sin(45 deg))')
  .addStringOption(option =>
    option.setName('expression')
      .setDescription('Math expression to evaluate')
      .setRequired(true)
  );

export async function execute(interaction) {
  const expression = interaction.options.getString('expression');

  try {
    const result = evaluate(expression);

    const embed = createBaseEmbed('Tasks')
      .setTitle('🧮 Calculator')
      .addFields(
        { name: 'Expression', value: `\`\`\`math\n${expression}\n\`\`\``, inline: false },
        { name: 'Result', value: `\`\`\`\n${result.toString()}\n\`\`\``, inline: false }
      )
      .setFooter({ text: `Calculated for ${interaction.user.username}` });

    return interaction.reply({ embeds: [embed] });
  } catch (err) {
    return interaction.reply({
      embeds: [createErrorEmbed(`Failed to calculate: ${err.message}`)],
      ephemeral: true
    });
  }
}
