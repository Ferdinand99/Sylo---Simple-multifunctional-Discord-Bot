const { Events } = require('discord.js');
const stickyHandler = require('../features/stickyMessages/stickyHandler');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    // Ignore messages from bots and DMs
    if (message.author.bot || !message.guild) return;
    
    // Handle sticky messages
    await stickyHandler.handleNewMessage(message);
    
    // You can add more message event handling here as needed
  },
};