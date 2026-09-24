# OmniRoute Integration Setup Guide

This project is configured to route AI requests through **OmniRoute** — an intelligent API gateway that manages multiple AI providers (Claude, Gemini, Groq, etc.) with load balancing, rate limiting, and cost tracking.

## Quick Start

### 1. **Install & Start OmniRoute Locally**

OmniRoute runs as a standalone service on your machine:

```bash
# Install (if not already installed)
npm install -g omniroute
# or
brew install omniroute  # macOS

# Start the server
omniroute
# Server runs on http://localhost:20128 by default
```

You'll see output like:
```
⏳ Starting server...
✓ Ready in 0ms
- Local: http://localhost:20128
- Network: http://0.0.0.0:20128
```

### 2. **Configure Your Environment**

The project uses two environment files:

**For development with OmniRoute** (`.env.omniroute`):
```bash
# Copy to .env.local
cp .env.omniroute .env.local
```

Update the values:
- `OMNIROUTE_API_URL`: Your OmniRoute endpoint (default: `http://localhost:20128/v1`)
- `OMNIROUTE_API_KEY`: Only needed if OmniRoute requires authentication
- `USE_DIRECT_PROVIDERS`: Set to `false` to use OmniRoute, `true` for direct provider fallback
- Provider credentials: Keep as fallback for when OmniRoute isn't available

**Example `.env.local`**:
```env
# OmniRoute
OMNIROUTE_API_URL=http://localhost:20128/v1
OMNIROUTE_AESTHETIC_MODEL=google/gemini-2.5-flash
OMNIROUTE_CAPTION_MODEL=google/gemini-2.5-flash
USE_DIRECT_PROVIDERS=false

# Fallback credentials (optional but recommended)
OPENROUTER_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 3. **Configure Supabase Edge Functions**

Edge functions need access to the same environment variables. Add them to your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set OMNIROUTE_API_URL=http://localhost:20128/v1
supabase secrets set USE_DIRECT_PROVIDERS=false
supabase secrets set OPENROUTER_API_KEY=your_key_here
supabase secrets set ANTHROPIC_API_KEY=your_key_here
```

Or set them in the Supabase dashboard:
1. Go to **Project Settings** → **Secrets**
2. Add the environment variables above

### 4. **Verify Setup**

Test OmniRoute is working:

```bash
# Check health endpoint
curl -I http://localhost:20128/api/monitoring/health

# Should return 200 OK
```

Test edge function with OmniRoute:

```bash
# From project root
npm run dev

# In another terminal, test the aesthetic-ai function
curl -X POST http://localhost:54321/functions/v1/aesthetic-ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"signals":{"scores":{"minimalism":8,"warmth":7,"social":4,"structure":9,"novelty":5}}}'
```

## How It Works

### Architecture

```
Your App
    ↓
Supabase Edge Functions
    ↓
OmniRoute Gateway (localhost:20128)
    ↓
Multiple Providers (Claude, Gemini, Groq, etc.)
```

### Flow

1. **Web/Client** → Makes request to edge function
2. **Edge Function** → Uses `callOmniRoute()` utility
3. **OmniRoute** → Routes to best available provider
4. **Response** → Returned to client with cost/latency tracking

### Supported Models

OmniRoute can route to any model from connected providers:

- **Google**: `google/gemini-2.5-flash`, `google/gemini-pro`, etc.
- **Claude**: `claude-opus-5`, `claude-3-5-sonnet-20241022`, etc.
- **Groq**: `groq/llama-3.1-70b-versatile`, etc.
- **OpenRouter**: Any model available on OpenRouter

### OmniRoute Dashboard

Access the OmniRoute dashboard at:
```
http://localhost:20128
```

Features:
- **Home**: Quick start guide
- **Recent Requests**: See all API calls with latencies and costs
- **Provider Topology**: Visual map of configured providers
- **Configuration**: Manage API keys and settings
- **Monitoring**: Health checks and usage tracking
- **Analytics**: Cost and performance analytics

## Model Selection

You can override models per function:

### Global (all functions)

Set in `.env.local`:
```env
OMNIROUTE_AESTHETIC_MODEL=claude-opus-5
OMNIROUTE_CAPTION_MODEL=google/gemini-2.5-flash
```

### Per-Request

Pass `model` in the request:
```typescript
await callOmniRoute({
  model: 'claude-opus-5',  // Override default
  messages: [...],
  ...
}, corsHeaders);
```

## Production Deployment

### Vercel/Edge Functions

For production (Vercel):

1. **Set environment variables** in Vercel project settings:
   ```
   OMNIROUTE_API_URL=https://your-omniroute-instance.com/v1
   OMNIROUTE_API_KEY=your-production-key
   USE_DIRECT_PROVIDERS=false
   ```

2. **Use cloud OmniRoute instance** (self-hosted or managed service):
   - OmniRoute can run on your own server
   - Update `OMNIROUTE_API_URL` to production endpoint

3. **Fallback configuration**:
   ```env
   OPENROUTER_API_KEY=production-key
   ANTHROPIC_API_KEY=production-key
   ```

### Direct Provider Fallback

If OmniRoute becomes unavailable, set `USE_DIRECT_PROVIDERS=true`:
```env
USE_DIRECT_PROVIDERS=true
OPENROUTER_API_KEY=your_key_here
```

This will automatically fall back to direct provider calls (OpenRouter, Anthropic, etc.).

## Troubleshooting

### OmniRoute not responding

```bash
# Check if running
curl -I http://localhost:20128/api/monitoring/health

# Restart
omniroute
```

### Wrong model being used

1. Check `OMNIROUTE_AESTHETIC_MODEL` and `OMNIROUTE_CAPTION_MODEL`
2. Verify model name matches a provider's API format
3. Check OmniRoute dashboard for configured providers

### Credentials not working

1. Verify API key is set correctly in `.env.local`
2. Check OmniRoute dashboard → Configuration
3. Ensure fallback providers are configured

### Edge functions not finding OmniRoute

1. Check `OMNIROUTE_API_URL` is correct
2. Ensure OmniRoute server is running
3. Verify network connectivity between functions and OmniRoute

## Integration Files

Updated files:
- `supabase/functions/_lib/omniroute.ts` — OmniRoute utility library
- `supabase/functions/aesthetic-ai/index.ts` — Updated to use OmniRoute
- `supabase/functions/generate-caption/index.ts` — Updated to use OmniRoute
- `.env.omniroute` — Configuration template

## Next Steps

1. ✅ Start OmniRoute locally
2. ✅ Configure `.env.local`
3. ✅ Test edge functions
4. 🔄 Deploy to production
5. 🔄 Monitor costs and latency via OmniRoute dashboard

## Resources

- [OmniRoute GitHub](https://github.com/berriai/omniroute)
- [OmniRoute Docs](https://docs.omniroute.ai)
- [OmniRoute Configuration](https://docs.omniroute.ai/configuration)
