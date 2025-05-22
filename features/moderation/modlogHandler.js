/**
 * Moderation Log Handler
 * Handles logging of moderation actions to a designated channel
 */

const { EmbedBuilder } = require('discord.js');

/**
 * Log a moderation action to the configured modlog channel
 * @param {Object} client - Discord client instance
 * @param {Object} guild - Guild where the action occurred
 * @param {Object} options - Logging options
 * @param {String} options.type - Type of moderation action (ban, kick, timeout, warning)
 * @param {Object} options.moderator - User who performed the action
 * @param {Object} options.target - User who was the target of the action
 * @param {String} options.reason - Reason for the moderation action
 * @param {Object} [options.additionalData] - Any additional data specific to the action type
 */
async function logModAction(client, guild, options) {
  // Get the modlog channel ID from environment variables
  const modLogChannelId = process.env.MOD_LOG_CHANNEL;
  if (!modLogChannelId) return;
  
  // Try to fetch the channel
  const modLogChannel = await guild.channels.fetch(modLogChannelId).catch(() => null);
  if (!modLogChannel) return;
  
  // Create an embed for the moderation action
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter({ text: `${options.type.toUpperCase()} | ID: ${options.target.id}` });
  
  // Set color and title based on action type
  switch (options.type.toLowerCase()) {
    case 'ban':
      embed.setColor('#FF0000')
           .setTitle('🔨 User Banned');
      break;
    case 'kick':
      embed.setColor('#FFA500')
           .setTitle('👢 User Kicked');
      break;
    case 'timeout':
      embed.setColor('#FFFF00')
           .setTitle('⏱️ User Timed Out');
      break;
    case 'warning':
      embed.setColor('#FFA500')
           .setTitle(`⚠️ Warning Issued - #${options.additionalData?.warningNumber || '1'}`);
      break;
    default:
      embed.setColor('#7289DA')
           .setTitle('Moderation Action');
  }
  
  // Add common fields
  embed.addFields(
    { name: 'User', value: `${options.target.tag} (${options.target.id})`, inline: true },
    { name: 'Moderator', value: `${options.moderator.tag} (${options.moderator.id})`, inline: true },
    { name: 'Reason', value: options.reason || 'No reason provided' }
  );
  
  // Add action-specific fields
  if (options.type === 'ban' && options.additionalData?.days) {
    embed.addFields({ name: 'Message Deletion', value: `${options.additionalData.days} days` });
  }
  
  if (options.type === 'timeout' && options.additionalData?.duration) {
    embed.addFields({ name: 'Duration', value: options.additionalData.duration });
  }
  
  if (options.type === 'warning' && options.additionalData?.id) {
    embed.addFields({ name: 'Warning ID', value: options.additionalData.id });
  }
  
  // Send the embed to the modlog channel
  await modLogChannel.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { logModAction };