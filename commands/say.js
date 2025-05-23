const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message through the bot')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('embed')
        .setDescription('Send the message as an embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title for the embed (only works with embed option)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color for the embed (hex code like #FF0000)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const useEmbed = interaction.options.getBoolean('embed') || false;
    const title = interaction.options.getString('title');
    const color = interaction.options.getString('color') || '#5865F2'; // Default Discord blue
    
    try {
      if (useEmbed) {
        const embed = new EmbedBuilder()
          .setDescription(message)
          .setColor(color);
        
        if (title) {
          embed.setTitle(title);
        }
        
        await interaction.channel.send({ embeds: [embed] });
      } else {
        await interaction.channel.send(message);
      }
      
      // Send confirmation to the command user (ephemeral)
      return interaction.reply({ 
        content: 'Message sent successfully!', 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return interaction.reply({ 
        content: 'There was an error sending your message.', 
        ephemeral: true 
      });
    }
  },
};