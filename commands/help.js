const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists all available commands with descriptions'),
  
  async execute(interaction) {
    const { client } = interaction;
    
    // Create embed for command list
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Bot Commands')
      .setDescription('Here are all the available commands:')
      .setTimestamp()
      .setFooter({ text: 'Use /command for more details on each command' });
    
    // Get all commands and sort them by category
    const commands = client.commands;
    
    // Categorize commands
    const moderationCommands = [];
    const ticketCommands = [];
    const roleCommands = [];
    const stickyCommands = [];
    const utilityCommands = [];
    
    commands.forEach(command => {
      const name = command.data.name;
      const description = command.data.description;
      
      // Categorize based on command name or structure
      if (name === 'ban' || name === 'kick' || name === 'timeout' || name === 'say') {
        moderationCommands.push(`**/${name}** - ${description}`);
      } else if (name === 'ticket') {
        ticketCommands.push(`**/${name}** - ${description}`);
      } else if (name === 'roles') {
        roleCommands.push(`**/${name}** - ${description}`);
      } else if (name === 'sticky') {
        stickyCommands.push(`**/${name}** - ${description}`);
      } else {
        // Any other commands go to utility
        utilityCommands.push(`**/${name}** - ${description}`);
      }
    });
    
    // Add fields for each category (only if they have commands)
    if (moderationCommands.length > 0) {
      helpEmbed.addFields({ name: '🛡️ Moderation', value: moderationCommands.join('\n') });
    }
    
    if (ticketCommands.length > 0) {
      helpEmbed.addFields({ name: '🎫 Tickets', value: ticketCommands.join('\n') });
    }
    
    if (roleCommands.length > 0) {
      helpEmbed.addFields({ name: '🏷️ Reaction Roles', value: roleCommands.join('\n') });
    }
    
    if (stickyCommands.length > 0) {
      helpEmbed.addFields({ name: '📌 Sticky Messages', value: stickyCommands.join('\n') });
    }
    
    if (utilityCommands.length > 0) {
      helpEmbed.addFields({ name: '🔧 Utility', value: utilityCommands.join('\n') });
    }
    
    // Send the embed
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
};