const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { removeWarning, getUserWarnings } = require('../features/moderation/warningDatabase');
const { logModAction } = require('../features/moderation/modlogHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removewarning')
    .setDescription('Remove a warning from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove a warning from')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('warning_id')
        .setDescription('The ID of the warning to remove')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const warningId = interaction.options.getString('warning_id');
    
    // Get warnings for the user
    const userWarnings = getUserWarnings(interaction.guild.id, targetUser.id);
    
    if (userWarnings.length === 0) {
      return interaction.reply({ 
        content: `${targetUser.tag} has no warnings in this server.`,
        ephemeral: true
      });
    }
    
    // Find the warning to remove
    const warningToRemove = userWarnings.find(warning => warning.id === warningId);
    
    if (!warningToRemove) {
      return interaction.reply({ 
        content: `Could not find a warning with ID ${warningId} for ${targetUser.tag}.`,
        ephemeral: true
      });
    }
    
    // Remove the warning
    const removed = removeWarning(interaction.guild.id, targetUser.id, warningId);
    
    if (!removed) {
      return interaction.reply({ 
        content: `Failed to remove warning with ID ${warningId}.`,
        ephemeral: true
      });
    }
    
    // Create an embed for the removed warning
    const embed = new EmbedBuilder()
      .setTitle('Warning Removed')
      .setColor('#00FF00')
      .setDescription(`**User:** ${targetUser.tag} (${targetUser.id})\n**Warning ID:** ${warningId}\n**Reason:** ${warningToRemove.reason}\n**Removed by:** ${interaction.user.tag}`)
      .setTimestamp();
    
    // Log the warning removal
    await logModAction(interaction.client, interaction.guild, {
      type: 'warning_remove',
      moderator: interaction.user,
      target: targetUser,
      reason: `Warning ID: ${warningId} removed`,
      additionalData: {
        warningId: warningId,
        originalReason: warningToRemove.reason
      }
    }).catch(console.error);
    
    // Reply to the interaction
    await interaction.reply({ 
      content: `Warning removed from ${targetUser.tag}`, 
      embeds: [embed] 
    });
  }
};