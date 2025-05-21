const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Manage reaction roles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new role selection menu')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Title for the role menu')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description for the role menu')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role1')
            .setDescription('First role to include')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role2')
            .setDescription('Second role to include')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role3')
            .setDescription('Third role to include')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role4')
            .setDescription('Fourth role to include')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role5')
            .setDescription('Fifth role to include')
            .setRequired(false))
        .addBooleanOption(option =>
          option.setName('exclusive')
            .setDescription('Whether users can select only one role (true) or multiple roles (false)')
            .setRequired(false)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'create') {
      // Get options
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const exclusive = interaction.options.getBoolean('exclusive') || false;
      
      // Collect all provided roles
      const roles = [];
      for (let i = 1; i <= 5; i++) {
        const role = interaction.options.getRole(`role${i}`);
        if (role) {
          // Check if the role is manageable by the bot
          if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
              content: `I cannot assign the role ${role.name} because it's positioned higher than my highest role. Please move my role above it in the server settings.`,
              ephemeral: true
            });
          }
          roles.push(role);
        }
      }
      
      // Create the role menu
      const roleHandler = require('../features/reactionRoles/roleHandler');
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const message = await roleHandler.createRoleMenu(interaction, title, description, roles, exclusive);
        await interaction.editReply({ content: `Role selection menu created successfully! [Jump to message](${message.url})`, ephemeral: true });
      } catch (error) {
        console.error('Error creating role menu:', error);
        await interaction.editReply({ content: 'There was an error creating the role menu.', ephemeral: true });
      }
    }
  },
};