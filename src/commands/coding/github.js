import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('github')
  .setDescription('Search and inspect GitHub repositories or user profiles')
  .addSubcommand(sub =>
    sub.setName('repo')
      .setDescription('Inspect a GitHub repository (e.g. facebook/react or search term)')
      .addStringOption(option =>
        option.setName('query')
          .setDescription('Repository name (owner/repo) or search query')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub.setName('user')
      .setDescription('Inspect a GitHub user profile')
      .addStringOption(option =>
        option.setName('username')
          .setDescription('GitHub username')
          .setRequired(true)
      )
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand();

  const headers = {
    'User-Agent': 'DiscordBot-CodingSuite/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    if (subcommand === 'repo') {
      const query = interaction.options.getString('query').trim();
      let repoData;

      if (query.includes('/')) {
        const res = await fetch(`https://api.github.com/repos/${query}`, { headers });
        if (res.ok) {
          repoData = await res.json();
        }
      }

      if (!repoData) {
        const searchRes = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`, { headers });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            repoData = searchData.items[0];
          }
        }
      }

      if (!repoData) {
        return interaction.editReply(`❌ Could not find any repository matching \`${query}\`.`);
      }

      const embed = createBaseEmbed('Coding')
        .setTitle(`📦 ${repoData.full_name}`)
        .setURL(repoData.html_url)
        .setDescription(repoData.description || 'No description provided.')
        .addFields(
          { name: '⭐ Stars', value: `${repoData.stargazers_count.toLocaleString()}`, inline: true },
          { name: '🍴 Forks', value: `${repoData.forks_count.toLocaleString()}`, inline: true },
          { name: '❗ Issues', value: `${repoData.open_issues_count.toLocaleString()}`, inline: true },
          { name: '💻 Language', value: repoData.language || 'Multiple / Unknown', inline: true },
          { name: '📜 License', value: repoData.license?.spdx_id || repoData.license?.name || 'None', inline: true },
          { name: '🕒 Updated', value: new Date(repoData.updated_at).toLocaleDateString(), inline: true }
        );

      if (repoData.owner?.avatar_url) {
        embed.setThumbnail(repoData.owner.avatar_url);
      }

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === 'user') {
      const username = interaction.options.getString('username').trim();
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });

      if (!res.ok) {
        return interaction.editReply(`❌ GitHub user \`${username}\` not found.`);
      }

      const user = await res.json();
      const embed = createBaseEmbed('Coding')
        .setTitle(`👤 ${user.name || user.login} (@${user.login})`)
        .setURL(user.html_url)
        .setDescription(user.bio || 'No bio provided.')
        .addFields(
          { name: '📚 Public Repos', value: `${user.public_repos.toLocaleString()}`, inline: true },
          { name: '👥 Followers', value: `${user.followers.toLocaleString()}`, inline: true },
          { name: '🤝 Following', value: `${user.following.toLocaleString()}`, inline: true },
          { name: '📍 Location', value: user.location || 'Not specified', inline: true },
          { name: '🏢 Company', value: user.company || 'None', inline: true },
          { name: '🗓️ Joined', value: new Date(user.created_at).toLocaleDateString(), inline: true }
        );

      if (user.avatar_url) {
        embed.setThumbnail(user.avatar_url);
      }

      return interaction.editReply({ embeds: [embed] });
    }
  } catch (err) {
    console.error('GitHub command error:', err);
    await interaction.editReply('❌ Failed to communicate with GitHub API.');
  }
}
