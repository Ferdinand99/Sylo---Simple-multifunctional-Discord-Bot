const { EmbedBuilder } = require('discord.js');

module.exports = {
  // Store for sticky messages (in a real implementation, this would be in a database)
  // Format: { channelId: { messageContent, embedData, lastMessageId } }
  stickyMessages: new Map(),
  
  // Set a sticky message for a channel
  async setSticky(channel, content, embedData = null, author) {
    // Check if there's already a sticky message in this channel
    const existingSticky = this.stickyMessages.get(channel.id);
    
    // If there is, delete the old sticky message
    if (existingSticky && existingSticky.lastMessageId) {
      try {
        const oldMessage = await channel.messages.fetch(existingSticky.lastMessageId).catch(() => null);
        if (oldMessage) await oldMessage.delete().catch(console.error);
      } catch (error) {
        console.error('Error deleting old sticky message:', error);
      }
    }
    
    // Create embed if data is provided
    let embed = null;
    if (embedData) {
      embed = new EmbedBuilder()
        .setColor(embedData.color || 0x0099FF)
        .setTitle(embedData.title || 'Sticky Message')
        .setDescription(content)
        .setFooter({ text: `Sticky message set by ${author.tag}`, iconURL: author.displayAvatarURL() })
        .setTimestamp();
    }
    
    // Send the new sticky message
    const message = await channel.send({
      content: embed ? null : content,
      embeds: embed ? [embed] : [],
    });
    
    // Store the sticky message data
    this.stickyMessages.set(channel.id, {
      messageContent: content,
      embedData,
      lastMessageId: message.id,
      authorId: author.id,
      createdAt: new Date()
    });
    
    return message;
  },
  
  // Remove a sticky message from a channel
  async removeSticky(channel) {
    const existingSticky = this.stickyMessages.get(channel.id);
    
    if (!existingSticky) {
      return false;
    }
    
    // Delete the last sticky message
    if (existingSticky.lastMessageId) {
      try {
        const oldMessage = await channel.messages.fetch(existingSticky.lastMessageId).catch(() => null);
        if (oldMessage) await oldMessage.delete().catch(console.error);
      } catch (error) {
        console.error('Error deleting sticky message:', error);
      }
    }
    
    // Remove from the store
    this.stickyMessages.delete(channel.id);
    return true;
  },
  
  // Repost a sticky message if needed
  async handleNewMessage(message) {
    // Ignore messages from bots to prevent loops
    if (message.author.bot) return;
    
    // Check if there's a sticky message for this channel
    const stickyData = this.stickyMessages.get(message.channel.id);
    if (!stickyData) return;
    
    // Don't repost if the last message in the channel is already the sticky
    if (message.id === stickyData.lastMessageId) return;
    
    // Delete the old sticky message
    try {
      const oldMessage = await message.channel.messages.fetch(stickyData.lastMessageId).catch(() => null);
      if (oldMessage) await oldMessage.delete().catch(console.error);
    } catch (error) {
      console.error('Error deleting old sticky message:', error);
    }
    
    // Create embed if needed
    let embed = null;
    if (stickyData.embedData) {
      const author = await message.client.users.fetch(stickyData.authorId).catch(() => null);
      embed = new EmbedBuilder()
        .setColor(stickyData.embedData.color || 0x0099FF)
        .setTitle(stickyData.embedData.title || 'Sticky Message')
        .setDescription(stickyData.messageContent)
        .setFooter({
          text: `Sticky message set by ${author ? author.tag : 'Unknown User'}`,
          iconURL: author ? author.displayAvatarURL() : null
        })
        .setTimestamp(stickyData.createdAt);
    }
    
    // Send the new sticky message
    const newMessage = await message.channel.send({
      content: embed ? null : stickyData.messageContent,
      embeds: embed ? [embed] : [],
    });
    
    // Update the last message ID
    stickyData.lastMessageId = newMessage.id;
    this.stickyMessages.set(message.channel.id, stickyData);
  }
};