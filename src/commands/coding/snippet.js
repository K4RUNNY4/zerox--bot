import { SlashCommandBuilder } from 'discord.js';
import { readData, writeData } from '../../utils/storage.js';
import { createBaseEmbed, createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('snippet')
  .setDescription('Save, retrieve, and manage code snippets')
  .addSubcommand(sub =>
    sub.setName('save')
      .setDescription('Save a reusable code snippet')
      .addStringOption(opt => opt.setName('name').setDescription('Snippet name').setRequired(true))
      .addStringOption(opt => opt.setName('language').setDescription('Code language (e.g. js, python, rust)').setRequired(true))
      .addStringOption(opt => opt.setName('code').setDescription('The code content').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('get')
      .setDescription('Retrieve a saved code snippet by name')
      .addStringOption(opt => opt.setName('name').setDescription('Snippet name').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('List all saved snippets')
  )
  .addSubcommand(sub =>
    sub.setName('delete')
      .setDescription('Delete a saved snippet')
      .addStringOption(opt => opt.setName('name').setDescription('Snippet name').setRequired(true))
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const guildId = interaction.guild ? interaction.guild.id : 'global';
  const dataStore = readData();

  if (!dataStore.snippets) dataStore.snippets = {};
  if (!dataStore.snippets[guildId]) dataStore.snippets[guildId] = {};

  const guildSnippets = dataStore.snippets[guildId];

  if (subcommand === 'save') {
    const name = interaction.options.getString('name').trim().toLowerCase();
    const language = interaction.options.getString('language').trim().toLowerCase();
    const code = interaction.options.getString('code').replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');

    guildSnippets[name] = {
      code,
      language,
      author: interaction.user.username,
      authorId: interaction.user.id,
      createdAt: new Date().toISOString()
    };

    writeData(dataStore);

    return interaction.reply({
      embeds: [createSuccessEmbed('Snippet Saved', `Snippet **${name}** (${language}) has been saved successfully.`)]
    });
  }

  if (subcommand === 'get') {
    const name = interaction.options.getString('name').trim().toLowerCase();
    const snippet = guildSnippets[name];

    if (!snippet) {
      return interaction.reply({
        embeds: [createErrorEmbed(`No snippet found with the name \`${name}\`. Use \`/snippet list\` to see available snippets.`)],
        ephemeral: true
      });
    }

    const embed = createBaseEmbed('Coding')
      .setTitle(`📋 Snippet: ${name}`)
      .setDescription(`\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``)
      .addFields(
        { name: 'Language', value: `\`${snippet.language}\``, inline: true },
        { name: 'Saved by', value: snippet.author, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (subcommand === 'list') {
    const names = Object.keys(guildSnippets);
    if (names.length === 0) {
      return interaction.reply({
        embeds: [createBaseEmbed('Coding').setTitle('📋 Saved Snippets').setDescription('No snippets saved yet in this server. Use `/snippet save` to add one!')]
      });
    }

    const listText = names
      .map(name => `• **${name}** (\`${guildSnippets[name].language}\`) — saved by *${guildSnippets[name].author}*`)
      .join('\n');

    const embed = createBaseEmbed('Coding')
      .setTitle(`📋 Saved Snippets (${names.length})`)
      .setDescription(listText);

    return interaction.reply({ embeds: [embed] });
  }

  if (subcommand === 'delete') {
    const name = interaction.options.getString('name').trim().toLowerCase();
    if (!guildSnippets[name]) {
      return interaction.reply({
        embeds: [createErrorEmbed(`No snippet found with the name \`${name}\`.`)],
        ephemeral: true
      });
    }

    delete guildSnippets[name];
    writeData(dataStore);

    return interaction.reply({
      embeds: [createSuccessEmbed('Snippet Deleted', `Snippet **${name}** has been removed.`)]
    });
  }
}
