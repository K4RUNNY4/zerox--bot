import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('rps')
  .setDescription('Play Rock, Paper, Scissors against the bot!');

const CHOICES = [
  { id: 'rock', label: 'Rock', emoji: '🪨' },
  { id: 'paper', label: 'Paper', emoji: '📄' },
  { id: 'scissors', label: 'Scissors', emoji: '✂️' }
];

export async function execute(interaction) {
  const row = new ActionRowBuilder().addComponents(
    CHOICES.map(c =>
      new ButtonBuilder()
        .setCustomId(`rps_${c.id}`)
        .setLabel(c.label)
        .setEmoji(c.emoji)
        .setStyle(ButtonStyle.Primary)
    )
  );

  const initialEmbed = createBaseEmbed('Gaming')
    .setTitle('🎮 Rock, Paper, Scissors')
    .setDescription('Choose your move by clicking a button below!')
    .setFooter({ text: 'You have 30 seconds to make a choice.' });

  const response = await interaction.reply({
    embeds: [initialEmbed],
    components: [row]
  });

  try {
    const confirmation = await response.awaitMessageComponent({
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('rps_'),
      time: 30_000,
      componentType: ComponentType.Button
    });

    const userChoice = confirmation.customId.replace('rps_', '');
    const botChoiceObj = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const botChoice = botChoiceObj.id;

    let result = '';
    let color = 0x5865F2;

    if (userChoice === botChoice) {
      result = "It's a Tie! 🤝";
      color = 0xF1C40F;
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'You Win! 🎉';
      color = 0x2ECC71;
    } else {
      result = 'Bot Wins! 🤖';
      color = 0xE74C3C;
    }

    const userObj = CHOICES.find(c => c.id === userChoice);

    const resultEmbed = createBaseEmbed('Gaming')
      .setColor(color)
      .setTitle(`🎮 Rock, Paper, Scissors — ${result}`)
      .addFields(
        { name: 'Your Move', value: `${userObj.emoji} **${userObj.label}**`, inline: true },
        { name: 'Bot Move', value: `${botChoiceObj.emoji} **${botChoiceObj.label}**`, inline: true }
      );

    const disabledRow = new ActionRowBuilder().addComponents(
      CHOICES.map(c =>
        new ButtonBuilder()
          .setCustomId(`rps_${c.id}_done`)
          .setLabel(c.label)
          .setEmoji(c.emoji)
          .setStyle(c.id === userChoice ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(true)
      )
    );

    await confirmation.update({
      embeds: [resultEmbed],
      components: [disabledRow]
    });
  } catch {
    await interaction.editReply({
      content: '⏱️ Game timed out! You took too long to pick a move.',
      components: []
    }).catch(() => {});
  }
}
