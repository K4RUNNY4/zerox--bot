import { EmbedBuilder } from 'discord.js';

export const Colors = {
  Primary: 0x5865F2,
  Gaming: 0x9B59B6,
  Coding: 0x00D2D3,
  Music: 0xE056FD,
  Tasks: 0x3498DB,
  Success: 0x2ECC71,
  Error: 0xE74C3C,
  Warning: 0xF39C12
};

export function createBaseEmbed(category = 'Primary') {
  const color = Colors[category] || Colors.Primary;
  return new EmbedBuilder()
    .setColor(color)
    .setTimestamp();
}

export function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(Colors.Error)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

export function createSuccessEmbed(title, message) {
  return new EmbedBuilder()
    .setColor(Colors.Success)
    .setTitle(`✅ ${title}`)
    .setDescription(message)
    .setTimestamp();
}
