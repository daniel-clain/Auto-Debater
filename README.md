# Auto-Debater

A real-time debate assistant that uses AI to analyze arguments, generate rebuttals, and provide strategic suggestions during live debates.

## Architecture

The system is built with a clear separation of concerns:

- **Frontend**: React + TypeScript, communicates via WebSocket
- **Backend**: Node.js + TypeScript, single WebSocket communication channel
- **Shared Types**: TypeScript types shared between frontend and backend

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system breakdown.

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Backend will serve frontend from dist/ folder
cd backend
npm start
```

## WebSocket Communication

All communication uses a single WebSocket channel with typed messages:

- **Frontend → Backend**: Audio chunks, transcripts
- **Backend → Frontend**: Micro-updates, rebuttals, summaries, warnings

See `shared/types.ts` for all message types.

## System Modules

- **Core**: WebSocket manager, message router
- **Audio**: Stream handling, speech recognition
- **AI**: Multi-agent analysis (ChatGPT, DeepSeek, Grok)
- **Intelligence**: Argument modeling, rebuttal generation, tone analysis
- **Response**: Priority ranking, strategy selection
- **Profile**: Rival tracking, persona building
