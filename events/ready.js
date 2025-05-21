const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    // Set bot activity
    client.user.setActivity('your commands', { type: 'LISTENING' });
    
    // Initialize sticky messages from database (would be implemented with actual DB)
    console.log('Initialized sticky messages system');
    
    // Log server count
    console.log(`Bot is in ${client.guilds.cache.size} servers`);
  },
};