// Pre-warm voice agent cache with correct responses
// Run: node scripts/prewarm-cache.js

const QUESTIONS = [
  // Pricing questions
  "What's your pricing?",
  "How much does it cost?",
  "What are your prices?",
  "Tell me about your pricing tiers",

  // How it works
  "How does your partnership work?",
  "How do you work with clients?",
  "What's your process?",
  "How does this work?",

  // ROI questions
  "What kind of ROI can I expect?",
  "What results do you get?",
  "Do you have case studies?",
  "What's the typical return on investment?",

  // Industry flexibility
  "Do you work with my industry?",
  "What industries do you work with?",
  "Can you help a restaurant?",
  "Do you work with healthcare?",
  "Can you help construction companies?",

  // Getting started
  "How do I get started?",
  "What's the first step?",
  "How do I begin?",

  // Technical skills
  "Do I need coding skills?",
  "Do I need technical experience?",
  "What skills do I need?",

  // Timeline
  "How long does it take?",
  "What's the timeline?",
  "When will I see results?",

  // Independence & after term
  "What happens after the minimum term?",
  "Will I be independent?",
  "Do I need you forever?",
  "What happens when it ends?",

  // Support structure
  "What support do you provide?",
  "How do you support clients?",
  "What's included in support?",
  "Do you have a community?",

  // Tier differences
  "What's the difference between tiers?",
  "Which tier should I choose?",
  "What's included in Foundation Builder?",
  "What's included in AI Discovery?",

  // Setup fee
  "What does the setup fee include?",
  "What's the capability transfer fee for?",

  // ChatGPT comparison
  "How is this different from ChatGPT?",
  "Why not just use ChatGPT?",

  // Guarantees
  "Do you have a guarantee?",
  "What if it doesn't work?",

  // Cancellation
  "Can I cancel?",
  "What's your cancellation policy?",

  // Time savings
  "How much time will I save?",
  "How many hours per week will this save?",

  // Freelancer comparison
  "Why not just hire a freelancer?",
  "How are you different from hiring a developer?",

  // Multiple locations
  "Do you work with multiple locations?",
  "Can this work for multiple stores?",

  // Upgrade path
  "Can I upgrade later?",
  "Can I start small and upgrade?",
];

async function prewarmCache() {
  console.log('🔥 Pre-warming voice agent cache...\n');
  console.log(`Total questions: ${QUESTIONS.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const question = QUESTIONS[i];
    const questionNum = i + 1;

    try {
      console.log(`[${questionNum}/${QUESTIONS.length}] Asking: "${question}"`);

      const response = await fetch('http://localhost:3000/api/voice-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`   ❌ ERROR: ${error.error || 'Unknown error'}`);
        errorCount++;

        // If rate limited, wait and retry
        if (response.status === 429) {
          console.log('   ⏳ Rate limited - waiting 60 seconds...');
          await new Promise(resolve => setTimeout(resolve, 60000));
          i--; // Retry this question
          continue;
        }
      } else {
        const data = await response.json();
        const preview = data.response.substring(0, 80) + '...';
        console.log(`   ✅ Response: ${preview}`);
        successCount++;
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      errorCount++;
    }

    console.log(''); // Blank line for readability
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Cache pre-warming complete!\n');
  console.log(`✅ Success: ${successCount} questions`);
  console.log(`❌ Errors: ${errorCount} questions`);
  console.log(`📊 Success rate: ${Math.round(successCount / QUESTIONS.length * 100)}%`);
  console.log('='.repeat(60));
}

// Run the script
prewarmCache().catch(console.error);
