import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('trivia')
  .setDescription('Test your knowledge with an interactive trivia question!')
  .addStringOption(option =>
    option.setName('category')
      .setDescription('Topic category')
      .setRequired(false)
      .addChoices(
        { name: 'Gaming (Video Games)', value: '15' },
        { name: 'Coding & Computers', value: '18' },
        { name: 'General Science', value: '17' },
        { name: 'Random Any Topic', value: 'random' }
      )
  );

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&rsquo;/g, "'");
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function execute(interaction) {
  const categoryChoice = interaction.options.getString('category') || '15';
  await interaction.deferReply();

  let url = 'https://opentdb.com/api.php?amount=1&type=multiple';
  if (categoryChoice !== 'random') {
    url += `&category=${categoryChoice}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return interaction.editReply('❌ Could not fetch a trivia question right now. Try again.');
    }

    const item = data.results[0];
    const question = decodeHtml(item.question);
    const correctAnswer = decodeHtml(item.correct_answer);
    const incorrectAnswers = item.incorrect_answers.map(decodeHtml);

    const allAnswers = shuffle([correctAnswer, ...incorrectAnswers]);
    const correctIndex = allAnswers.indexOf(correctAnswer);

    const labels = ['A', 'B', 'C', 'D'];
    const row = new ActionRowBuilder();

    allAnswers.forEach((ans, idx) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`trivia_${idx}`)
          .setLabel(`${labels[idx]}: ${ans.length > 70 ? ans.substring(0, 67) + '...' : ans}`)
          .setStyle(ButtonStyle.Primary)
      );
    });

    const embed = createBaseEmbed('Gaming')
      .setTitle(`🧠 Trivia: ${decodeHtml(item.category)}`)
      .setDescription(`**${question}**\n\n*Difficulty: ${item.difficulty.toUpperCase()}*`)
      .setFooter({ text: `Question for ${interaction.user.username} | 30 seconds to answer` });

    const message = await interaction.editReply({
      embeds: [embed],
      components: [row]
    });

    try {
      const response = await message.awaitMessageComponent({
        filter: i => i.user.id === interaction.user.id && i.customId.startsWith('trivia_'),
        time: 30_000,
        componentType: ComponentType.Button
      });

      const selectedIdx = parseInt(response.customId.replace('trivia_', ''), 10);
      const isCorrect = selectedIdx === correctIndex;

      const resultEmbed = createBaseEmbed('Gaming')
        .setColor(isCorrect ? 0x2ECC71 : 0xE74C3C)
        .setTitle(isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect!')
        .setDescription(`**${question}**\n\n` +
          `• **Correct Answer:** ${labels[correctIndex]}: **${correctAnswer}**\n` +
          `• **Your Choice:** ${labels[selectedIdx]}: ${allAnswers[selectedIdx]}`)
        .setFooter({ text: `Answered by ${interaction.user.username}` });

      const finalRow = new ActionRowBuilder();
      allAnswers.forEach((ans, idx) => {
        let style = ButtonStyle.Secondary;
        if (idx === correctIndex) style = ButtonStyle.Success;
        else if (idx === selectedIdx && !isCorrect) style = ButtonStyle.Danger;

        finalRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`trivia_done_${idx}`)
            .setLabel(`${labels[idx]}: ${ans.length > 70 ? ans.substring(0, 67) + '...' : ans}`)
            .setStyle(style)
            .setDisabled(true)
        );
      });

      await response.update({
        embeds: [resultEmbed],
        components: [finalRow]
      });
    } catch {
      const timeoutEmbed = createBaseEmbed('Gaming')
        .setColor(0xE74C3C)
        .setTitle('⏱️ Trivia Timed Out')
        .setDescription(`**${question}**\n\nThe correct answer was: **${labels[correctIndex]}: ${correctAnswer}**`);

      await interaction.editReply({
        embeds: [timeoutEmbed],
        components: []
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Trivia error:', err);
    await interaction.editReply('❌ Failed to fetch trivia question.');
  }
}
