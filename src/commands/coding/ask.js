import { SlashCommandBuilder } from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask your AI Second Brain a technical or coding question')
  .addStringOption(opt => opt.setName('prompt').setDescription('Your question or code snippet').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const prompt = interaction.options.getString('prompt');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const answer = response.text || 'No response generated.';
    const embed = createBaseEmbed('AI Second Brain')
      .setTitle('💡 Technical Assistant')
      .setDescription(answer.length > 4000 ? answer.substring(0, 3997) + '...' : answer);

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return interaction.editReply(`❌ AI Error: \`${error.message}\``);
  }
}

