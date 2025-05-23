# 🌐 SYLO Dashboard Integration Instructions

This document outlines how to build a full-stack web dashboard for your existing Discord bot project (coded in `discord.js`) — fully integrated into the same project and launched alongside your bot.

---

## 🎯 Key Requirements

### 1. 🔧 Launch Dashboard Server

- When running the bot via `index.js`, also launch an Express.js API server on **port `8124`**
- The dashboard API should live inside a new folder: `dashboard/`
- The dashboard is tightly coupled with the bot — **no separate repo or hosting required**

---

### 2. 🧱 Tech Stack

- **SQLite** for the database (shared between bot and dashboard)
- **Express.js** for the API backend → `dashboard/api.js`
- **React** or plain HTML/CSS/JS for the frontend → `dashboard/public/`
- **Static file serving** via Express for frontend
- **REST API** used for frontend-backend communication
- Dashboard available at: `http://localhost:8124`

---

### 3. ✨ Dashboard Features

Allow users to configure and control SYLO’s main features:

#### 🛡️ Moderation
- Enable/disable moderation commands per guild
- Set the modlog channel (channel ID stored per guild)
- View/add/remove warnings for users
- Trigger actions like `/ban`, `/kick`, `/timeout`, `/say`

#### 🎫 Ticket System
- Configure ticket categories and channels
- View and manage submitted tickets

#### 🏷️ Reaction Roles
- Create menus with up to 5 roles
- Toggle between exclusive and multi-role modes

#### 📌 Sticky Messages
- Set/remove sticky messages per channel
- Customize title, color, and content

#### 🧰 Utilities
- Display help command overview
- View current guild configuration

#### 🌈 Embed Builder
- Build styled Discord embeds visually
- Send them to any selected channel via the bot

---

### 4. 🔐 Authentication

- Use **Discord OAuth2** for secure user login
- Only allow users to manage guilds where they have `MANAGE_GUILD` permission and the bot is present

---

### 5. 🗂️ Database (SQLite)

Use the same SQLite database file across bot and dashboard. Extend the existing schema to support:

| Table Name           | Purpose                                     |
|----------------------|---------------------------------------------|
| `guild_settings`     | Per-guild modlog channel, feature toggles   |
| `warnings`           | Stores issued warnings                     |
| `tickets`            | Ticket data (guild ID, user, topic, status)|
| `reaction_roles`     | Role/emoji config for reaction menus        |
| `sticky_messages`    | Sticky content + channel association        |

---

### 6. 🧪 Usage

- Start both bot and dashboard by simply running:

```bash
node index.js
```

- The bot connects to Discord and the dashboard runs at `http://localhost:8124`


### 7. 🧰 Bonus

- Use an `.env` file to manage:
  - Discord bot token
  - Client ID, Client Secret
  - Redirect URI (for OAuth2)

- Use Tailwind CSS for modern UI styling

- Maintain a modular structure with separation between:
  - Frontend (React or static HTML/CSS)
  - Backend (API + Auth)
  - Shared logic (e.g., DB access)

---


### 🚀 Final Output

Extend your project to include the following structure:

```
dashboard/
├── api.js           # Express backend
├── auth/            # Discord OAuth2 login
├── public/          # Frontend (React or static)
```

Update index.js to:

- Start the Discord bot

- Initialize and serve the dashboard on port 8124

- Ensure that the SQLite database is shared between both components