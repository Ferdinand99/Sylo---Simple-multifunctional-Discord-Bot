# ⚙️ Multi-Functional Discord Bot

> A modern, modular Discord bot built with `discord.js`, offering moderation, ticketing, reaction roles, sticky messages, and utility commands — all in one streamlined package.

---

## ✨ Features

### 🛡️ Moderation
- `/ban` – Ban users with optional message deletion (0–7 days)
- `/kick` – Remove users with a reason
- `/timeout` – Temporarily mute users (e.g., 10m, 1h, 1d)

### 🎫 Ticket System
- Create support tickets via an intuitive modal form
- Admins can configure ticket channels and settings
- Users can submit issues with detailed topics

### 🏷️ Reaction Roles
- Create role menus with up to 5 assignable roles
- Support for exclusive (single-role) and multi-role mode

### 📌 Sticky Messages
- Auto-reposting messages pinned to the bottom of a channel
- Customizable title, color, and content
- Easy `/sticky set` and `/sticky remove` commands

### 🔧 Utilities
- `/help` – List all available commands organized by category

---

## 🚀 Command Usage

```bash
/ban [user] [reason] [days]
/kick [user] [reason]
/timeout [user] [duration] [reason]

/ticket create [topic]
/ticket setup

/roles create [title] [description] [role1–5] [exclusive]

/sticky set [message] [title] [color]
/sticky remove

/help
```

## ⚙️ Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/yourbot.git
   cd yourbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   ```bash
   cp .env.example .env
   # Then add your Discord bot token to .env
   ```

4. Start the bot
   ```bash
   npm start
   ```

## 🧪 Development Mode
To run the bot with auto-restart during development:
```bash
npm run dev
```

## ➕ Adding New Commands
Create a new file in the 'commands' directory and follow the structure of the existing commands.

## This project is licensed under the MIT License.
See LICENSE for details.
