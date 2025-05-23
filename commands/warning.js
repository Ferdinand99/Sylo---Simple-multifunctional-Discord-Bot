const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logModAction } = require('../features/moderation/modlogHandler');
const { addWarning, getUserWarnings } = require('../features/moderation/warningDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warning')
    .setDescription('Issue a warning to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    
    // Check if the user is in the server
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }
    
    // Check if the user trying to warn has higher permissions than the target
    if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
      return interaction.reply({ content: 'You cannot warn this user as they have the same or higher role than you.', ephemeral: true });
    }
    
    // Get existing warnings for the user
    const userWarnings = getUserWarnings(interaction.guild.id, targetUser.id);
    
    // Create the new warning
    const warningId = Date.now().toString();
    const warning = {
      id: warningId,
      reason: reason,
      moderator: interaction.user.id,
      timestamp: new Date().toISOString(),
      warningNumber: userWarnings.length + 1
    };
    
    // Add the warning to the database
    addWarning(interaction.guild.id, targetUser.id, warning);
    
    // Create an embed for the warning
    const warningEmbed = new EmbedBuilder()
      .setTitle(`Warning Issued - #${warning.warningNumber}`)
      .setColor('#FFA500')
      .setDescription(`**User:** ${targetUser.tag} (${targetUser.id})\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
      .setTimestamp()
      .setFooter({ text: `Warning ID: ${warningId}` });
    
    // Send the warning to the user
    try {
      await targetUser.send({ 
        content: `You have been warned in **${interaction.guild.name}**`, 
        embeds: [warningEmbed] 
      });
    } catch (error) {
      console.error('Could not DM the user:', error);
    }
    
    // Reply to the interaction
    await interaction.reply({ 
      content: `Warning issued to ${targetUser.tag}`, 
      embeds: [warningEmbed] 
    });
    
    // Log the warning using the modlog handler
    await logModAction(interaction.client, interaction.guild, {
      type: 'warning',
      moderator: interaction.user,
      target: targetUser,
      reason: reason,
      additionalData: {
        warningNumber: warning.warningNumber,
        id: warningId
      }
    }).catch(console.error);
  }
};