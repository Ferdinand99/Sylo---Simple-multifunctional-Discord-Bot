const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    // Set bot activity
    client.user.setActivity('your commands', { type: 'LISTENING' });
    
    // Initialize sticky messages from database
    const stickyHandler = require('../features/stickyMessages/stickyHandler');
    await stickyHandler.initialize(client);
    
    // Log server count
    console.log(`Bot is in ${client.guilds.cache.size} servers`);
  },
};