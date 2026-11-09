# 🌟 All-in-One Discord Bot (Gaming, Coding, Tasks & Music)

A modular, production-ready Discord bot built with **Discord.js v14** and **Node.js (ES Modules)**, featuring interactive slash commands and buttons for:
- 🎮 **Gaming Suite**: Interactive Tic-Tac-Toe, Rock Paper Scissors, Trivia quizzes, Dice roller, Coin flip, Minecraft server monitor, and live Free PC Game deals (Steam/Epic/GOG giveaways).
- 💻 **Coding Suite**: Multi-language code runner (Python, JavaScript, TypeScript, C++, Rust, Go, Java, Ruby, etc.), GitHub repo/user inspector, docs lookup, snippet manager, and code formatter.
- 📋 **Tasks & Productivity**: Personal To-Do lists, timed reminders, live interactive voting polls, math calculator, and server/user stats.
- 🎵 **Music Player**: High-fidelity voice streaming from YouTube, SoundCloud, and web streams with full queue management, interactive controls (Play, Pause, Skip, Stop, Volume), and demux audio pipeline.

---

## 📋 Features Overview

| Category | Command | Description |
| :--- | :--- | :--- |
| **🎮 Gaming** | `/rps` | Rock, Paper, Scissors with interactive Discord buttons |
| | `/tictactoe` | Full 3x3 interactive button grid game vs Bot or a friend |
| | `/trivia` | Interactive multiple-choice trivia quiz (Gaming, Tech, Science) |
| | `/dice` | Roll dice with count, sides, and modifiers (e.g. `2d6+3`, `1d20`) |
| | `/coinflip` | Flip a coin (Heads or Tails) |
| | `/freedeals` | Active 100% free PC games & giveaways (Steam, Epic, GOG) |
| | `/mcstatus` | Check Minecraft server ping, MOTD, and online players |
| **💻 Coding** | `/run` | Execute code in Python, JS, TS, C++, Rust, Go, Java, etc. |
| | `/github` | Search and inspect GitHub repositories or user profiles |
| | `/docs` | Quick lookup for MDN, Python, React, Rust, Go, Docker, Git docs |
| | `/snippet` | Save, retrieve, list, and delete reusable code snippets |
| | `/format` | Prettify and highlight code blocks with line numbers |
| **📋 Tasks** | `/todo` | Add, list, complete, and clear personal to-do tasks |
| | `/remind` | Timed reminders (`30s`, `10m`, `2h`, `1d`) with user tags |
| | `/poll` | Interactive voting poll with real-time progress bars |
| | `/calc` | Evaluate mathematical equations and expressions |
| | `/serverinfo` | View server statistics, boost tier, channel counts |
| | `/userinfo` | View user profile, join date, avatar, and roles |
| **🎵 Music** | `/play` | Stream music from YouTube, SoundCloud, or audio URLs |
| | `/pause` | Pause music playback |
| | `/resume` | Resume paused playback |
| | `/skip` | Skip to the next song in queue |
| | `/stop` | Stop player, clear queue, and leave voice channel |
| | `/queue` | View upcoming songs in queue |
| | `/nowplaying` | Show now playing track with interactive control buttons |
| | `/volume` | Set playback volume from 1% to 100% |
| **ℹ️ General** | `/help` | Comprehensive guide of all commands |

---

## 🚀 Quick Start Guide

### 1. Step 1: Create Your Discord Bot Application
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** (give it any name, e.g., `OmniBot`).
3. In the left sidebar, click **Bot**:
   - Click **Reset Token** and copy the **Bot Token**.
   - Under **Privileged Gateway Intents**, enable:
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent** (optional but recommended)
4. In the left sidebar, click **Installation** (or **OAuth2 -> URL Generator**):
   - Under Default Install Settings, choose **Guild Install**.
   - Under Scopes, select `bot` and `applications.commands`.
   - Under Bot Permissions, select:
     - `Send Messages`, `Embed Links`, `Attach Files`, `Read Message History`
     - `Connect`, `Speak`, `Use Voice Activity` (for music)
   - Copy the generated Install Link and paste it into your browser to invite the bot to your server.

### 2. Step 2: Configure Credentials
You can configure your credentials interactively with our setup wizard:

```bash
npm run setup
```

Or manually open the `.env` file in this directory and fill in your credentials:

```env
# 1. Your Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# 2. Your Application / Client ID (from Developer Portal -> General Information)
CLIENT_ID=your_application_id_here

# 3. (Optional) Your Server ID for instant slash command registration during testing
GUILD_ID=your_server_id_here
```

> **Tip on GUILD_ID**: If `GUILD_ID` is provided, commands appear **instantly** in that server. If left blank, commands register globally across all servers (takes a few minutes for Discord cache).

### 3. Step 3: Register Slash Commands
Run the command deployment script:

```bash
npm run deploy
```

You will see:
```text
✅ Successfully reloaded 27 (/) commands!
```

### 4. Step 4: Start the Bot
Run:

```bash
npm start
```

When started, you will see:
```text
🤖 Logged in as OmniBot#0000!
📡 Serving 1 servers and X cached users.
```

---

## 🛠️ Project Structure

```text
discord-bot/
├── .env                  # Bot tokens and secrets
├── .env.example          # Template configuration
├── package.json          # Dependencies and startup scripts
├── README.md             # Documentation
├── data/
│   └── storage.json      # Persistent storage for todos and snippets
└── src/
    ├── index.js          # Bot entry point and event loader
    ├── deploy-commands.js# Slash command registrar
    ├── music/
    │   └── queue.js      # Audio queue, voice streaming, FFmpeg demuxer
    ├── utils/
    │   ├── codeRunner.js # Wandbox multi-language compiler integration
    │   ├── storage.js    # Safe JSON database manager
    │   └── embeds.js     # Discord Embed builders & theme palettes
    ├── events/
    │   ├── ready.js      # Status and presence
    │   └── interactionCreate.js # Slash commands and button dispatchers
    └── commands/
        ├── gaming/       # rps, tictactoe, trivia, dice, coinflip, freedeals, mcstatus
        ├── coding/       # run, github, docs, snippet, format
        ├── tasks/        # todo, remind, poll, calc, serverinfo, userinfo
        ├── music/        # play, pause, resume, skip, stop, queue, nowplaying, volume
        └── general/      # help
```
