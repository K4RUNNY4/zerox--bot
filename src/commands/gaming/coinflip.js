import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a coin (Heads or Tails)');

export async function execute(interaction) {
  const isHeads = Math.random() < 0.5;
  const result = isHeads ? 'Heads' : 'Tails';
  const emoji = isHeads ? '🪙' : '🪙';

  const embed = createBaseEmbed('Gaming')
    .setTitle(`${emoji} Coin Flip`)
    .setDescription(`The coin landed on **${result}**!`)
    .setFooter({ text: `Flipped by ${interaction.user.username}` });

  return interaction.reply({ embeds: [embed] });
}
