# Ollama Setup Guide for SmartLaboratory

This guide will help you set up Ollama with the `deepseek-v3.1:671b-cloud` model for local AI features.

## Prerequisites

1. **Ollama Installed**
   - Download from: https://ollama.com/download
   - Verify installation: `ollama --version`

2. **Sufficient Hardware**
   - The `deepseek-v3.1:671b-cloud` model requires significant resources
   - Recommended: 32GB+ RAM, modern GPU with 16GB+ VRAM
   - Alternative: Use a smaller model if hardware is limited

## Quick Start

### 1. Start Ollama Server

```bash
# Start the Ollama server (runs on port 11434 by default)
ollama serve
```

Or as a background service:

```bash
# Windows (as service)
ollama serve

# macOS/Linux
ollama serve &
```

### 2. Pull the Model

```bash
# Pull the deepseek model
ollama pull deepseek-v3.1:671b-cloud

# Or use a smaller alternative if needed
ollama pull deepseek-r1:14b
ollama pull llama3.1:8b
ollama pull mistral:7b
```

### 3. Test the Model

```bash
# Test in terminal
ollama run deepseek-v3.1:671b-cloud

# Type a message and press Enter
# Type /bye to exit
```

### 4. Configure SmartLaboratory

Create the `.env` file in `/server`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_laboratory
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Ollama Configuration (Local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-v3.1:671b-cloud
# Set to true only if you want OpenAI as primary
USE_OPENAI=false

# OpenAI API Key (optional fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 5. Start the Application

```bash
# Terminal 1: Ollama (if not running as service)
ollama serve

# Terminal 2: Backend
cd server
npm start

# Terminal 3: Frontend
cd client
npm start
```

## Model Alternatives (If Deepseek-v3.1 is Too Large)

If you have limited hardware, use these smaller models:

| Model | Size | Quality | Command |
|-------|------|---------|---------|
| llama3.1:8b | 8B params | Good | `ollama pull llama3.1:8b` |
| mistral:7b | 7B params | Good | `ollama pull mistral:7b` |
| gemma:7b | 7B params | Good | `ollama pull gemma:7b` |
| qwen2.5:14b | 14B params | Better | `ollama pull qwen2.5:14b` |

Update `.env` to use alternative:
```env
OLLAMA_MODEL=llama3.1:8b
```

## Troubleshooting

### "Connection refused" Error

1. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Restart Ollama:
   ```bash
   # Stop any running ollama processes
   pkill ollama
   
   # Start again
   ollama serve
   ```

### "Model not found" Error

1. Verify model is downloaded:
   ```bash
   ollama list
   ```

2. Pull the model again:
   ```bash
   ollama pull deepseek-v3.1:671b-cloud
   ```

### Out of Memory Error

1. Use a smaller model (see alternatives above)
2. Close other applications
3. Reduce context window in settings

### Slow Response Times

1. Use a GPU if available
2. Use a smaller model
3. Ensure Ollama is using hardware acceleration:
   ```bash
   # Check Ollama logs for GPU detection
   ollama serve 2>&1 | grep -i gpu
   ```

## API Endpoints

Ollama provides these endpoints (used by SmartLaboratory):

- `POST /api/chat` - Chat completion (used for AI Chat)
- `POST /api/generate` - Text generation

## Testing Ollama Integration

Test the API directly:

```bash
# Test chat endpoint
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v3.1:671b-cloud",
    "messages": [
      {"role": "user", "content": "What is Ohm's Law?"}
    ],
    "stream": false
  }'
```

## Docker Alternative (Optional)

Run Ollama in Docker:

```bash
# Pull and run Ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull model in container
docker exec -it ollama ollama pull deepseek-v3.1:671b-cloud
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `deepseek-v3.1:671b-cloud` | Model to use |
| `USE_OPENAI` | `false` | Use OpenAI instead of Ollama |
| `OPENAI_API_KEY` | - | OpenAI API key (fallback) |

## Next Steps

1. Start the application: `npm start` in both `/server` and `/client`
2. Login with demo credentials
3. Go to **AI Chat** page and start chatting with the local model
4. Try **Experiment Explanation** after completing an experiment

The AI features now work completely offline using your local Ollama instance!
