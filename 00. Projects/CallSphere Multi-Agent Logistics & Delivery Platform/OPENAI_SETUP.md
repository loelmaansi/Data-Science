# OpenAI Setup Guide for CallSphere

## Overview

The CallSphere platform uses OpenAI for:
1. **Chat AI Assistant** - GPT-4 for conversational interactions
2. **Voice AI Assistant** - OpenAI Realtime API for voice conversations (requires additional setup)

## Quick Start (Minimum Setup)

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** section: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Copy the API key (starts with `sk-...`)
   - ⚠️ **Save it immediately** - you won't be able to see it again!

### Step 2: Add API Key to Backend

1. Open the backend `.env` file:
   ```bash
   cd backend
   nano .env
   # or use your preferred editor
   ```

2. Add or update the `OPENAI_API_KEY`:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Save the file

4. Restart the backend server:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run start:dev
   ```

### Step 3: Test the Chat Feature

1. Login to the application: http://localhost:3001
2. Go to Customer Dashboard
3. In the Chat widget, try:
   - "Where is my package CS000001?"
   - "I want to report a damaged package"
   - "I need to reschedule my delivery"

**Expected**: AI should respond with helpful information!

---

## Current Implementation Status

### ✅ What's Already Working

- **Basic Chat Integration**: Uses OpenAI GPT-4
- **Tool Calling**: Backend tools for tracking shipments, creating issues
- **Agent Session Management**: Tracks conversations
- **Error Handling**: Basic error handling in place

### ⚠️ What Needs Setup

1. **OpenAI API Key** (Required for chat to work)
2. **Voice/Realtime API** (Optional - requires additional setup)
3. **Enhanced Agent Prompts** (Optional - improve AI responses)
4. **Specialized Agents** (Optional - router + specialist agents)

---

## Detailed Setup Options

### Option 1: Basic Chat Setup (Recommended to Start)

This is the minimum setup to get chat working:

1. **Add OpenAI API Key** (as shown above)
2. **Test Chat**: Try the chat widget
3. **Verify**: AI should respond to queries

**What works:**
- ✅ Chat messages via GPT-4
- ✅ Shipment tracking via AI
- ✅ Issue creation via AI
- ✅ Basic tool calling

**Current Limitations:**
- ⚠️ Voice feature shows placeholder (full voice needs Realtime API)
- ⚠️ Simplified agent prompts (can be enhanced)
- ⚠️ Single agent (can be split into multiple specialist agents)

### Option 2: Enhanced Agent Setup (Optional)

To implement the full multi-agent architecture from the requirements:

#### 2.1 Create Specialized Agents in OpenAI

You would need to create agents in OpenAI's platform:

1. **LogisticsRouterAgent** - Routes user intent
2. **ShipmentTrackingAgent** - Handles tracking queries
3. **DeliveryIssueAgent** - Handles issue creation
4. **DeliveryChangeAgent** - Handles change requests
5. **LogisticsEscalationAgent** - Handles escalations
6. **LogisticsAnalyticsAgent** - Handles metrics queries

#### 2.2 Update Agent Prompts

Edit `backend/src/ai-orchestrator/ai-orchestrator.service.ts` to use specialized agents:

```typescript
// Current (simplified)
const completion = await this.openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  tools: this.routerAgent.tools,
});

// Enhanced (with specialized agents)
// Would require OpenAI Agents API or custom routing logic
```

### Option 3: Voice/Realtime API Setup (Advanced)

To enable full voice functionality:

1. **Enable Realtime API** in OpenAI dashboard
2. **Update Voice Implementation** in `ai-orchestrator.service.ts`
3. **Set up WebSocket connection** to OpenAI Realtime API
4. **Handle audio streams** (STT → AI → TTS)

**Note**: This requires significant additional development. Current implementation has the structure but needs:
- WebSocket connection to OpenAI Realtime API
- Audio capture/playback in browser
- Streaming audio processing

---

## Testing the Current Setup

### Test 1: Basic Chat

```bash
# After adding API key and restarting backend:

