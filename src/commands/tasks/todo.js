import { SlashCommandBuilder } from 'discord.js';
import { readData, writeData } from '../../utils/storage.js';
import { createBaseEmbed, createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('todo')
  .setDescription('Manage your personal to-do list')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add a new item to your to-do list')
      .addStringOption(opt => opt.setName('task').setDescription('What do you need to do?').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('View your active to-do list')
  )
  .addSubcommand(sub =>
    sub.setName('complete')
      .setDescription('Mark a task as completed')
      .addIntegerOption(opt => opt.setName('index').setDescription('Task number from /todo list').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('clear')
      .setDescription('Clear all your completed tasks')
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const userId = interaction.user.id;
  const dataStore = readData();

  if (!dataStore.todos) dataStore.todos = {};
  if (!dataStore.todos[userId]) dataStore.todos[userId] = [];

  const userTodos = dataStore.todos[userId];

  if (subcommand === 'add') {
    const task = interaction.options.getString('task').trim();
    userTodos.push({
      text: task,
      completed: false,
      createdAt: new Date().toISOString()
    });
    writeData(dataStore);

    return interaction.reply({
      embeds: [createSuccessEmbed('Task Added', `Added: **${task}**\nUse \`/todo list\` to see all your tasks.`)]
    });
  }

  if (subcommand === 'list') {
    if (userTodos.length === 0) {
      return interaction.reply({
        embeds: [createBaseEmbed('Tasks').setTitle('📝 Your To-Do List').setDescription('Your to-do list is empty! Add tasks with `/todo add`.')]
      });
    }

    const items = userTodos.map((t, idx) => {
      const status = t.completed ? '~~' : '';
      const icon = t.completed ? '✅' : '⏳';
      return `${idx + 1}. ${icon} ${status}${t.text}${status}`;
    }).join('\n');

    const embed = createBaseEmbed('Tasks')
      .setTitle(`📝 To-Do List for ${interaction.user.username}`)
      .setDescription(items)
      .setFooter({ text: 'Use /todo complete <index> to toggle completion' });

    return interaction.reply({ embeds: [embed] });
  }

  if (subcommand === 'complete') {
    const index = interaction.options.getInteger('index');
    if (index < 1 || index > userTodos.length) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Invalid task index. Must be between 1 and ${userTodos.length}.`)],
        ephemeral: true
      });
    }

    const target = userTodos[index - 1];
    target.completed = !target.completed;
    writeData(dataStore);

    return interaction.reply({
      embeds: [createSuccessEmbed('Task Updated', `Task #${index} (${target.text}) marked as ${target.completed ? 'completed ✅' : 'pending ⏳'}.`)]
    });
  }

  if (subcommand === 'clear') {
    const beforeCount = userTodos.length;
    dataStore.todos[userId] = userTodos.filter(t => !t.completed);
    const removedCount = beforeCount - dataStore.todos[userId].length;
    writeData(dataStore);

    return interaction.reply({
      embeds: [createSuccessEmbed('Tasks Cleared', `Removed **${removedCount}** completed task(s).`)]
    });
  }
}
