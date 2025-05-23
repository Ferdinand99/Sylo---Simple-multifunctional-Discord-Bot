const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logModAction } = require('../features/moderation/modlogHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Check if the bot can kick the user
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }
    
    if (!targetMember.kickable) {
      return interaction.reply({ content: 'I cannot kick this user. They may have higher permissions than me.', ephemeral: true });
    }
    
    // Check if the user trying to kick has higher permissions than the target
    if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
      return interaction.reply({ content: 'You cannot kick this user as they have the same or higher role than you.', ephemeral: true });
    }

    try {
      // Perform the kick
      await targetMember.kick(`${reason} | Kicked by ${interaction.user.tag}`);

      // Log the kick using the modlog handler
      await logModAction(interaction.client, interaction.guild, {
        type: 'kick',
        moderator: interaction.user,
        target: targetUser,
        reason: reason
      }).catch(console.error);

      return interaction.reply({ content: `✅ Successfully kicked ${targetUser.tag}.\n📝 Reason: ${reason}` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ There was an error trying to kick this user.', ephemeral: true });
    }
  },
};
