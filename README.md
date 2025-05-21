# Multi-Functional Discord Bot

A powerful Discord bot built with discord.js that provides multiple functionalities including moderation, ticket system, reaction roles, and sticky messages.

## Features

### 🛡️ Moderation
- **Ban Command**: Ban users with customizable message deletion duration (0-7 days)
- **Kick Command**: Remove users from the server with a specified reason
- **Timeout Command**: Temporarily mute users for a specified duration (minutes, hours, or days)

### 🎫 Ticket System
- **Ticket Creation**: Users can create support tickets with detailed descriptions
- **Ticket Setup**: Administrators can set up the ticket system in designated channels
- **Modal Interface**: User-friendly form for submitting ticket information

### 🏷️ Reaction Roles
- **Role Menu Creation**: Create interactive role selection menus
- **Multiple Roles**: Support for up to 5 different roles per menu
- **Exclusive Mode**: Option to allow users to select only one role or multiple roles

### 📌 Sticky Messages
- **Persistent Messages**: Messages that automatically repost in channels
- **Customization**: Set custom titles, messages, and colors for sticky messages
- **Easy Management**: Simple commands to set and remove sticky messages

### 🔧 Utility
- **Help Command**: Displays all available commands organized by category

## Command Usage

### Moderation Commands
```
/ban [user] [reason] [days] - Ban a user with optional message deletion
/kick [user] [reason] - Kick a user from the server
/timeout [user] [duration] [reason] - Timeout a user (e.g., 10m, 1h, 1d)
```

### Ticket Commands
```
/ticket create [topic] - Create a new support ticket
/ticket setup - Set up the ticket system (Admin only)
```

### Role Commands
```
/roles create [title] [description] [role1-5] [exclusive] - Create a role selection menu
```

### Sticky Message Commands
```
/sticky set [message] [title] [color] - Set a sticky message
/sticky remove - Remove the sticky message from the current channel
```

### Utility Commands
```
/help - Display all available commands
```

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your bot token:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file and add your Discord bot token
5. Start the bot:
   ```
   npm start
   ```

## Development

To run the bot in development mode with auto-restart:

```
npm run dev
```

## Adding New Commands

Create a new file in the `commands` directory following the existing command structure.

## License

ISC