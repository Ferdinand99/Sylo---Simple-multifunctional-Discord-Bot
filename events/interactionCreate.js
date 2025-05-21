const { Events, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
      }
    }
    
    // Handle button interactions
    else if (interaction.isButton()) {
      // Handle ticket buttons
      if (interaction.customId.startsWith('ticket_')) {
        const ticketAction = interaction.customId.split('_')[1];
        const ticketHandler = require('../features/tickets/ticketHandler');
        
        try {
          await ticketHandler.handleButton(interaction, ticketAction);
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'There was an error processing this ticket action!', ephemeral: true });
        }
      }
      // Handle create ticket button
      else if (interaction.customId === 'create_ticket') {
        const ticketHandler = require('../features/tickets/ticketHandler');
        
        try {
          // Show the ticket creation modal
          const modal = new ModalBuilder()
            .setCustomId('ticket_create_modal')
            .setTitle('Create a Support Ticket');
          
          // Add inputs to the modal
          const ticketTopicInput = new TextInputBuilder()
            .setCustomId('ticket_topic')
            .setLabel('Ticket Topic')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Brief description of your issue')
            .setRequired(true);
          
          const ticketDescriptionInput = new TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Please provide details about your issue')
            .setRequired(false);
          
          const firstActionRow = new ActionRowBuilder().addComponents(ticketTopicInput);
          const secondActionRow = new ActionRowBuilder().addComponents(ticketDescriptionInput);
          
          // Add inputs to the modal
          modal.addComponents(firstActionRow, secondActionRow);
          
          // Show the modal to the user
          await interaction.showModal(modal);
        } catch (error) {
          console.error('Error showing ticket modal:', error);
          await interaction.reply({ content: 'There was an error creating your ticket!', ephemeral: true });
        }
      }
    }
    
    // Handle select menu interactions
    else if (interaction.isStringSelectMenu()) {
      // Handle role selection menus
      if (interaction.customId === 'role_select') {
        const roleHandler = require('../features/reactionRoles/roleHandler');
        
        try {
          await roleHandler.handleSelectMenu(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'There was an error assigning roles!', ephemeral: true });
        }
      }
    }
    
    // Handle modal submissions
    else if (interaction.type === InteractionType.ModalSubmit) {
      // Handle ticket creation modal
      if (interaction.customId === 'ticket_create_modal') {
        const ticketHandler = require('../features/tickets/ticketHandler');
        
        try {
          await ticketHandler.handleModalSubmit(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'There was an error creating your ticket!', ephemeral: true });
        }
      }
    }
  },
};