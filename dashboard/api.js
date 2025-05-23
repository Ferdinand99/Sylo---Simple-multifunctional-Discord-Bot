/**
 * Dashboard API Server
 * Express server for the bot dashboard
 */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const cors = require('cors');
const db = require('../database/db');
const stickyHandler = require('../features/stickyMessages/stickyHandler');

// Store bot's guild cache
const botGuildsCache = new Map();

// Function to update bot guilds cache
function updateBotGuildsCache(client) {
  if (!client || !client.guilds) {
    console.log('Cannot update cache: Invalid client');
    return;
  }
  
  try {
    client.guilds.cache.forEach(guild => {
      const guildData = {
        id: guild.id || 'unknown',
        name: guild.name || 'Unknown Guild',
        icon: guild.icon || null,
        memberCount: Number(guild.memberCount) || 0,
        channels: guild.channels ? guild.channels.cache.size : 0,
        roles: guild.roles ? guild.roles.cache.size : 0
      };
      botGuildsCache.set(guild.id, guildData);
    });
    
    console.log('Bot guilds cache updated:', botGuildsCache.size, 'guilds');
  } catch (error) {
    console.error('Error updating guild cache:', error);
  }
}

// Initialize database schema
async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        modlog_channel TEXT,
        enabled_features TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS sticky_messages (
        channel_id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        content TEXT NOT NULL,
        title TEXT,
        color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database schema initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Check required environment variables
const requiredEnvVars = ['CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please ensure these are set in your .env file');
  process.exit(1);
}

// Initialize database
initializeDatabase();

// Create Express app
const app = express();
const PORT = process.env.DASHBOARD_PORT || 8124;

// Middleware setup in correct order
app.use(cors({
  origin: process.env.DASHBOARD_URL || 'http://localhost:8124',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration - must be before passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'sylo-dashboard-secret',
  name: 'sylo.sid',  // Custom session cookie name
  resave: true,      // Required for session persistence
  saveUninitialized: true,  // Required for session persistence
  rolling: true,     // Reset maxAge on every response
  cookie: {
    secure: false,   // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Discord OAuth2 strategy
passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI || 'http://localhost:8124/auth/discord/callback',
  scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('OAuth callback - Start');

    // Create user with minimal data first
    const user = {
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
      guilds: [], // Start with empty guilds array
      accessToken,
      refreshToken
    };

    // Try to fetch guilds in the background
    setTimeout(async () => {
      try {
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (guildsResponse.ok) {
          const guilds = await guildsResponse.json();
          console.log('Fetched guilds in background:', guilds.length);
          user.guilds = guilds;
          users.set(user.id, user); // Update stored user data
        } else {
          console.error('Failed to fetch guilds:', await guildsResponse.text());
          // Will retry later through the /api/guilds endpoint
        }
      } catch (error) {
        console.error('Error fetching guilds in background:', error);
      }
    }, 1000);

    console.log('OAuth callback - Created user object, fetching guilds in background');
    return done(null, user);
  } catch (error) {
    console.error('OAuth callback - Error:', error);
    return done(error);
  }
}));

// Authentication route handlers
app.get('/auth/discord', (req, res, next) => {
  console.log('Starting Discord auth...');
  passport.authenticate('discord')(req, res, next);
});

// Handle session serialization errors
app.use((err, req, res, next) => {
  console.error('Session error:', err);
  if (err.name === 'SessionError') {
    return res.status(500).json({ error: 'Session error occurred' });
  }
  next(err);
});

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Store serialized users
const users = new Map();

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  users.set(user.id, user);
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  console.log('Deserializing user:', userId);
  try {
    const user = users.get(userId);
    if (user) {
      console.log('Found stored user data');
      done(null, user);
    } else {
      console.log('No stored user data, creating minimal user object');
      const minimalUser = {
        id: userId,
        username: 'Discord User',
        guilds: [] // Empty guilds array
      };
      done(null, minimalUser);
    }
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error);
  }
});

// Add session debug middleware
app.use((req, res, next) => {
  console.log('Request session state:');
  console.log('- URL:', req.url);
  console.log('- Session ID:', req.sessionID);
  console.log('- Session:', req.session);
  console.log('- Session Cookie:', req.session?.cookie);
  console.log('- Is Authenticated:', req.isAuthenticated());
  console.log('- User:', req.user);
  next();
});

