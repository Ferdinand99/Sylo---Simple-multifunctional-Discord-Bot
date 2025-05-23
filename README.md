# ⚙️ SYLO - A Multi-Functional Discord Bot

![output-onlinepngtools](https://github.com/user-attachments/assets/6257db2a-78c6-4896-8b45-aa96780e30dc)


> A modern, modular Discord bot built with `discord.js`, offering moderation, ticketing, reaction roles, sticky messages, and utility commands — now with a web dashboard for configuration and embed management.

---

[![Invite SYLO to Your Server](https://img.shields.io/badge/Invite%20SYLO-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1374856793469227029)

---

## ✨ Features

### 🛡️ Moderation
- `/ban` – Ban users with optional message deletion (0–7 days)
- `/kick` – Remove users with a reason
- `/timeout` – Temporarily mute users (e.g., 10m, 1h, 1d)
- `/warning` – Issue a warning to a user with a reason
- `/warnings` – View warning history for a specific user
- `/removewarning` – Remove a specific warning from a user
- `/say` – Send messages as the bot to any channel
- `/clear` – Delete multiple messages from a channel (1–100)

All moderation actions are logged to a configured modlog channel.

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

## 🌐 Web Dashboard (Only available when you self-host the bot. ***For now***)

SYLO includes a built-in web dashboard that launches automatically alongside the bot.

### 📍 Access
- URL: `http://localhost:8124`
- Launches with `index.js`
- Requires Discord login via OAuth2

### 🧩 Dashboard Features

| Feature           | Status         | Description                                                             |
|-------------------|----------------|-------------------------------------------------------------------------|
| **Moderation**     | Coming Soon     | Enable/disable commands, manage logs and warnings                      |
| **Reaction Roles** | Coming Soon     | Create and manage reaction role menus                                  |
| **Sticky Messages**| ✅ Working      | Set and remove sticky messages with style customization                |
| **Utilities**      | Coming Soon     | View command documentation and current config                          |
| **Embed Builder**  | ✅ Working      | Build and send styled Discord embeds using a visual interface          |

---

## 🚀 Command Usage

```bash
/ban [user] [reason] [days]
/kick [user] [reason]
/timeout [user] [duration] [reason]
/warning [user] [reason]
/warnings [user]
/removewarning [user] [warning_id]
/say [channel] [message]
/clear [amount] [user]

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
Create a new file in the `commands` directory and follow the structure of the existing commands.

## 🔗 Useful Links

- [Invite SYLO to Your Server](https://discord.com/oauth2/authorize?client_id=1374856793469227029)
- [Terms of Service](./TERMS.md)
- [Privacy Policy](./PRIVACY.md)
- [Support Server](https://discord.gg/46Z76eZJVt)

## This project is licensed under the MIT License.
See [LICENSE](./LICENSE) for details.
