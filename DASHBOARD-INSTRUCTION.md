Create a full-stack web dashboard for my existing Discord bot project coded in discord.js, using the following file structure:

🎯 Key Requirements:

1. 🔧 Launch Dashboard Server:

- When I start the bot via `index.js`, also launch an Express-based API server on port `8124`

- This dashboard API should live under a new folder called `dashboard/` and be tightly integrated

- Keep everything in the same project (no separate repo or server needed)

2. 🧱 Tech Stack:

- SQLite for the database

- Express.js for the API backend (`dashboard/api.js`)

- React (or simple HTML/CSS/JS) for the frontend (`dashboard/public/`)

- Use REST API for communication between frontend and backend

- Serve frontend statically via Express (dashboard should be available at `http://localhost:8124`)

3. ✨ Features to Control:

From the dashboard, allow configuration and control of these bot features:

🛡️ Moderation:

- Enable/disable moderation commands per guild

- Set the modlog channel (channel ID stored per guild)

- View/add/remove warnings for users

- Trigger moderation actions like /ban, /kick, /timeout, /say

🎫 Ticket System:

- Configure ticket categories and channels

- View submitted tickets

🏷️ Reaction Roles:

- Create menus with up to 5 roles

- Choose multi-role or single-role mode

📌 Sticky Messages:

- Set/remove sticky messages per channel

- Configure message title, color, and content

🧰 Utilities:

- Display `/help` command info

- Display current config for each guild

🌈 Embed Builder:

- Visual form to build Discord embeds

- Send embed to selected channel via bot

4. 🔐 Authentication:

- Use Discord OAuth2 for user login and session

- Only show/manage servers where the user has `MANAGE_GUILD` and the bot is present

5. 🗂️ Database (SQLite):

- Reuse or extend existing DB schema

- Use shared SQLite connection across bot and dashboard

- Tables:

- guild_settings (modlog channel, enabled features)

- warnings (userId, guildId, reason, date)

- tickets (guildId, userId, topic, status)

- reaction_roles (guildId, messageId, roleId, exclusive)

- sticky_messages (channelId, content, color, etc.)

6. 🧪 Usage:

- Launch everything by running `node index.js`

- Bot and dashboard both run, with bot on Discord and dashboard on http://localhost:8124

7. 🧰 Bonus:

- Include an `.env` setup for Discord client ID, secret, and redirect URL

- Tailwind CSS for clean styling

- Modular code structure, with clear separation between frontend, backend, and shared logic

🚀 Output:

- Extend my current project structure with:

- `dashboard/` folder containing:

- `api.js` (Express backend with routes for each feature)

- `public/` (HTML/React frontend files)

- `auth/` (OAuth2 flow using Discord)

- Adjust `index.js` to start both the bot and the dashboard server

Provide the updated `index.js`, example API endpoints, and frontend routing logic.