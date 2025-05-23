# 📜 SYLO Changelog

All notable changes to the SYLO Discord bot will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]
- Moderation controls in the dashboard (coming soon)
- Reaction role builder in the dashboard (coming soon)
- Utilities module expansion (planned)

---

## [1.1.0] – 2025-05-23
### Added
- 🌐 Integrated web dashboard served on port `8124`
- ✅ Embed Builder: visually create and send custom embeds
- ✅ Sticky Messages management in dashboard (set & remove)
- 📁 Database schema for embeds, sticky, and guild config

### Changed
- Unified SQLite access for bot and dashboard
- Improved internal command handler logic

---

## [1.0.0] – 2025-05-20
### Added
- Initial release of SYLO bot with core commands:
  - 🛡️ Moderation: `/ban`, `/kick`, `/timeout`, `/warning`, `/clear`
  - 🎫 Ticket System: modal-based ticket creation
  - 🏷️ Reaction Roles: multi-role or exclusive mode
  - 📌 Sticky Messages: auto-repost pinned content
  - 🔧 Utilities: `/help`, `/say`
- SQLite database support
- Command and event loader system

---

## 📅 Planned Roadmap

- [ ] Server-specific prefix (configurable in dashboard)
- [ ] AutoMod triggers (bad words, spam)
- [ ] Role management tools
- [ ] Per-command permissions editor

---

## 📁 Older versions

> For legacy updates or migration notes, check the [Releases](https://github.com/yourusername/sylo-bot/releases) page.

---

