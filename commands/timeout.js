const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a user for a specified duration')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Timeout duration (e.g. 10m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const durationString = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Parse duration string (e.g., 10m, 1h, 1d)
    const durationMs = parseDuration(durationString);
    
    if (!durationMs) {
      return interaction.reply({ 
        content: 'Invalid duration format. Please use formats like 10m, 1h, 1d (m=minutes, h=hours, d=days).', 
        ephemeral: true 
      });
    }
    
    // Check if duration is within Discord's limits (max 28 days)
    const maxTimeoutDuration = 28 * 24 * 60 * 60 * 1000; // 28 days in ms
    if (durationMs > maxTimeoutDuration) {
      return interaction.reply({ 
        content: 'Timeout duration cannot exceed 28 days.', 
        ephemeral: true 
      });
    }
    
    // Get the member from the user
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }
    
    // Check if the bot can timeout the user
    if (!targetMember.moderatable) {
      return interaction.reply({ 
        content: 'I cannot timeout this user. They may have higher permissions than me.', 
        ephemeral: true 
      });
    }
    
    // Check if the user trying to timeout has higher permissions than the target
    if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
      return interaction.reply({ 
        content: 'You cannot timeout this user as they have the same or higher role than you.', 
        ephemeral: true 
      });
    }
    
    // Apply the timeout
    try {
      await targetMember.timeout(durationMs, `${reason} | Timed out by ${interaction.user.tag}`);
      
      // Format the duration for the response message
      const formattedDuration = formatDuration(durationMs);
      
      return interaction.reply({ 
        content: `Successfully timed out ${targetUser.tag} for ${formattedDuration}. Reason: ${reason}` 
      });
    } catch (error) {
      console.error('Error applying timeout:', error);
      return interaction.reply({ 
        content: 'There was an error trying to timeout this user.', 
        ephemeral: true 
      });
    }
  },
};

// Helper function to parse duration strings like 10m, 1h, 1d
function parseDuration(durationString) {
  const regex = /^(\d+)([mhd])$/;
  const match = durationString.match(regex);
  
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  if (isNaN(value) || value <= 0) return null;
  
  switch (unit) {
    case 'm': return value * 60 * 1000; // minutes to ms
    case 'h': return value * 60 * 60 * 1000; // hours to ms
    case 'd': return value * 24 * 60 * 60 * 1000; // days to ms
    default: return null;
  }
}

// Helper function to format duration in ms to a human-readable string
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  return `${seconds} second${seconds === 1 ? '' : 's'}`;
}