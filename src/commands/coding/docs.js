import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('docs')
  .setDescription('Quick lookup for programming language and framework documentation')
  .addStringOption(option =>
    option.setName('source')
      .setDescription('Documentation source')
      .setRequired(true)
      .addChoices(
        { name: 'JavaScript (MDN)', value: 'mdn' },
        { name: 'Python (Official Docs)', value: 'python' },
        { name: 'React (Official)', value: 'react' },
        { name: 'Rust (Rust Docs)', value: 'rust' },
        { name: 'Go (Go Standard Library)', value: 'go' },
        { name: 'Docker (Docker Docs)', value: 'docker' },
        { name: 'Git (Git SCM Docs)', value: 'git' }
      )
  )
  .addStringOption(option =>
    option.setName('topic')
      .setDescription('Method, function, or concept name (e.g. Array.prototype.map, asyncio, useState)')
      .setRequired(true)
  );

export async function execute(interaction) {
  const source = interaction.options.getString('source');
  const topic = interaction.options.getString('topic').trim();

  let targetUrl = '';
  let title = '';

  switch (source) {
    case 'mdn':
      targetUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`;
      title = `MDN Web Docs: ${topic}`;
      break;
    case 'python':
      targetUrl = `https://docs.python.org/3/search.html?q=${encodeURIComponent(topic)}`;
      title = `Python Documentation: ${topic}`;
      break;
    case 'react':
      targetUrl = `https://react.dev/reference/react/${encodeURIComponent(topic)}`;
      title = `React Documentation: ${topic}`;
      break;
    case 'rust':
      targetUrl = `https://doc.rust-lang.org/std/index.html?search=${encodeURIComponent(topic)}`;
      title = `Rust Standard Library: ${topic}`;
      break;
    case 'go':
      targetUrl = `https://pkg.go.dev/search?q=${encodeURIComponent(topic)}`;
      title = `Go Packages: ${topic}`;
      break;
    case 'docker':
      targetUrl = `https://docs.docker.com/search/?q=${encodeURIComponent(topic)}`;
      title = `Docker Docs: ${topic}`;
      break;
    case 'git':
      targetUrl = `https://git-scm.com/docs/${encodeURIComponent(topic)}`;
      title = `Git Documentation: ${topic}`;
      break;
  }

  const embed = createBaseEmbed('Coding')
    .setTitle(`📖 ${title}`)
    .setDescription(`Found documentation reference for **${topic}**.\n\n🔗 [Click here to view official documentation](${targetUrl})`)
    .addFields(
      { name: 'Source', value: source.toUpperCase(), inline: true },
      { name: 'Topic', value: `\`${topic}\``, inline: true }
    );

  return interaction.reply({ embeds: [embed] });
}
