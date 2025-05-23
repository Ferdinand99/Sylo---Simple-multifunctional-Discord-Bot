# Discord Bot Dashboard

A full-stack web dashboard for managing your Discord bot.

## Features

- 🔐 **Secure Authentication**: Uses Discord OAuth2 for user login
- 🛡️ **Moderation Tools**: 
  - Ban, kick, and timeout users
  - View and manage warnings
  - Set modlog channel
- 🎫 **Ticket System**: Configure and manage support tickets
- 🏷️ **Reaction Roles**: Create up to 5-role menus
- 📌 **Sticky Messages**: Set and manage sticky messages per channel
- 🌈 **Embed Builder**: Visual editor for creating and sending Discord embeds
- ⚙️ **Server Settings**: Configure bot features per server

## Setup

1. Create a `.env` file in the root directory and fill in the required values:
```env
# Discord Bot Configuration
TOKEN=your_discord_bot_token_here

# Dashboard Configuration
CLIENT_ID=your_discord_client_id_here
CLIENT_SECRET=your_discord_client_secret_here
REDIRECT_URI=http://localhost:8124/auth/discord/callback
DASHBOARD_PORT=8124
SESSION_SECRET=your_random_string_here
```

2. Ensure your Discord application has the following settings:
   - OAuth2 redirect URI: `http://localhost:8124/auth/discord/callback`
   - Required scopes: `identify`, `guilds`
   - Required bot permissions: `Administrator` (or specific permissions for moderation, etc.)

## Usage

1. Start the bot and dashboard:
```bash
node index.js
```

2. Access the dashboard at `http://localhost:8124`

3. Log in with Discord and select a server to manage

## API Endpoints

### Authentication
- `GET /auth/discord`: Initiate Discord OAuth2 login
- `GET /auth/discord/callback`: OAuth2 callback URL
- `GET /auth/logout`: Log out current user

### Server Management
- `GET /api/guilds`: Get list of manageable servers
- `GET /api/guilds/:guildId/settings`: Get server settings
- `POST /api/guilds/:guildId/settings`: Update server settings

### Moderation
- `GET /api/guilds/:guildId/warnings`: Get all warnings
- `POST /api/guilds/:guildId/actions/ban`: Ban a user
- `POST /api/guilds/:guildId/actions/kick`: Kick a user
- `POST /api/guilds/:guildId/actions/timeout`: Timeout a user
- `POST /api/guilds/:guildId/actions/say`: Send a message

### Features
- `GET /api/guilds/:guildId/tickets`: Get tickets
- `GET /api/guilds/:guildId/reaction-roles`: Get reaction roles
- `POST /api/guilds/:guildId/reaction-roles`: Create reaction role
- `GET /api/guilds/:guildId/sticky-messages`: Get sticky messages
- `POST /api/guilds/:guildId/sticky-messages`: Create/update sticky message
- `POST /api/guilds/:guildId/embeds`: Send embed message

## Security

- Users must be authenticated via Discord OAuth2
- Users can only manage servers where they have the `MANAGE_GUILD` permission
- API endpoints are protected with session-based authentication
- Environment variables are used for sensitive configuration
- Input validation is performed on all API endpoints

## Technologies Used

- Backend:
  - Express.js for the API server
  - SQLite for data storage
  - Passport.js for authentication
  
- Frontend:
  - React (or vanilla JS) for UI components
  - Tailwind CSS for styling
  - REST API for data fetching