// AI Suggestions Test Script
// Run this in browser console to test AI functionality

console.log('🧪 Starting AI Suggestions Test...');

// Test 1: Check AI Service Settings
console.log('\n=== Test 1: AI Settings ===');
const aiSettings = JSON.parse(localStorage.getItem('habit-tracker-ai-settings') || '{}');
console.log('Current AI settings:', aiSettings);

if (!aiSettings.enabled) {
  console.log('❌ AI is disabled. Enable in Settings > AI Features');
} else if (!aiSettings.apiKey) {
  console.log('❌ No API key configured. Add one in Settings > AI Features');
} else {
  console.log('✅ AI is enabled and configured');
}

// Test 2: Check Habits Data
console.log('\n=== Test 2: Habits Data ===');
const habits = JSON.parse(localStorage.getItem('habits') || '[]');
const entries = JSON.parse(localStorage.getItem('habit_entries') || '[]');
console.log(`Habits: ${habits.length}, Entries: ${entries.length}`);

if (habits.length === 0) {
  console.log('⚠️  No habits found. AI suggestions work better with existing habits.');
} else {
  console.log('✅ Habits data available for AI analysis');
  habits.forEach(h => console.log(`  - ${h.name} (${h.category})`));
}

// Test 3: Test API Connection (if configured)
console.log('\n=== Test 3: API Connection ===');
if (aiSettings.enabled && aiSettings.apiKey) {
  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiSettings.apiKey}`
    },
    body: JSON.stringify({
      model: aiSettings.model || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Hello, please respond with "Test successful"' }],
      max_tokens: 50
    })
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ API connection successful');
      return response.json();
    } else {
      console.log('❌ API connection failed:', response.status, response.statusText);
      return response.text().then(text => {
        console.log('Error details:', text);
      });
    }
  })
  .then(data => {
    if (data && data.choices) {
      console.log('API response:', data.choices[0].message.content);
    }
  })
  .catch(error => {
    console.log('❌ API connection error:', error);
  });
} else {
  console.log('⏭️  Skipping API test (AI not configured)');
}

// Test 4: Component Rendering Check
console.log('\n=== Test 4: Component Check ===');
const aiSuggestionsComponent = document.querySelector('[data-testid="ai-suggestions"]') || 
                              document.querySelector('div:has(> .sparkles)') ||
                              document.querySelector('h3:contains("AI Habit Suggestions")');

if (aiSuggestionsComponent) {
  console.log('✅ AI Suggestions component found in DOM');
} else {
  console.log('❌ AI Suggestions component not found. Check if you\'re on the Habits tab.');
}

console.log('\n🧪 Test complete! Check the results above.');
console.log('💡 Tip: Open Settings > AI Features to configure AI suggestions.');