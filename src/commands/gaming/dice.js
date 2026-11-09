import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('dice')
  .setDescription('Roll one or more dice (e.g., 2d6, 1d20, 3d10)')
  .addIntegerOption(option =>
    option.setName('count')
      .setDescription('Number of dice to roll (default: 1, max: 25)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(25)
  )
  .addIntegerOption(option =>
    option.setName('sides')
      .setDescription('Sides per die (e.g. 6, 20, 100 — default: 6)')
      .setRequired(false)
      .setMinValue(2)
      .setMaxValue(1000)
  )
  .addIntegerOption(option =>
    option.setName('modifier')
      .setDescription('Bonus or penalty to add to the total (e.g. +5 or -2)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const count = interaction.options.getInteger('count') || 1;
  const sides = interaction.options.getInteger('sides') || 6;
  const modifier = interaction.options.getInteger('modifier') || 0;

  const rolls = [];
  let sum = 0;

  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    sum += roll;
  }

  const finalTotal = sum + modifier;
  const modString = modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` - ${Math.abs(modifier)}` : '';

  const embed = createBaseEmbed('Gaming')
    .setTitle(`🎲 Dice Roll (${count}d${sides}${modString})`)
    .addFields(
      { name: 'Individual Rolls', value: rolls.map(r => `\`${r}\``).join(', '), inline: false },
      { name: 'Sum of Rolls', value: `\`${sum}\``, inline: true },
      { name: 'Modifier', value: `\`${modifier >= 0 ? '+' : ''}${modifier}\``, inline: true },
      { name: 'Final Total', value: `🎯 **${finalTotal}**`, inline: true }
    )
    .setFooter({ text: `Rolled by ${interaction.user.username}` });

  return interaction.reply({ embeds: [embed] });
}
