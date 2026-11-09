import { SlashCommandBuilder } from 'discord.js';
import { executeCode } from '../../utils/codeRunner.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('run')
  .setDescription('Safely execute code in Python, JS, C++, Rust, Go, Java, etc.')
  .addStringOption(option =>
    option.setName('language')
      .setDescription('Programming language')
      .setRequired(true)
      .addChoices(
        { name: 'Python (3.14)', value: 'python' },
        { name: 'JavaScript (Node 20)', value: 'javascript' },
        { name: 'TypeScript (5.6)', value: 'typescript' },
        { name: 'C++ (GCC 13)', value: 'cpp' },
        { name: 'C (GCC 13)', value: 'c' },
        { name: 'Rust (1.82)', value: 'rust' },
        { name: 'Go (1.23)', value: 'go' },
        { name: 'Java (OpenJDK 22)', value: 'java' },
        { name: 'Ruby (4.0)', value: 'ruby' },
        { name: 'PHP (8.3)', value: 'php' },
        { name: 'C# (Mono 6.12)', value: 'csharp' }
      )
  )
  .addStringOption(option =>
    option.setName('code')
      .setDescription('Code snippet to execute')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('stdin')
      .setDescription('Optional standard input (stdin)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const language = interaction.options.getString('language');
  let code = interaction.options.getString('code');
  const stdin = interaction.options.getString('stdin') || '';

  // Clean markdown backticks if user wrapped in ```code```
  code = code.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');

  await interaction.deferReply();

  try {
    const result = await executeCode(language, code, stdin);

    const embed = createBaseEmbed('Coding')
      .setColor(result.success ? 0x2ECC71 : 0xE74C3C)
      .setTitle(`💻 Code Execution: ${language.toUpperCase()}`)
      .setFooter({ text: `Compiler: ${result.compiler} | Took ${result.durationMs}ms` });

    if (code.length > 500) {
      embed.addFields({
        name: 'Input Code',
        value: `\`\`\`${language}\n${code.substring(0, 480)}...\n\`\`\``
      });
    } else {
      embed.addFields({
        name: 'Input Code',
        value: `\`\`\`${language}\n${code}\n\`\`\``
      });
    }

    if (result.output) {
      const outputText = result.output.length > 1000
        ? result.output.substring(0, 990) + '\n...[Output Truncated]'
        : result.output;
      embed.addFields({
        name: 'Output (stdout)',
        value: `\`\`\`\n${outputText}\n\`\`\``
      });
    }

    if (result.error) {
      const errorText = result.error.length > 1000
        ? result.error.substring(0, 990) + '\n...[Error Truncated]'
        : result.error;
      embed.addFields({
        name: 'Errors / Warnings (stderr)',
        value: `\`\`\`\n${errorText}\n\`\`\``
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('Code runner error:', err);
    await interaction.editReply(`❌ Failed to execute code: ${err.message}`);
  }
}