// Authentication callback
app.get('/auth/discord/callback', (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    console.log('Auth callback - Started');
    
    if (err) {
      console.error('Auth error:', err);
      return res.redirect('/?error=' + encodeURIComponent('Authentication failed. Please try again.'));
    }

    if (!user) {
      console.error('No user:', info);
      return res.redirect('/?error=' + encodeURIComponent(info && info.message ? info.message : 'Login failed. Please try again.'));
    }

    console.log('Auth successful:', {
      id: user.id,
      username: user.username,
      guildsCount: user.guilds ? user.guilds.length : 0
    });

    // Delay before fetching guilds to avoid rate limit
    setTimeout(async () => {
      try {
        // Refresh guilds data after a delay
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        });

        if (guildsResponse.ok) {
          const guilds = await guildsResponse.json();
          console.log('Refreshed guilds data:', guilds.length);
          user.guilds = guilds;
          users.set(user.id, user); // Update stored user data
        }
      } catch (error) {
        console.error('Error fetching guilds after delay:', error);
      }
    }, 1000); // 1 second delay

    // Store full user data in our Map
    users.set(user.id, user);

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/?error=' + encodeURIComponent('Failed to complete login. Please try again.'));
      }

      console.log('Auth callback - User authenticated:', {
        id: user.id,
        username: user.username,
        sessionID: req.sessionID
      });

      // Default redirect destination
      const destination = '/dashboard';

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect('/?error=' + encodeURIComponent('Security error. Please try again.'));
        }

        // Set user data in new session
        req.session.passport = { user: user.id };
        
        // Save the session
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.redirect('/?error=' + encodeURIComponent('Failed to save session. Please try again.'));
          }
          console.log('Session saved successfully');
          res.redirect(destination);
        });
      });
    });
  })(req, res, next);
});

app.get('/auth/logout', (req, res) => {
  console.log('Logout request - Session:', {
    id: req.sessionID,
    user: req.user?.id
  });

  const userId = req.user?.id;

  // Clear user data from memory
  if (userId) {
    console.log('Removing user data for:', userId);
    users.delete(userId);
  }

  // First, log the user out
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Error during logout' });
    }

    // Then destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Error clearing session' });
      }

      // Clear the session cookie
      res.clearCookie('sylo.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      
      console.log('Logout successful - Session and user data cleared');
      res.redirect('/?message=' + encodeURIComponent('Successfully logged out'));
    });
  });
});

