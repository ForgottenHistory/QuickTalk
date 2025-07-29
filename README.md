# Quicktalk

A real-time chat application for timed conversations with AI characters. Each session lasts 15 minutes, and both you and the AI can choose to extend for another 15 minutes or connect to a new character with a different personality.

## Live Demo

Try the demo version at: https://forgottenhistory.github.io/quicktalk

*Note: The demo uses simulated AI responses. For full functionality with real AI, follow the installation instructions below.*

## Features

- **Timed Sessions**: 15-minute conversations with customizable duration
- **AI Characters**: Chat with different personalities, each with unique traits
- **Extension System**: Both user and AI must agree to continue chatting
- **Character Management**: Create, edit, and import custom AI characters
- **Real-time Chat**: WebSocket communication with typing indicators
- **Prompt Inspector**: Debug and view AI prompts being sent
- **Customizable Settings**: Adjust AI models, response length, and behavior

## Quick Start (Windows)

**New to the project? Use the automated setup:**

1. **Download or clone** the repository
2. **Double-click `setup_project.bat`** - This will install everything and create your environment file
3. **Get your API key** from [Featherless.ai](https://featherless.ai) and add it to `server/.env`
4. **Double-click `run_quicktalk.bat`** to start the application
5. **Open** http://localhost:3000

That's it! The batch files handle all the setup for you.

## Manual Installation

If you prefer manual setup or are on Mac/Linux:

1. **Clone the repository**
   ```bash
   git clone https://github.com/forgottenhistory/quicktalk.git
   cd quicktalk
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Set up environment**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `.env` and add your Featherless API key:
   ```
   FEATHERLESS_API_KEY=your_api_key_here
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

5. **Open your browser** to http://localhost:3000

## Batch Files (Windows Users)

The project includes several batch files to make development easier:

### Setup & Installation
- **`setup_project.bat`** - Complete first-time setup (recommended for new users)
- **`install.bat`** - Install/update dependencies
- **`install_clean.bat`** - Clean install (removes node_modules first)
- **`install_dev_tools.bat`** - Install additional development tools

### Running the Application
- **`run_quicktalk.bat`** - Start both server and client (recommended)
- **`run_server.bat`** - Start only the backend server
- **`run_client.bat`** - Start only the frontend client

### Usage Tips
- **First time?** Run `setup_project.bat`
- **Dependencies issues?** Try `install_clean.bat`
- **Daily development?** Use `run_quicktalk.bat`

## Requirements

- Node.js 18 or higher
- Featherless API key ([sign up here](https://featherless.ai))

## Usage

1. The app connects you to a random AI character automatically
2. Chat for up to 15 minutes per session
3. When time runs low, both you and the AI choose whether to extend
4. If either declines, you're connected to a new AI character
5. Use the settings panel to customize AI behavior and session timing
6. Manage characters through the character panel

## Configuration

### Supported AI Models
- `moonshotai/Kimi-K2-Instruct` (default)
- `claude-3-sonnet`
- `gpt-4-turbo`
- `gpt-3.5-turbo`
- `llama-2-70b`

### Session Settings
- Session duration: 5-60 minutes
- Extension duration: 5-30 minutes  
- Extension warning: 1-5 minutes before end

## Tech Stack

- **Frontend**: React 19, TypeScript, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **AI**: OpenAI API via Featherless.ai
- **Storage**: File-based JSON storage

## Development

### Project Structure
```
quicktalk/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── *.bat                   # Windows batch files
├── setup_project.bat       # First-time setup
└── run_quicktalk.bat       # Start application
```

### Available Scripts

**Server:**
- `npm run dev` - Start with auto-restart
- `npm run dev:full` - Start both client and server
- `npm start` - Production start

**Client:**
- `npm start` - Development server
- `npm run build` - Production build
- `npm run deploy` - Deploy to GitHub Pages

## Troubleshooting

**API key errors**: Make sure `.env` file exists in `server/` with correct `FEATHERLESS_API_KEY`

**Connection issues**: Verify both frontend (3000) and backend (5000) are running

**Character loading problems**: App creates default characters on first run

**Windows issues**: Try running batch files as administrator if you get permission errors

**Node.js not found**: Install Node.js from [nodejs.org](https://nodejs.org) (version 18+)

## License

MIT - see [LICENSE](LICENSE) file for details.