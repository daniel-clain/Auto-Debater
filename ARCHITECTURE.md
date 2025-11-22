# Auto-Debater System Architecture

## Top-Level System Breakdown

### Core Communication Layer

- **WebSocket Manager**: Single bidirectional communication channel
- **Message Router**: Routes messages to appropriate handlers
- **Type System**: Shared TypeScript types for all messages

### Audio Processing Layer

- **Audio Stream Handler**: Receives real-time audio from frontend
- **Speech Recognition**: Converts audio to text
- **Speaker Detection**: Identifies user vs opponent

### AI Analysis Layer

- **Multi-Agent System**: Coordinates ChatGPT, DeepSeek, Grok
- **Argument Analyzer**: Processes and rates arguments
- **Consensus Builder**: Merges AI agent opinions
- **Fact Checker**: Verifies claims against sources

### Debate Intelligence Layer

- **Argument Model**: Maintains debate state and history
- **Rebuttal Generator**: Creates prioritized counter-arguments
- **Tone Analyzer**: Monitors conversation health
- **Boundary Enforcer**: Manages respect and boundaries

### Profile Management Layer

- **Rival Profiler**: Builds opponent personas
- **Session Manager**: Tracks debate sessions
- **History Tracker**: Maintains argument patterns

### Response Generation Layer

- **Strategy Selector**: Chooses argument style (kind, stern, etc.)
- **Priority Ranker**: Orders arguments by impact
- **Micro-Update Generator**: Creates real-time suggestions

## Module Organization

```
backend/
├── index.ts                    # Entry point - shows system structure
├── core/
│   ├── websocket/
│   │   ├── manager.ts         # Single WebSocket handler
│   │   ├── router.ts           # Message routing
│   │   └── types.ts            # WebSocket message types
│   └── types/
│       └── shared.ts           # Shared type definitions
├── audio/
│   ├── stream-handler.ts       # Receives audio streams
│   ├── speech-recognition.ts   # Converts audio to text
│   └── speaker-detection.ts    # Identifies speakers
├── ai/
│   ├── multi-agent.ts          # Coordinates AI agents
│   ├── analyzer.ts             # Argument analysis
│   ├── consensus.ts            # Builds consensus
│   └── fact-checker.ts         # Verifies facts
├── intelligence/
│   ├── argument-model.ts       # Debate state
│   ├── rebuttal-generator.ts   # Creates counter-arguments
│   ├── tone-analyzer.ts        # Monitors tone
│   └── boundary-enforcer.ts    # Manages boundaries
├── profile/
│   ├── rival-profiler.ts       # Opponent profiles
│   ├── session-manager.ts      # Session tracking
│   └── history-tracker.ts      # Pattern tracking
├── response/
│   ├── strategy-selector.ts   # Argument style
│   ├── priority-ranker.ts     # Impact ranking
│   └── micro-updater.ts        # Real-time updates
└── services/
    ├── database.ts             # Database connection
    └── config.ts                # Configuration
```

## Communication Flow

1. **Frontend → Backend**: Audio stream → Text → Analysis → Updates
2. **Backend → Frontend**: Micro-updates with prioritized suggestions
3. **Single WebSocket**: All communication through one channel
4. **Typed Messages**: Every message has a type and payload
