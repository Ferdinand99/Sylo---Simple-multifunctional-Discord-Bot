const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;
    
    // Check if the bot can ban the user
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }
    
    if (!targetMember.bannable) {
      return interaction.reply({ content: 'I cannot ban this user. They may have higher permissions than me.', ephemeral: true });
    }
    
    // Check if the user trying to ban has higher permissions than the target
    if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
      return interaction.reply({ content: 'You cannot ban this user as they have the same or higher role than you.', ephemeral: true });
    }
    
    // Perform the ban
    try {
      await interaction.guild.members.ban(targetUser, { deleteMessageDays: days, reason: `${reason} | Banned by ${interaction.user.tag}` });
      
      // Log the ban in a moderation log channel (if configured)
      // This would be implemented with an actual logging system
      
      return interaction.reply({ content: `Successfully banned ${targetUser.tag} for reason: ${reason}` });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error trying to ban this user.', ephemeral: true });
    }
  },
};