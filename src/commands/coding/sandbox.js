import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';
import vm from 'node:vm';

export const data = new SlashCommandBuilder()
  .setName('run')
  .setDescription('Run a JavaScript code snippet safely in a sandbox')
  .addStringOption(opt => opt.setName('code').setDescription('JavaScript code to execute').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const code = interaction.options.getString('code');

  try {
    const sandbox = { console: { log: (...args) => output.push(args.join(' ')) } };
    const output = [];
    
    vm.createContext(sandbox);
    const result = vm.runInContext(code, sandbox, { timeout: 2000 });

    const embed = createBaseEmbed('Code Sandbox')
      .setTitle('💻 Code Execution Result')
      .addFields(
        { name: 'Input Code', value: `\`\`\`js\n${code}\n\`\`\`` },
        { name: 'Output / Console', value: `\`\`\`\n${output.join('\n') || result || 'Executed successfully with no output.'}\n\`\`\`` }
      );

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return interaction.editReply(`❌ Execution Error: \`\`\`\n${error.message}\n\`\`\``);
  }
}
