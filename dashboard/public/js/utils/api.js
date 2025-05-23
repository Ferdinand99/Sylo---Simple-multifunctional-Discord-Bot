// API Utility Functions

// Get the base URL from the current window location
const BASE_URL = window.location.origin;

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise with the response data
 */
async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  console.log('Making API request to:', url);

  // Try the request up to 3 times
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`API Error (attempt ${i + 1}/3):`, {
          url,
          status: response.status,
          statusText: response.statusText,
          error
        });
        
        // If we have retries left, wait and continue
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        throw new Error(error.message || `API Error (${response.status}): ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Request failed (attempt ${i + 1}/3):`, error);
      
      // If we have retries left, wait and continue
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      throw error;
    }
  }
}

// User and Guild API
const API = {
  // User endpoints
  getUser: () => fetchAPI('/api/user'),
  getGuilds: () => fetchAPI('/api/guilds'),
  
  // Guild settings
  getGuildSettings: (guildId) => fetchAPI(`/api/guilds/${guildId}/settings`),
  updateGuildSettings: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/settings`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Warnings
  getWarnings: (guildId) => fetchAPI(`/api/guilds/${guildId}/warnings`),
  getUserWarnings: (guildId, userId) => fetchAPI(`/api/guilds/${guildId}/users/${userId}/warnings`),
  addWarning: (guildId, userId, data) => fetchAPI(`/api/guilds/${guildId}/users/${userId}/warnings`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  removeWarning: (guildId, warningId) => fetchAPI(`/api/guilds/${guildId}/warnings/${warningId}`, {
    method: 'DELETE'
  }),
  
  // Tickets
  getTickets: (guildId) => fetchAPI(`/api/guilds/${guildId}/tickets`),
  
  // Reaction Roles
  getReactionRoles: (guildId) => fetchAPI(`/api/guilds/${guildId}/reaction-roles`),
  addReactionRole: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/reaction-roles`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Sticky Messages
  getStickyMessages: (guildId) => fetchAPI(`/api/guilds/${guildId}/sticky-messages`),
  setStickyMessage: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/sticky-messages`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  removeStickyMessage: (guildId, channelId) => fetchAPI(`/api/guilds/${guildId}/sticky-messages/${channelId}`, {
    method: 'DELETE'
  }),
  
  // Moderation Actions
  banUser: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/actions/ban`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  kickUser: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/actions/kick`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  timeoutUser: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/actions/timeout`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  sayMessage: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/actions/say`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Embed Builder
  sendEmbed: (guildId, data) => fetchAPI(`/api/guilds/${guildId}/embeds`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};