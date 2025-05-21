const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  // Create a new ticket channel
  async createTicket(interaction, topic) {
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Create a unique ticket channel name
    const channelName = `ticket-${user.username.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    
    try {
      // Create the ticket channel with proper permissions
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone role
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: user.id, // Ticket creator
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: interaction.client.user.id, // Bot
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          }
          // You would add support staff roles here as well
        ]
      });
      
      // Create ticket control buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('ticket_claim')
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Primary)
        );
      
      // Create welcome message embed
      const ticketEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Ticket: ${topic || 'Support Request'}`)
        .setDescription(`Thank you for creating a ticket, ${user}. Support staff will be with you shortly.`)
        .addFields(
          { name: 'Topic', value: topic || 'No specific topic provided' },
          { name: 'Created By', value: user.tag }
        )
        .setTimestamp();
      
      // Send the welcome message to the ticket channel
      await ticketChannel.send({ embeds: [ticketEmbed], components: [buttons] });
      
      // Store ticket information (would be in a database in a real implementation)
      interaction.client.tickets.set(ticketChannel.id, {
        userId: user.id,
        channelId: ticketChannel.id,
        topic: topic || 'Support Request',
        createdAt: new Date(),
        status: 'open',
        claimedBy: null
      });
      
      // Reply to the user with the ticket channel link
      return ticketChannel;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },
  
  // Handle ticket button interactions
  async handleButton(interaction, action) {
    const { channel } = interaction;
    const ticketData = interaction.client.tickets.get(channel.id);
    
    if (!ticketData) {
      return interaction.reply({ content: 'This doesn\'t appear to be a valid ticket channel.', ephemeral: true });
    }
    
    switch (action) {
      case 'close':
        await this.closeTicket(interaction, ticketData);
        break;
      case 'claim':
        await this.claimTicket(interaction, ticketData);
        break;
      default:
        await interaction.reply({ content: 'Unknown ticket action.', ephemeral: true });
    }
  },
  
  // Handle ticket modal submissions
  async handleModalSubmit(interaction) {
    const topic = interaction.fields.getTextInputValue('ticket_topic');
    const description = interaction.fields.getTextInputValue('ticket_description');
    
    try {
      // Create the ticket
      const ticketChannel = await this.createTicket(interaction, topic);
      
      // Send the additional description to the ticket channel
      if (description) {
        await ticketChannel.send(`**Additional Information from ${interaction.user}**:\n${description}`);
      }
      
      await interaction.reply({ content: `Your ticket has been created in ${ticketChannel}`, ephemeral: true });
    } catch (error) {
      console.error('Error processing ticket modal:', error);
      await interaction.reply({ content: 'There was an error creating your ticket. Please try again later.', ephemeral: true });
    }
  },
  
  // Close a ticket
  async closeTicket(interaction, ticketData) {
    await interaction.deferReply();
    
    try {
      // Update ticket status
      ticketData.status = 'closed';
      ticketData.closedBy = interaction.user.id;
      ticketData.closedAt = new Date();
      
      // You would save the ticket data to a database here
      
      // Send closing message
      await interaction.editReply({ content: `Ticket closed by ${interaction.user}. This channel will be deleted in 5 seconds.` });
      
      // Delete the channel after a delay
      setTimeout(async () => {
        try {
          await interaction.channel.delete('Ticket closed');
          // Remove from cache
          interaction.client.tickets.delete(interaction.channel.id);
        } catch (err) {
          console.error('Error deleting ticket channel:', err);
        }
      }, 5000);
    } catch (error) {
      console.error('Error closing ticket:', error);
      await interaction.editReply({ content: 'There was an error closing this ticket.' });
    }
  },
  
  // Claim a ticket
  async claimTicket(interaction, ticketData) {
    if (ticketData.claimedBy) {
      return interaction.reply({ content: `This ticket has already been claimed by <@${ticketData.claimedBy}>.`, ephemeral: true });
    }
    
    try {
      // Update ticket data
      ticketData.claimedBy = interaction.user.id;
      ticketData.status = 'claimed';
      
      // You would save the ticket data to a database here
      
      // Send claim notification
      await interaction.reply({ content: `Ticket claimed by ${interaction.user}. They will be assisting you with your request.` });
    } catch (error) {
      console.error('Error claiming ticket:', error);
      await interaction.reply({ content: 'There was an error claiming this ticket.', ephemeral: true });
    }
  },
  
  // Set up the ticket system in a channel
  async setupTicketSystem(interaction) {
    try {
      // Create a button for users to create tickets
      const ticketButton = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary);
      
      const row = new ActionRowBuilder()
        .addComponents(ticketButton);
      
      // Create an embed for the ticket system
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Support Ticket System')
        .setDescription('Need help? Click the button below to create a support ticket.')
        .setFooter({ text: 'Support tickets are monitored by staff members' });
      
      // Send the message with the button
      await interaction.channel.send({ embeds: [embed], components: [row] });
      
      // Confirm to the user
      await interaction.reply({ content: 'Ticket system has been set up in this channel!', ephemeral: true });
    } catch (error) {
      console.error('Error setting up ticket system:', error);
      await interaction.reply({ content: 'There was an error setting up the ticket system.', ephemeral: true });
    }
  }
};