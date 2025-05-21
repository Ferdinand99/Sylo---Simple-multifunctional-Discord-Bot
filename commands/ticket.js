const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new support ticket')
        .addStringOption(option =>
          option.setName('topic')
            .setDescription('Brief topic of your ticket')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Set up the ticket system in a channel')),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'create') {
      // Get the topic if provided directly
      const topic = interaction.options.getString('topic');
      
      // Create a modal for more detailed ticket information
      const modal = new ModalBuilder()
        .setCustomId('ticket_create_modal')
        .setTitle('Create a Support Ticket');
      
      // Add inputs to the modal
      const ticketTopicInput = new TextInputBuilder()
        .setCustomId('ticket_topic')
        .setLabel('Ticket Topic')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Brief description of your issue')
        .setValue(topic || '')
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
    } 
    else if (subcommand === 'setup') {
      // Check if user has admin permissions
      if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({ content: 'You need administrator permissions to set up the ticket system.', ephemeral: true });
      }
      
      const ticketHandler = require('../features/tickets/ticketHandler');
      await ticketHandler.setupTicketSystem(interaction);
    }
  },
}