const { EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  stickyMessages: new Map(), // Cache for active sticky messages
  
  // Load sticky messages from database
  async loadFromDatabase() {
    try {
      const messages = await db.all('SELECT * FROM sticky_messages');
      messages.forEach(msg => {
        this.stickyMessages.set(msg.channel_id, {
          messageContent: msg.content,
          embedData: {
            title: msg.title,
            color: msg.color
          },
          guildId: msg.guild_id,
          createdAt: new Date()
        });
      });
      console.log(`Loaded ${messages.length} sticky messages from database`);
    } catch (error) {
      console.error('Error loading sticky messages:', error);
    }
  },
  
  // Set a sticky message for a channel
  async setSticky(channel, content, embedData = null, author = null) {
    if (!channel?.id || !channel?.guild) {
      throw new Error('Invalid channel provided');
    }

    if (!content?.trim()) {
      throw new Error('Content must be a non-empty string');
    }

    console.log('Attempting to set sticky message:', {
      channel: channel.name,
      guild: channel.guild.name,
      contentLength: content.length,
      hasEmbed: !!embedData
    });

    // Check permissions first
    const permissions = channel.permissionsFor(channel.guild.members.me);
    if (!permissions.has(['ViewChannel', 'SendMessages'])) {
      throw new Error('Missing required permissions: VIEW_CHANNEL, SEND_MESSAGES');
    }
    if (embedData && !permissions.has('EmbedLinks')) {
      throw new Error('Missing required permission: EMBED_LINKS');
    }


    let message;
    try {
      // Create embed if needed
      let embed = null;
      if (embedData) {
        // Convert hex color to number if needed
        let color = embedData.color || '#5865F2';
        if (typeof color === 'string') {
          color = color.startsWith('#') ? parseInt(color.slice(1), 16) : parseInt(color, 16);
        }

        if (isNaN(color)) {
          console.warn('Invalid color format, using default');
          color = parseInt('5865F2', 16);
        }

        embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(embedData.title || 'Sticky Message')
          .setDescription(content)
          .setTimestamp();

        if (author?.tag) {
          embed.setFooter({
            text: `Sticky message set by ${author.tag}`,
            iconURL: author.displayAvatarURL()
          });
        }
      }

      // Send the message
      message = await channel.send({
        content: embed ? null : content,
        embeds: embed ? [embed] : []
      });
      console.log('Message sent successfully:', message.id);
      
      // Then save to database
      await db.run(
        'INSERT OR REPLACE INTO sticky_messages (channel_id, guild_id, content, title, color) VALUES (?, ?, ?, ?, ?)',
        [channel.id, channel.guild.id, content, embedData?.title, embedData?.color]
      );
      console.log('Saved to database');
      
      // Finally update cache
      this.stickyMessages.set(channel.id, {
        messageContent: content,
        embedData,
        lastMessageId: message.id,
        guildId: channel.guild.id,
        createdAt: new Date()
      });
      console.log('Updated cache');
      
      return message;
    } catch (error) {
      console.error('Error in setSticky:', error);
      // If message was sent but database failed, try to clean up
      if (message) {
        await message.delete().catch(e =>
          console.error('Failed to delete message after error:', e)
        );
      }
      throw new Error(`Failed to set sticky message: ${error.message}`);
    }

  },
  
  // Remove a sticky message from a channel
  async removeSticky(channel) {
    try {
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
      
      // Remove from database
      await db.run('DELETE FROM sticky_messages WHERE channel_id = ?', [channel.id]);
      
      // Remove from cache
      this.stickyMessages.delete(channel.id);
      
      console.log(`Removed sticky message from channel ${channel.name}`);
      return true;
    } catch (error) {
      console.error('Error removing sticky message:', error);
      throw error;
    }
  },
  
  // Initialize sticky messages when bot starts
  async initialize(client) {
    await this.loadFromDatabase();
    console.log('Sticky messages system initialized');
  },

  // Repost a sticky message if needed
  async handleNewMessage(message) {
    try {
      // Basic validation
      if (!message || !message.channel) {
        console.error('Invalid message object received');
        return;
      }

      // Ignore messages from bots to prevent loops
      if (message.author.bot) return;
      
      // Check if there's a sticky message for this channel
      const stickyData = this.stickyMessages.get(message.channel.id);
      if (!stickyData) return;
      
      // Don't repost if the last message in the channel is already the sticky
      if (message.id === stickyData.lastMessageId) return;
      
      // Check permissions before attempting to repost
      const botMember = await message.guild.members.fetchMe();
      const permissions = message.channel.permissionsFor(botMember);
      
      if (!permissions.has(['ViewChannel', 'SendMessages'])) {
        console.error('Missing required permissions for sticky message repost:', {
          channel: message.channel.name,
          guildId: message.guild.id,
          missing: ['ViewChannel', 'SendMessages'].filter(perm => !permissions.has(perm))
        });
        return;
      }

      console.log('Reposting sticky message in channel:', {
        channelName: message.channel.name,
        guildName: message.guild.name,
        hasEmbed: !!stickyData.embedData
      });
      
      // Delete the old sticky message
      if (stickyData.lastMessageId) {
        try {
          const oldMessage = await message.channel.messages.fetch(stickyData.lastMessageId).catch(() => null);
          if (oldMessage) {
            await oldMessage.delete().catch(error => {
              console.error('Could not delete old sticky message:', error);
            });
          }
        } catch (error) {
          console.error('Error handling old sticky message:', error);
          // Continue despite error
        }
      }
      
      // Create embed if needed
      let embed = null;
      if (stickyData.embedData) {
        // Convert hex color to number if needed
        let color = stickyData.embedData.color || '#5865F2';
        if (typeof color === 'string') {
          color = color.startsWith('#') ? parseInt(color.slice(1), 16) : parseInt(color, 16);
        }

        console.log('Reposting embed with color:', { original: stickyData.embedData.color, parsed: color });

        const embedBuilder = new EmbedBuilder()
          .setColor(color)
          .setTitle(stickyData.embedData.title || 'Sticky Message')
          .setDescription(stickyData.messageContent)
          .setTimestamp(stickyData.createdAt);

        // Add author footer if available
        if (stickyData.authorId) {
          try {
            const author = await message.client.users.fetch(stickyData.authorId).catch(() => null);
            if (author) {
              embedBuilder.setFooter({
                text: `Sticky message set by ${author.tag}`,
                iconURL: author.displayAvatarURL()
              });
            }
          } catch (error) {
            console.error('Error fetching author for footer:', error);
          }
        }

        embed = embedBuilder;
      }
      
      // Send the new sticky message
      console.log('Sending new sticky message...');
      const newMessage = await message.channel.send({
        content: embed ? null : stickyData.messageContent,
        embeds: embed ? [embed] : []
      }).catch(error => {
        console.error('Failed to send sticky message:', error);
        throw error;
      });
      
      // Update the last message ID in cache and database
      stickyData.lastMessageId = newMessage.id;
      this.stickyMessages.set(message.channel.id, stickyData);
      
      try {
        await db.run(
          'UPDATE sticky_messages SET last_message_id = ? WHERE channel_id = ?',
          [newMessage.id, message.channel.id]
        );
        console.log('Sticky message updated successfully');
      } catch (error) {
        console.error('Failed to update sticky message in database:', error);
        // Don't throw - the message is already sent
      }
    } catch (error) {
      console.error('Error handling new message for sticky:', error);
      // Don't throw to prevent message event handler from breaking
    }
  }
};