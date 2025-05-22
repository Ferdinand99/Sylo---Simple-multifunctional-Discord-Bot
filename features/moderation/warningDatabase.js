/**
 * Warning Database Handler
 * Handles persistent storage of warnings
 */

const fs = require('fs');
const path = require('path');

// Path to the warnings database file
const dbPath = path.join(process.cwd(), 'data', 'warnings.json');

/**
 * Initialize the warnings database
 * @returns {Object} The warnings database object
 */
function initWarningsDB() {
  // Create the data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create the warnings file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), 'utf8');
    return {};
  }
  
  // Read and parse the warnings file
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading warnings database:', error);
    return {};
  }
}

/**
 * Save the warnings database
 * @param {Object} warningsDB - The warnings database object
 */
function saveWarningsDB(warningsDB) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(warningsDB, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving warnings database:', error);
  }
}

/**
 * Get all warnings for a user in a guild
 * @param {String} guildId - The ID of the guild
 * @param {String} userId - The ID of the user
 * @returns {Array} Array of warning objects
 */
function getUserWarnings(guildId, userId) {
  const warningsDB = initWarningsDB();
  if (!warningsDB[guildId]) return [];
  if (!warningsDB[guildId][userId]) return [];
  return warningsDB[guildId][userId];
}

/**
 * Add a warning for a user in a guild
 * @param {String} guildId - The ID of the guild
 * @param {String} userId - The ID of the user
 * @param {Object} warning - The warning object
 * @returns {Object} The added warning object
 */
function addWarning(guildId, userId, warning) {
  const warningsDB = initWarningsDB();
  
  // Initialize guild and user entries if they don't exist
  if (!warningsDB[guildId]) warningsDB[guildId] = {};
  if (!warningsDB[guildId][userId]) warningsDB[guildId][userId] = [];
  
  // Add the warning
  warningsDB[guildId][userId].push(warning);
  
  // Save the database
  saveWarningsDB(warningsDB);
  
  return warning;
}

/**
 * Remove a warning by ID
 * @param {String} guildId - The ID of the guild
 * @param {String} userId - The ID of the user
 * @param {String} warningId - The ID of the warning to remove
 * @returns {Boolean} Whether the warning was successfully removed
 */
function removeWarning(guildId, userId, warningId) {
  const warningsDB = initWarningsDB();
  
  if (!warningsDB[guildId] || !warningsDB[guildId][userId]) return false;
  
  const initialLength = warningsDB[guildId][userId].length;
  warningsDB[guildId][userId] = warningsDB[guildId][userId].filter(warning => warning.id !== warningId);
  
  if (warningsDB[guildId][userId].length === initialLength) return false;
  
  saveWarningsDB(warningsDB);
  return true;
}

module.exports = {
  getUserWarnings,
  addWarning,
  removeWarning
};