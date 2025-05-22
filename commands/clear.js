const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from a channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');
    const channel = interaction.channel;
    
    // Defer reply as this might take a moment
    await interaction.deferReply({ ephemeral: true });
    
    try {
      // Fetch messages
      const messages = await channel.messages.fetch({ limit: amount });
      
      // Filter messages if a user is specified
      let messagesToDelete = messages;
      if (user) {
        messagesToDelete = messages.filter(msg => msg.author.id === user.id);
        
        // Check if we have any messages to delete after filtering
        if (messagesToDelete.size === 0) {
          return interaction.editReply({ content: `No recent messages from ${user.tag} were found.` });
        }
      }
      
      // Discord only allows bulk deletion of messages not older than 14 days
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const filteredMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
      
      if (filteredMessages.size === 0) {
        return interaction.editReply({ content: 'Cannot delete messages older than 14 days.' });
      }
      
      // Bulk delete messages
      const deleted = await channel.bulkDelete(filteredMessages, true);
      
      // Respond with success message
      const userStr = user ? ` from ${user.tag}` : '';
      return interaction.editReply({ 
        content: `Successfully deleted ${deleted.size} message(s)${userStr}.`,
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({ 
        content: 'There was an error trying to clear messages. Messages older than 14 days cannot be bulk deleted.',
      });
    }
  },
};