import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('format')
  .setDescription('Format and prettify a code block with syntax highlighting')
  .addStringOption(option =>
    option.setName('language')
      .setDescription('Code language')
      .setRequired(true)
      .addChoices(
        { name: 'JavaScript', value: 'javascript' },
        { name: 'TypeScript', value: 'typescript' },
        { name: 'Python', value: 'python' },
        { name: 'C++', value: 'cpp' },
        { name: 'Rust', value: 'rust' },
        { name: 'HTML/CSS', value: 'html' },
        { name: 'JSON', value: 'json' },
        { name: 'SQL', value: 'sql' }
      )
  )
  .addStringOption(option =>
    option.setName('code')
      .setDescription('Code to format')
      .setRequired(true)
  )
  .addBooleanOption(option =>
    option.setName('linenumbers')
      .setDescription('Include line numbers (default: true)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const language = interaction.options.getString('language');
  let code = interaction.options.getString('code');
  const lineNumbers = interaction.options.getBoolean('linenumbers') ?? true;

  // Clean backticks
  code = code.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');

  let formattedCode = code;
  if (lineNumbers) {
    const lines = code.split('\n');
    const padding = lines.length.toString().length;
    formattedCode = lines
      .map((line, i) => `${(i + 1).toString().padStart(padding, ' ')} | ${line}`)
      .join('\n');
  }

  const embed = createBaseEmbed('Coding')
    .setTitle(`📝 Formatted Code: ${language.toUpperCase()}`)
    .setDescription(`\`\`\`${language}\n${formattedCode}\n\`\`\``)
    .setFooter({ text: `Formatted for ${interaction.user.username}` });

  return interaction.reply({ embeds: [embed] });
}
