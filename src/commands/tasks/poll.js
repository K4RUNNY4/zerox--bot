import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create an interactive poll with live vote buttons')
  .addStringOption(opt => opt.setName('question').setDescription('Poll question').setRequired(true))
  .addStringOption(opt => opt.setName('option1').setDescription('First option').setRequired(true))
  .addStringOption(opt => opt.setName('option2').setDescription('Second option').setRequired(true))
  .addStringOption(opt => opt.setName('option3').setDescription('Third option').setRequired(false))
  .addStringOption(opt => opt.setName('option4').setDescription('Fourth option').setRequired(false));

export async function execute(interaction) {
  const question = interaction.options.getString('question');
  const opt1 = interaction.options.getString('option1');
  const opt2 = interaction.options.getString('option2');
  const opt3 = interaction.options.getString('option3');
  const opt4 = interaction.options.getString('option4');

  const options = [opt1, opt2];
  if (opt3) options.push(opt3);
  if (opt4) options.push(opt4);

  const votes = options.map(() => 0);
  const userVotes = new Map(); // userId -> optionIndex

  function generateProgressBar(percentage) {
    const totalBars = 10;
    const filledBars = Math.round((percentage / 100) * totalBars);
    return '█'.repeat(filledBars) + '░'.repeat(totalBars - filledBars);
  }

  function generateEmbed() {
    const totalVotes = votes.reduce((a, b) => a + b, 0);
    const embed = createBaseEmbed('Tasks')
      .setTitle(`📊 Poll: ${question}`)
      .setFooter({ text: `Created by ${interaction.user.username} | Total votes: ${totalVotes}` });

    let description = '';
    options.forEach((opt, idx) => {
      const count = votes[idx];
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      const bar = generateProgressBar(pct);
      description += `**Option ${idx + 1}: ${opt}**\n${bar} ${pct}% (${count} vote${count === 1 ? '' : 's'})\n\n`;
    });

    embed.setDescription(description.trim());
    return embed;
  }

  function generateButtons(disabled = false) {
    const row = new ActionRowBuilder();
    options.forEach((opt, idx) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_vote_${idx}`)
          .setLabel(`Option ${idx + 1}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled)
      );
    });
    return [row];
  }

  const message = await interaction.reply({
    embeds: [generateEmbed()],
    components: generateButtons(),
    fetchReply: true
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 24 * 60 * 60 * 1000 // 24 hours
  });

  collector.on('collect', async i => {
    const optIdx = parseInt(i.customId.replace('poll_vote_', ''), 10);
    const prevVote = userVotes.get(i.user.id);

    if (prevVote === optIdx) {
      // Toggle unvote
      votes[optIdx]--;
      userVotes.delete(i.user.id);
      await i.reply({ content: `Removed your vote for **Option ${optIdx + 1}**`, ephemeral: true });
    } else {
      if (prevVote !== undefined) {
        votes[prevVote]--;
      }
      votes[optIdx]++;
      userVotes.set(i.user.id, optIdx);
      await i.reply({ content: `You voted for **Option ${optIdx + 1}: ${options[optIdx]}**`, ephemeral: true });
    }

    await interaction.editReply({
      embeds: [generateEmbed()],
      components: generateButtons()
    });
  });
}
