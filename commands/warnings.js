const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getUserWarnings } = require('../features/moderation/warningDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check warnings for')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    
    // Get warnings data for this user from the database
    const userWarnings = getUserWarnings(interaction.guild.id, targetUser.id);
    
    if (userWarnings.length === 0) {
      return interaction.reply({ 
        content: `${targetUser.tag} has no warnings in this server.`,
        ephemeral: true
      });
    }
    
    // Create an embed to display the warnings
    const warningsEmbed = new EmbedBuilder()
      .setTitle(`Warnings for ${targetUser.tag}`)
      .setColor('#FFA500')
      .setThumbnail(targetUser.displayAvatarURL())
      .setDescription(`Total Warnings: **${userWarnings.length}**`)
      .setTimestamp();
    
    // Add each warning to the embed
    userWarnings.forEach((warning, index) => {
      const moderator = interaction.client.users.cache.get(warning.moderator) || { tag: 'Unknown Moderator' };
      const warningDate = new Date(warning.timestamp).toLocaleDateString();
      
      warningsEmbed.addFields({
        name: `Warning #${index + 1} (${warningDate})`,
        value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator.tag}\n**ID:** ${warning.id}`
      });
    });
    
    // Reply with the warnings embed
    await interaction.reply({ embeds: [warningsEmbed] });
  }
};