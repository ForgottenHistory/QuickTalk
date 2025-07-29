# Quicktalk

A real-time chat application for timed conversations with AI characters. Each session lasts 15 minutes, and both you and the AI can choose to extend for another 15 minutes or connect to a new character with a different personality.

## Features

- **Timed Sessions**: 15-minute conversations with customizable duration
- **AI Characters**: Chat with different personalities, each with unique traits
- **Extension System**: Both user and AI must agree to continue chatting
- **Character Management**: Create, edit, and import custom AI characters
- **Real-time Chat**: WebSocket communication
- **Prompt Inspector**: Debug and view AI prompts being sent
- **Customizable Settings**: Adjust AI models, response length, and behavior

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quicktalk.git
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

### Session Settings
- Session duration: 5-60 minutes
- Extension duration: 5-30 minutes  
- Extension warning: 1-5 minutes before end

## Tech Stack

- **Frontend**: React 19, TypeScript, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **AI**: OpenAI API via Featherless.ai
- **Storage**: File-based JSON storage

## Troubleshooting

**API key errors**: Make sure `.env` file exists in `server/` with correct `FEATHERLESS_API_KEY`

**Connection issues**: Verify both frontend (3000) and backend (5000) are running

**Character loading problems**: App creates default characters on first run

## License

MIT - see [LICENSE](LICENSE) file for details.