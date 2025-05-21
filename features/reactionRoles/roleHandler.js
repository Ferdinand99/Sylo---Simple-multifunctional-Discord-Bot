const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  // Handle select menu interactions for role assignment
  async handleSelectMenu(interaction) {
    const { values, member } = interaction;
    const guild = interaction.guild;
    
    // Get the roles configuration for this menu
    // In a real implementation, this would be stored in a database
    const roleMenus = interaction.client.roleMenus || new Map();
    const menuConfig = roleMenus.get(interaction.message.id);
    
    if (!menuConfig) {
      return interaction.reply({ content: 'This role menu is no longer configured.', ephemeral: true });
    }
    
    // Track which roles were added and removed
    const addedRoles = [];
    const removedRoles = [];
    const failedRoles = [];
    
    // Process each selected role
    for (const roleId of values) {
      const role = guild.roles.cache.get(roleId);
      
      if (!role) {
        failedRoles.push(`Unknown role (${roleId})`);
        continue;
      }
      
      // Check if the bot can manage this role
      if (role.position >= guild.members.me.roles.highest.position) {
        failedRoles.push(role.name);
        continue;
      }
      
      // Add the role if the member doesn't have it
      if (!member.roles.cache.has(role.id)) {
        try {
          await member.roles.add(role);
          addedRoles.push(role.name);
        } catch (error) {
          console.error(`Error adding role ${role.name}:`, error);
          failedRoles.push(role.name);
        }
      }
    }
    
    // Handle role removal for exclusive menus
    if (menuConfig.exclusive) {
      // Get all configured roles for this menu
      const allConfiguredRoles = menuConfig.roles.map(r => r.id);
      
      // Find roles to remove (roles the member has that weren't selected)
      const rolesToRemove = member.roles.cache
        .filter(role => allConfiguredRoles.includes(role.id) && !values.includes(role.id))
        .map(role => role.id);
      
      // Remove each role
      for (const roleId of rolesToRemove) {
        const role = guild.roles.cache.get(roleId);
        
        if (role && role.position < guild.members.me.roles.highest.position) {
          try {
            await member.roles.remove(role);
            removedRoles.push(role.name);
          } catch (error) {
            console.error(`Error removing role ${role.name}:`, error);
            failedRoles.push(`${role.name} (removal)`);
          }
        }
      }
    }
    
    // Build response message
    let responseContent = '';
    
    if (addedRoles.length > 0) {
      responseContent += `✅ Added roles: ${addedRoles.join(', ')}\n`;
    }
    
    if (removedRoles.length > 0) {
      responseContent += `🗑️ Removed roles: ${removedRoles.join(', ')}\n`;
    }
    
    if (failedRoles.length > 0) {
      responseContent += `❌ Failed to modify roles: ${failedRoles.join(', ')}\n`;
    }
    
    if (!responseContent) {
      responseContent = 'No role changes were made.';
    }
    
    // Reply with the results
    await interaction.reply({ content: responseContent, ephemeral: true });
  },
  
  // Create a new role selection menu
  async createRoleMenu(interaction, title, description, roles, exclusive = false) {
    // Validate roles
    if (!roles || roles.length === 0) {
      return interaction.reply({ content: 'You must provide at least one role for the menu.', ephemeral: true });
    }
    
    // Create the embed for the role menu
    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle(title || 'Role Selection')
      .setDescription(description || 'Select roles from the menu below:')
      .setFooter({ text: exclusive ? 'You can select only one role at a time' : 'You can select multiple roles' })
      .setTimestamp();
    
    // Create the select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('role_select')
      .setPlaceholder('Select roles...')
      .setMinValues(0)
      .setMaxValues(exclusive ? 1 : roles.length);
    
    // Add options for each role
    for (const role of roles) {
      selectMenu.addOptions({
        label: role.name,
        value: role.id,
        description: `Get the ${role.name} role`,
      });
    }
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    // Send the message with the role menu
    const message = await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Store the configuration for this menu
    // In a real implementation, this would be saved to a database
    if (!interaction.client.roleMenus) {
      interaction.client.roleMenus = new Map();
    }
    
    interaction.client.roleMenus.set(message.id, {
      messageId: message.id,
      channelId: message.channel.id,
      guildId: message.guild.id,
      roles: roles.map(r => ({ id: r.id, name: r.name })),
      exclusive: exclusive,
      createdBy: interaction.user.id,
      createdAt: new Date()
    });
    
    return message;
  }
};