1. Login as customer
2. Open chat widget
3. Type: "Where is my package CS000001?"
4. Expected: AI responds with shipment details
```

### Test 2: Tool Calling

```bash
1. In chat, type: "Track my package CS000001"
2. Expected: AI uses track_shipment tool
3. You should see shipment details in response
```

### Test 3: Issue Creation

```bash
1. In chat, type: "I want to report a damaged package"
2. AI should prompt for details
3. Provide shipment ID and description
4. Expected: Issue created via create_delivery_issue tool
```

### Test 4: API Direct Test

```bash
# Test the AI endpoint directly:
curl -X POST http://localhost:3000/ai/chat/test-session-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Where is my package CS000001?"}'
```

---

## Troubleshooting

### "OpenAI API Key not configured"
- **Fix**: Add `OPENAI_API_KEY` to `.env` file
- **Verify**: Check `.env` file has the key (no quotes needed)

### "Invalid API Key"
- **Fix**: Regenerate API key at https://platform.openai.com/api-keys
- **Check**: Make sure key starts with `sk-`
- **Verify**: Key has necessary permissions

### "Rate limit exceeded"
- **Fix**: Check your OpenAI account billing/quota
- **Solution**: Upgrade OpenAI plan or add credits

### "Chat not responding"
1. Check backend logs for errors
2. Verify API key is correct
3. Check OpenAI dashboard for API status
4. Verify backend server restarted after adding key

### "Tool calling not working"
- **Check**: Backend logs for tool execution errors
- **Verify**: Shipment tracking number exists (use seeded data: CS000001-CS000045)
- **Test**: Try manual API calls to verify backend works

---

## Cost Considerations

### OpenAI Pricing (as of 2024):
- **GPT-4**: ~$0.03 per 1K input tokens, $0.06 per 1K output tokens
- **Realtime API**: Different pricing model (check OpenAI docs)

### Estimated Costs:
- **Basic chat**: ~$0.01-0.05 per conversation
- **Heavy usage**: Monitor in OpenAI dashboard
- **Recommendation**: Set up usage limits in OpenAI dashboard

### Cost Optimization:
1. Use GPT-3.5-turbo for simple queries (cheaper)
2. Cache common responses
3. Set usage limits in OpenAI account
4. Monitor usage dashboard regularly

---

## Next Steps After Setup

### Immediate (Required):
1. ✅ Add OpenAI API key to `.env`
2. ✅ Restart backend server
3. ✅ Test chat functionality

### Short-term (Recommended):
1. Enhance agent prompts for better responses
2. Add error handling for API failures
3. Implement caching for common queries
4. Add usage monitoring

### Long-term (Optional):
1. Implement full Realtime API for voice
2. Create specialized agents architecture
3. Add conversation memory/context
4. Implement agent orchestration routing
5. Add analytics for AI usage

---

## Code Changes Needed for Full Implementation

### 1. Enhanced Prompts (Easy)

Edit `backend/src/ai-orchestrator/ai-orchestrator.service.ts`:

```typescript
const systemPrompt = `You are a helpful logistics assistant for CallSphere. 
You help customers track shipments, report issues, and request delivery changes.

Your capabilities:
- Track shipments by tracking number
- Create delivery issue reports
- Request delivery changes (reschedule, update address, etc.)

Always be friendly, helpful, and concise. When customers provide tracking numbers,
use the track_shipment tool to get current status.`;
```

### 2. Multiple Agents (Medium)

Implement agent routing based on intent:

```typescript
async routeMessage(message: string): Promise<string> {
  // Classify intent
  const intent = await this.classifyIntent(message);
  
  // Route to appropriate agent
  switch (intent) {
    case 'tracking':
      return this.shipmentTrackingAgent.handle(message);
    case 'issue':
      return this.deliveryIssueAgent.handle(message);
    // ... etc
  }
}
```

### 3. Realtime Voice (Advanced)

Requires significant changes to handle audio streams and WebSocket connections to OpenAI Realtime API.

---

## Resources

- **OpenAI Platform**: https://platform.openai.com/
- **API Documentation**: https://platform.openai.com/docs
- **Realtime API**: https://platform.openai.com/docs/guides/realtime
- **Agents API**: https://platform.openai.com/docs/guides/agents

---

## Quick Checklist

- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Add `OPENAI_API_KEY=sk-...` to `backend/.env`
- [ ] Restart backend server
- [ ] Test chat widget in application
- [ ] Verify AI responses work
- [ ] (Optional) Enhance agent prompts
- [ ] (Optional) Set up usage monitoring
- [ ] (Optional) Implement voice/Realtime API

---

**Current Status**: Basic chat setup is ready. Just add your API key and restart!

