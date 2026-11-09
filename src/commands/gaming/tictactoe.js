import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('tictactoe')
  .setDescription('Play Tic-Tac-Toe against the bot or a friend!')
  .addUserOption(option =>
    option.setName('opponent')
      .setDescription('Friend to play against (leave blank to play against Bot)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const opponent = interaction.options.getUser('opponent');
  const isVsBot = !opponent || opponent.id === interaction.client.user.id;

  if (opponent && opponent.id === interaction.user.id) {
    return interaction.reply({
      content: '❌ You cannot play Tic-Tac-Toe against yourself!',
      ephemeral: true
    });
  }

  const playerX = interaction.user;
  const playerO = isVsBot ? null : opponent;
  let currentTurn = 'X'; // X starts
  const board = Array(9).fill(null);

  function createRows(disabled = false) {
    const rows = [];
    for (let r = 0; r < 3; r++) {
      const row = new ActionRowBuilder();
      for (let c = 0; c < 3; c++) {
        const idx = r * 3 + c;
        const val = board[idx];
        const btn = new ButtonBuilder()
          .setCustomId(`ttt_${idx}`)
          .setLabel(val || '\u200B')
          .setStyle(
            val === 'X' ? ButtonStyle.Primary :
            val === 'O' ? ButtonStyle.Danger :
            ButtonStyle.Secondary
          )
          .setDisabled(disabled || val !== null);
        row.addComponents(btn);
      }
      rows.push(row);
    }
    return rows;
  }

  function checkWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
  }

  function makeBotMove() {
    const available = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) available.push(i);
    }
    if (available.length === 0) return;
    const choice = available[Math.floor(Math.random() * available.length)];
    board[choice] = 'O';
  }

  const getStatusText = () => {
    if (isVsBot) {
      return currentTurn === 'X' ? `Your turn (${playerX.username} - ❌)` : 'Bot is thinking...';
    } else {
      return currentTurn === 'X'
        ? `${playerX.username}'s turn (❌)`
        : `${playerO.username}'s turn (⭕)`;
    }
  };

  const embed = createBaseEmbed('Gaming')
    .setTitle('🕹️ Tic-Tac-Toe')
    .setDescription(`**${playerX.username} (❌)** vs **${isVsBot ? 'Bot 🤖' : playerO.username} (⭕)**\n\n${getStatusText()}`);

  const message = await interaction.reply({
    embeds: [embed],
    components: createRows(),
    fetchReply: true
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120_000
  });

  collector.on('collect', async i => {
    // Validate turn
    if (currentTurn === 'X' && i.user.id !== playerX.id) {
      return i.reply({ content: "It is not your turn!", ephemeral: true });
    }
    if (!isVsBot && currentTurn === 'O' && i.user.id !== playerO.id) {
      return i.reply({ content: "It is not your turn!", ephemeral: true });
    }

    const idx = parseInt(i.customId.replace('ttt_', ''), 10);
    if (board[idx] !== null) {
      return i.reply({ content: "That spot is already taken!", ephemeral: true });
    }

    board[idx] = currentTurn;
    let winner = checkWinner();

    if (winner) {
      collector.stop(winner);
      await i.deferUpdate();
      return;
    }

    if (isVsBot) {
      currentTurn = 'O';
      makeBotMove();
      winner = checkWinner();
      if (winner) {
        collector.stop(winner);
        await i.deferUpdate();
        return;
      }
      currentTurn = 'X';
    } else {
      currentTurn = currentTurn === 'X' ? 'O' : 'X';
    }

    embed.setDescription(`**${playerX.username} (❌)** vs **${isVsBot ? 'Bot 🤖' : playerO.username} (⭕)**\n\n${getStatusText()}`);
    await i.update({
      embeds: [embed],
      components: createRows()
    });
  });

  collector.on('end', async (collected, reason) => {
    let resultMessage = '';
    let color = 0xF1C40F;

    if (reason === 'X') {
      resultMessage = `🎉 **${playerX.username} (❌)** wins!`;
      color = 0x2ECC71;
    } else if (reason === 'O') {
      resultMessage = isVsBot ? '🤖 **Bot (⭕)** wins!' : `🎉 **${playerO.username} (⭕)** wins!`;
      color = 0xE74C3C;
    } else if (reason === 'draw') {
      resultMessage = "🤝 It's a draw!";
    } else {
      resultMessage = '⏱️ Game timed out due to inactivity.';
    }

    const finalEmbed = createBaseEmbed('Gaming')
      .setColor(color)
      .setTitle('🕹️ Tic-Tac-Toe — Game Over')
      .setDescription(`**${playerX.username} (❌)** vs **${isVsBot ? 'Bot 🤖' : playerO.username} (⭕)**\n\n${resultMessage}`);

    await interaction.editReply({
      embeds: [finalEmbed],
      components: createRows(true)
    }).catch(() => {});
  });
}