// Auth middleware
function isAuthenticated(req, res, next) {
  console.log('Auth check - Session:', {
    id: req.sessionID,
    cookie: req.session?.cookie,
    user: req.session?.passport?.user
  });

  // Check if session exists
  if (!req.session) {
    console.error('No session found');
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  // Check if session is expired
  if (req.session.cookie && req.session.cookie.expired) {
    console.error('Session expired');
    return res.status(401).json({ error: 'Session expired' });
  }

  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    console.error('User not authenticated');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user object exists
  if (!req.user) {
    console.error('No user object in authenticated session');
    return res.status(401).json({ error: 'Invalid session state' });
  }

  // Log successful auth
  console.log('Auth successful for user:', {
    id: req.user.id,
    username: req.user.username
  });

  // Update session expiry
  req.session.touch();
  
  return next();
}

// API Routes

// Get user info
app.get('/api/user', isAuthenticated, (req, res) => {
  console.log('User data:', req.user);  // Debug log
  res.json(req.user || null);
});

// Get guilds where user has MANAGE_GUILD permission
app.get('/api/guilds', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching guilds for user:', req.user.id);
    
    const lastFetchTime = req.user.lastGuildsFetch || 0;
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Check if we need to refresh guilds data
    if (!req.user.guilds?.length || (now - lastFetchTime > cacheExpiry)) {
      console.log('Guild data needs refresh');
      
      try {
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`
          }
        });

        if (guildsResponse.ok) {
          const freshGuilds = await guildsResponse.json();
          console.log('Refreshed guild data:', freshGuilds.length, 'guilds');
          req.user.guilds = freshGuilds;
          req.user.lastGuildsFetch = now;
          users.set(req.user.id, req.user);
        } else if (guildsResponse.status === 429) {
          const retryAfter = guildsResponse.headers.get('retry-after') || 5;
          console.log('Rate limited when fetching guilds, retry after:', retryAfter);
          
          // If we have no cached data, wait and retry once
          if (!req.user.guilds?.length) {
            console.log('No cached data, waiting to retry...');
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            
            const retryResponse = await fetch('https://discord.com/api/users/@me/guilds', {
              headers: {
                Authorization: `Bearer ${req.user.accessToken}`
              }
            });

            if (retryResponse.ok) {
              const retryGuilds = await retryResponse.json();
              console.log('Got guilds after retry:', retryGuilds.length);
              req.user.guilds = retryGuilds;
              req.user.lastGuildsFetch = now;
              users.set(req.user.id, req.user);
            } else {
              console.error('Retry failed:', await retryResponse.text());
            }
          }
        } else {
          console.error('Failed to fetch guilds:', await guildsResponse.text());
        }
      } catch (error) {
        console.error('Error fetching guilds:', error);
      }
    }

    // Use whatever guild data we have (fresh or cached)
    const userGuilds = req.user.guilds || [];
    console.log('Processing', userGuilds.length, 'guilds');

    // Filter and merge with bot data
    const guilds = userGuilds.filter(guild => {
      // Check if user has MANAGE_GUILD permission (0x20)
      const hasPermission = (guild.permissions & 0x20) === 0x20;
      // Check if bot is in the guild
      const botGuild = botGuildsCache.get(guild.id);
      
      if (hasPermission && botGuild) {
        // Merge bot data with guild data
        Object.assign(guild, {
          memberCount: botGuild.memberCount,
          channelCount: botGuild.channels,
          roleCount: botGuild.roles,
          botPresent: true,
          lastUpdated: botGuild.lastUpdated || Date.now()
        });
        return true;
      }
      return false;
    });

    // Return results with meta info
    res.json({
      guilds,
      meta: {
        total: userGuilds.length,
        filtered: guilds.length,
        cached: req.user.lastGuildsFetch ? true : false,
        lastFetch: req.user.lastGuildsFetch
      }
    });
  } catch (error) {
    console.error('Error processing guilds:', error);
    res.status(500).json({ error: 'Failed to process server data' });
  }
});

// Get guild statistics
// Get guild statistics
app.get('/api/guilds/:guildId/stats', isAuthenticated, async (req, res) => {

  try {
    const { guildId } = req.params;
    
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Fetch guild information
    const stats = {
      members: guild.memberCount,
      channels: guild.channels.cache.size,
      roles: guild.roles.cache.size
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching guild stats:', error);
    res.status(500).json({ error: 'Failed to fetch guild stats' });
  }
});

// Get guild channels
app.get('/api/guilds/:guildId/channels', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Get text channels only
    const channels = guild.channels.cache
      .filter(channel => channel.type === 0) // 0 is TextChannel
      .map(channel => ({
        id: channel.id,
        name: channel.name
      }));

    res.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Guild settings routes
app.get('/api/guilds/:guildId/settings', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const settings = await db.get('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
    res.json(settings || { guild_id: guildId, enabled_features: '{}' });
  } catch (error) {
    console.error('Error fetching guild settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/guilds/:guildId/settings', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { modlog_channel, enabled_features } = req.body;
    
    // Check if settings exist
    const existing = await db.get('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
    
    if (existing) {
      await db.run(
        'UPDATE guild_settings SET modlog_channel = ?, enabled_features = ? WHERE guild_id = ?',
        [modlog_channel, JSON.stringify(enabled_features), guildId]
      );
    } else {
      await db.run(
        'INSERT INTO guild_settings (guild_id, modlog_channel, enabled_features) VALUES (?, ?, ?)',
        [guildId, modlog_channel, JSON.stringify(enabled_features)]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating guild settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Warnings routes
app.get('/api/guilds/:guildId/warnings', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const warnings = await db.all('SELECT * FROM warnings WHERE guild_id = ?', [guildId]);
    res.json(warnings);
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/guilds/:guildId/users/:userId/warnings', isAuthenticated, async (req, res) => {
  try {
    const { guildId, userId } = req.params;
    const warnings = await db.all(
      'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?',
      [guildId, userId]
    );
    res.json(warnings);
  } catch (error) {
    console.error('Error fetching user warnings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/guilds/:guildId/users/:userId/warnings', isAuthenticated, async (req, res) => {
  try {
    const { guildId, userId } = req.params;
    const { reason, moderator_id } = req.body;
    
    const result = await db.run(
      'INSERT INTO warnings (id, guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [Date.now().toString(), guildId, userId, moderator_id, reason, Date.now()]
    );
    
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error adding warning:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/guilds/:guildId/warnings/:warningId', isAuthenticated, async (req, res) => {
  try {
    const { guildId, warningId } = req.params;
    
    await db.run(
      'DELETE FROM warnings WHERE guild_id = ? AND id = ?',
      [guildId, warningId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing warning:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tickets routes
app.get('/api/guilds/:guildId/tickets', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const tickets = await db.all('SELECT * FROM tickets WHERE guild_id = ?', [guildId]);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reaction roles routes
app.get('/api/guilds/:guildId/reaction-roles', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const roles = await db.all('SELECT * FROM reaction_roles WHERE guild_id = ?', [guildId]);
    res.json(roles);
  } catch (error) {
    console.error('Error fetching reaction roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/guilds/:guildId/reaction-roles', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { message_id, role_id, emoji, exclusive } = req.body;
    
    await db.run(
      'INSERT INTO reaction_roles (guild_id, message_id, role_id, emoji, exclusive) VALUES (?, ?, ?, ?, ?)',
      [guildId, message_id, role_id, emoji, exclusive ? 1 : 0]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding reaction role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sticky messages routes
app.get('/api/guilds/:guildId/sticky-messages', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const messages = await db.all('SELECT * FROM sticky_messages WHERE guild_id = ?', [guildId]);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching sticky messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/guilds/:guildId/sticky-messages', isAuthenticated, async (req, res) => {
  console.log('Received sticky message request:', {
    guildId: req.params.guildId,
    body: req.body,
    user: req.user?.id
  });

  try {
    const { guildId } = req.params;
    const { channel_id, content, title, color } = req.body;

    console.log('Creating sticky message:', {
      guildId,
      channelId: channel_id,
      content: content.substring(0, 50) + '...',
      title,
      color
    });

    // Get guild and channel
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      console.error('Guild not found:', guildId);
      return res.status(404).json({ error: 'Guild not found' });
    }

    const channel = guild.channels.cache.get(channel_id);
    if (!channel) {
      console.error('Channel not found:', channel_id);
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Initialize embed data if title or color is provided
    const embedData = title || color ? { title, color } : null;
    console.log('Embed data:', embedData);

    // Validate input
    if (!channel_id || !content) {
      return res.status(400).json({ error: 'Channel ID and content are required' });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content must be a non-empty string' });
    }

    // Log full request details
    console.log('Creating sticky message with data:', {
      guild: guild.name,
      channel: channel.name,
      contentLength: content.length,
      embedData: {
        title,
        color,
        hasTitle: !!title,
        hasColor: !!color
      },
      user: {
        id: req.user.id,
        username: req.user.username
      }
    });

    // Try to set sticky message
    let message;
    try {
      // Check bot permissions first
      const botMember = await channel.guild.members.fetchMe();
      const permissions = channel.permissionsFor(botMember);
      
      if (!permissions.has(['ViewChannel', 'SendMessages'])) {
        throw new Error('Bot missing required permissions: VIEW_CHANNEL, SEND_MESSAGES');
      }

      if (embedData && !permissions.has('EmbedLinks')) {
        throw new Error('Bot missing required permission: EMBED_LINKS');
      }

      message = await stickyHandler.setSticky(channel, content, embedData, req.user);
    } catch (error) {
      console.error('Failed to set sticky message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }

    // Log success
    console.log('Sticky message created successfully:', {
      channelId: channel.id,
      messageId: message.id,
      guildId: guild.id
    });

    // Return success response
    res.json({
      success: true,
      messageId: message.id,
      message: 'Sticky message set successfully'
    });

  } catch (error) {
    console.error('Error in sticky message creation:', error);
    console.error('Stack trace:', error.stack);
    console.error('Additional context:', {
      guildId,
      channelId: channel_id,
      hasContent: !!content,
      hasTitle: !!title,
      hasColor: !!color
    });

    // Send appropriate error response
    const statusCode = error.code || 500;
    res.status(statusCode).json({
      error: error.message || 'Internal server error',
      code: statusCode,
      context: {
        guildId,
        channelId: channel_id,
        type: error.name || 'Unknown'
      }
    });
  }
});

app.delete('/api/guilds/:guildId/sticky-messages/:channelId', isAuthenticated, async (req, res) => {
  try {
    const { guildId, channelId } = req.params;

    // Get guild and channel
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Remove sticky message
    await stickyHandler.removeSticky(channel);

    res.json({
      success: true,
      message: 'Sticky message removed successfully'
    });
  } catch (error) {
    console.error('Error removing sticky message:', error);
    res.status(500).json({
      error: 'Failed to remove sticky message',
      details: error.message
    });
  }
});

// Moderation action routes
app.post('/api/guilds/:guildId/actions/ban', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { userId, reason, days = 7 } = req.body;
    
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    await guild.members.ban(userId, {
      deleteMessageDays: days,
      reason: reason || 'Banned via dashboard'
    });
    
    res.json({ success: true, message: `User ${userId} has been banned` });
  } catch (error) {
    console.error('Error executing ban action:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

app.post('/api/guilds/:guildId/actions/kick', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { userId, reason } = req.body;
    
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const member = await guild.members.fetch(userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await member.kick(reason || 'Kicked via dashboard');
    
    res.json({ success: true, message: `User ${userId} has been kicked` });
  } catch (error) {
    console.error('Error executing kick action:', error);
    res.status(500).json({ error: 'Failed to kick user' });
  }
});

app.post('/api/guilds/:guildId/actions/timeout', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { userId, reason, duration } = req.body;
    
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const member = await guild.members.fetch(userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Convert duration from minutes to milliseconds
    const timeoutDuration = parseInt(duration) * 60 * 1000;
    await member.timeout(timeoutDuration, reason || 'Timed out via dashboard');
    
    res.json({ success: true, message: `User ${userId} has been timed out for ${duration} minutes` });
  } catch (error) {
    console.error('Error executing timeout action:', error);
    res.status(500).json({ error: 'Failed to timeout user' });
  }
});

app.post('/api/guilds/:guildId/actions/say', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { channelId, message } = req.body;
    
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    await channel.send(message);
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Embed builder route
app.post('/api/guilds/:guildId/embeds', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { channelId, embed } = req.body;
    
    // Validate request
    if (!channelId || !embed) {
      return res.status(400).json({ error: 'Missing channelId or embed data' });
    }

    // Get guild
    const guild = app.locals.client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Get channel
    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Log attempt
    console.log('Attempting to send embed:', {
      guild: guild.name,
      channel: channel.name,
      title: embed.title || 'No title'
    });

    // Send embed
    const message = await channel.send({ embeds: [embed] });
    console.log('Embed sent:', message.id);

    // Return success
    return res.json({
      success: true,
      messageId: message.id
    });

  } catch (error) {
    console.error('Error sending embed:', error);
    return res.status(500).json({
      error: 'Failed to send embed',
      message: error.message
    });
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For any other request, send the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Start the dashboard server and set up bot integration
 */
function startDashboard(client) {
  // Store Discord client reference
  app.locals.client = client;
  
  // Initialize cache when client is ready
  function initializeCache() {
    try {
      console.log('Initializing guild cache...');
      updateBotGuildsCache(client);
      console.log('Guild cache initialized with', botGuildsCache.size, 'guilds');
    } catch (error) {
      console.error('Failed to initialize guild cache:', error);
    }
  }

  // Initialize default guild settings
  async function initializeGuildSettings(guildId) {
    try {
      const settings = await db.get('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);
      if (!settings) {
        // Create default settings with features enabled
        const defaultFeatures = {
          moderation: true,
          tickets: true,
          stickyMessages: true,
          reactionRoles: true
        };
        
        await db.run(
          'INSERT INTO guild_settings (guild_id, enabled_features) VALUES (?, ?)',
          [guildId, JSON.stringify(defaultFeatures)]
        );
        console.log('Created default settings for guild:', guildId);
      }
    } catch (error) {
      console.error('Error initializing guild settings:', error);
    }
  }
  
  // Initial cache setup
  if (client.isReady()) {
    initializeCache();
    // Initialize settings for all guilds
    client.guilds.cache.forEach(guild => {
      initializeGuildSettings(guild.id);
    });
  } else {
    client.once('ready', () => {
      initializeCache();
      client.guilds.cache.forEach(guild => {
        initializeGuildSettings(guild.id);
      });
    });
  }

  // Update cache on guild changes
  client.on('guildCreate', async guild => {
    try {
      // Update cache
      const guildData = {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        memberCount: guild.memberCount || 0,
        channels: guild.channels?.cache.size || 0,
        roles: guild.roles?.cache.size || 0
      };
      botGuildsCache.set(guild.id, guildData);
      
      // Initialize settings
      await initializeGuildSettings(guild.id);
      
      console.log('Added new guild to cache and initialized settings:', guild.name);
    } catch (error) {
      console.error('Error processing new guild:', error);
    }
  });

  client.on('guildDelete', guild => {
    try {
      botGuildsCache.delete(guild.id);
      console.log('Removed guild from cache:', guild.name);
    } catch (error) {
      console.error('Error removing guild from cache:', error);
    }
  });

  // Periodic cache refresh
  setInterval(initializeCache, 5 * 60 * 1000);

  // Start server
  app.listen(PORT, () => {
    console.log(`Dashboard running on port ${PORT}`);
    console.log(`Bot is in ${botGuildsCache.size} guilds`);
  });
}

// Export the dashboard functionality
module.exports = {
  startDashboard
};