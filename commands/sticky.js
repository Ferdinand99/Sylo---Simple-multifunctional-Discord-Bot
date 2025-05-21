const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const stickyHandler = require('../features/stickyMessages/stickyHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Manage sticky messages')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set a sticky message in the current channel')
        .addStringOption(option =>
          option.setName('message')
            .setDescription('The message content to make sticky')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Optional title for the sticky message embed')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('color')
            .setDescription('Color for the embed (hex code)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove the sticky message from the current channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'set') {
      const message = interaction.options.getString('message');
      const title = interaction.options.getString('title');
      const colorString = interaction.options.getString('color');
      
      // Parse color if provided
      let color = 0x0099FF; // Default blue color
      if (colorString) {
        try {
          // Remove # if present and convert to integer
          color = parseInt(colorString.replace(/^#/, ''), 16);
          if (isNaN(color)) color = 0x0099FF;
        } catch (error) {
          console.error('Error parsing color:', error);
        }
      }
      
      // Create embed data if title or color is provided
      const embedData = title || colorString ? { title, color } : null;
      
      try {
        await interaction.deferReply();
        await stickyHandler.setSticky(interaction.channel, message, embedData, interaction.user);
        await interaction.editReply('Sticky message set successfully!');
      } catch (error) {
        console.error('Error setting sticky message:', error);
        await interaction.editReply('There was an error setting the sticky message.');
      }
    } 
    else if (subcommand === 'remove') {
      try {
        await interaction.deferReply();
        const removed = await stickyHandler.removeSticky(interaction.channel);
        
        if (removed) {
          await interaction.editReply('Sticky message removed successfully!');
        } else {
          await interaction.editReply('There was no sticky message in this channel.');
        }
      } catch (error) {
        console.error('Error removing sticky message:', error);
        await interaction.editReply('There was an error removing the sticky message.');
      }
    }
  },
};