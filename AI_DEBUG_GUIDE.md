# 🤖 AI Suggestions Debug Guide

## Issues Found & Fixed

### ✅ FIXED ISSUES

1. **❌ Hardcoded Invalid API Key**
   - **Problem**: `ai-service.ts` had a hardcoded, likely expired API key
   - **Fix**: Replaced with empty string, forcing users to enter their own
   - **Location**: `/lib/ai-service.ts` line 46

2. **❌ Component Not Always Visible**
   - **Problem**: AI suggestions only showed when habits existed
   - **Fix**: AI suggestions now always render, handling their own state
   - **Location**: `/components/habit-list.tsx` lines 69-83

3. **❌ Poor Error Handling**
   - **Problem**: API failures were silent, making debugging impossible
   - **Fix**: Added comprehensive console logging throughout
   - **Locations**: 
     - `/components/ai-suggestions.tsx` lines 24-63
     - `/lib/ai-service.ts` lines 127-177

## 🔍 How to Debug AI Suggestions

### Step 1: Check Browser Console
Open Developer Tools (F12) and look for these logs:

```
🤖 AI Settings: {enabled: false, apiKey: "", ...}
🤖 AI not enabled or auto-suggestions disabled: {enabled: false, hasApiKey: false, autoSuggestions: true}
```

### Step 2: Enable AI Features
1. Go to **Settings** (gear icon in header)
2. Scroll to **"AI Features"** section
3. Toggle **"Enable AI Features"** to ON
4. Enter a valid Groq API key (format: `gsk_...`)
5. Click the test button (beaker icon) to verify connection

### Step 3: Get a Free Groq API Key
1. Visit [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up for free account
3. Create new API key
4. Copy key (starts with `gsk_`)
5. Paste into settings

### Step 4: Verify AI Suggestions Load
After enabling AI:

```javascript
// You should see these console logs:
🤖 AI Settings: {enabled: true, apiKey: "gsk_...", autoSuggestions: true}
🤖 Auto-loading suggestions...
🤖 Loading AI suggestions... {habitsCount: X, entriesCount: Y, recentEntriesCount: Z}
🤖 generateHabitSuggestions called with settings: {...}
🤖 Generating suggestions for: {habitsList: "...", completionRate: X%, maxSuggestions: 5}
🤖 Raw API response: [{"name": "...", ...}]
🤖 AI suggestions loaded: [...]
```

## 🚨 Common Issues & Solutions

### Issue: "AI service not configured"
**Cause**: AI not enabled or no API key
**Solution**: Enable AI in settings and add valid API key

### Issue: "Invalid API key"
**Cause**: Wrong API key format or expired key
**Solution**: Get new key from Groq console, ensure it starts with `gsk_`

### Issue: "Rate limit exceeded"
**Cause**: Too many API calls (rare with Groq's generous limits)
**Solution**: Wait a few minutes, then try again

### Issue: "No new suggestions at the moment"
**Cause**: AI generated empty array or API call failed silently
**Solutions**:
1. Check console for error logs
2. Try clicking the refresh button (↻)
3. Add more habits for better suggestions
4. Wait a few minutes for more habit data

### Issue: AI suggestions don't show up at all
**Cause**: Component rendering issue or JavaScript error
**Solutions**:
1. Check browser console for errors
2. Refresh the page
3. Verify you're on the "Habits" tab (not Analytics/History)

## 🧪 Testing Steps

### Manual Test Procedure

1. **Test Without API Key**:
   - AI suggestions should show "Enable AI features in settings"
   - Console: `🤖 AI not enabled or auto-suggestions disabled`

2. **Test With Invalid API Key**:
   - Enter fake key like `gsk_invalid123`
   - Test connection should fail
   - Console: `🤖 Failed to generate habit suggestions: Invalid API key`

3. **Test With Valid API Key**:
   - Enter real Groq API key
   - Test connection should succeed
   - Click refresh button on AI suggestions
   - Should see loading state, then suggestions

4. **Test Adding Suggestions**:
   - Click "Add" button on any suggestion
   - Habit should be added to your list
   - Suggestion should disappear from AI panel

## 🔧 Developer Debugging Tools

### Enable Debug Mode
Add this to browser console to see all AI service calls:
```javascript
localStorage.setItem('ai-debug', 'true')
```

### Reset AI Settings
```javascript
localStorage.removeItem('habit-tracker-ai-settings')
```

### Check Current AI State
```javascript
console.log('AI Settings:', JSON.parse(localStorage.getItem('habit-tracker-ai-settings') || '{}'))
```

## 📊 Expected Behavior

### When AI Disabled:
- Shows card with "Enable AI features in settings"
- No API calls made
- No loading states

### When AI Enabled (No API Key):
- Shows card with "Enable AI features in settings"
- Console logs about missing API key

### When AI Enabled (Valid API Key):
- Auto-loads suggestions on page load
- Shows loading spinner during API calls
- Displays suggestions or "No new suggestions" message
- Refresh button works
- Add/dismiss buttons work

## 🎯 Performance Notes

- **Groq API**: Ultra-fast responses (usually < 2 seconds)
- **Rate Limits**: 1000 requests/minute (very generous)
- **Caching**: No caching implemented (suggestions fresh each time)
- **Auto-Refresh**: Only loads on page load or manual refresh

## 🔐 Security Notes

- API keys stored in localStorage (client-side only)
- No API keys sent to external servers except Groq
- All AI processing happens client-side
- Can be completely disabled for privacy