// Question Classifier for Token Optimization
// Detects simple questions that can use fewer tokens (150 vs 200)

export type QuestionComplexity = 'simple' | 'moderate' | 'complex';

interface ClassificationResult {
  complexity: QuestionComplexity;
  maxTokens: number;
  reason: string;
}

/**
 * Classify question complexity to optimize token usage
 */
export function classifyQuestion(question: string): ClassificationResult {
  const q = question.toLowerCase().trim();
  const wordCount = q.split(/\s+/).length;

  // SIMPLE QUESTIONS (150 tokens max)
  // Single-topic questions with straightforward answers

  // Pricing (always simple, specific number)
  if (
    q.includes('pricing') ||
    q.includes('how much') ||
    q.includes('cost') ||
    q.includes('price')
  ) {
    return {
      complexity: 'simple',
      maxTokens: 150,
      reason: 'Pricing question - structured answer',
    };
  }

  // Yes/No industry questions
  if (
    (q.includes('do you work with') || q.includes('work with my')) &&
    wordCount < 15
  ) {
    return {
      complexity: 'simple',
      maxTokens: 150,
      reason: 'Industry fit question - yes/no with brief explanation',
    };
  }

  // Technical skills (simple yes/no)
  if (
    (q.includes('technical') || q.includes('coding')) &&
    (q.includes('need') || q.includes('required')) &&
    wordCount < 12
  ) {
    return {
      complexity: 'simple',
      maxTokens: 150,
      reason: 'Technical requirements - no, with brief explanation',
    };
  }

  // After term question (clear answer)
  if (
    (q.includes('after') && q.includes('term')) ||
    q.includes('when it ends')
  ) {
    return {
      complexity: 'simple',
      maxTokens: 150,
      reason: 'After term question - independence message',
    };
  }

  // Support/response time (specific numbers)
  if (
    q.includes('support') &&
    (q.includes('response') || q.includes('fast') || q.includes('how quick'))
  ) {
    return {
      complexity: 'simple',
      maxTokens: 150,
      reason: 'Support response time - specific SLA numbers',
    };
  }

  // How long / timeline (specific answer)
  if (
    (q.includes('how long') && wordCount < 10) ||
    (q.includes('timeline') && wordCount < 8)
  ) {
    return {
      complexity: 'simple',
      maxTokens: 150,
      reason: 'Timeline question - specific timeframe',
    };
  }

  // MODERATE QUESTIONS (175 tokens)
  // Two-part questions or questions needing context

  // Comparison questions (need explanation)
  if (
    q.includes('different') ||
    q.includes('compare') ||
    q.includes('versus') ||
    q.includes('vs')
  ) {
    return {
      complexity: 'moderate',
      maxTokens: 175,
      reason: 'Comparison question - needs explanation',
    };
  }

  // Upgrade/flexibility questions
  if (q.includes('upgrade') || q.includes('change tier')) {
    return {
      complexity: 'moderate',
      maxTokens: 175,
      reason: 'Upgrade path - policy explanation',
    };
  }

  // Error handling (needs reassurance)
  if (
    (q.includes('mistake') || q.includes('error') || q.includes('wrong')) &&
    q.includes('ai')
  ) {
    return {
      complexity: 'moderate',
      maxTokens: 175,
      reason: 'Error handling - needs trust-building explanation',
    };
  }

  // ROI questions (examples helpful)
  if (q.includes('roi') || (q.includes('return') && q.includes('investment'))) {
    return {
      complexity: 'moderate',
      maxTokens: 175,
      reason: 'ROI question - benefits with examples',
    };
  }

  // COMPLEX QUESTIONS (200 tokens)
  // Multi-part questions or those requiring detailed explanations

  // Multiple questions in one
  if (
    (q.match(/\?/g) || []).length > 1 || // Multiple question marks
    q.includes(' and ') && wordCount > 15 || // Long compound question
    q.includes(' also ')
  ) {
    return {
      complexity: 'complex',
      maxTokens: 200,
      reason: 'Multi-part question - needs comprehensive answer',
    };
  }

  // Very long questions (likely complex scenario)
  if (wordCount > 20) {
    return {
      complexity: 'complex',
      maxTokens: 200,
      reason: 'Long question - detailed context requires detailed answer',
    };
  }

  // Custom/specific scenario questions
  if (
    q.includes('my business') &&
    (q.includes('custom') || q.includes('specific') || q.includes('unique'))
  ) {
    return {
      complexity: 'complex',
      maxTokens: 200,
      reason: 'Custom scenario - personalized explanation needed',
    };
  }

  // DEFAULT: Moderate
  return {
    complexity: 'moderate',
    maxTokens: 175,
    reason: 'Default moderate - standard question',
  };
}

/**
 * Get analytics on question classifications
 */
const classificationStats = {
  simple: 0,
  moderate: 0,
  complex: 0,
};

export function trackClassification(complexity: QuestionComplexity): void {
  classificationStats[complexity]++;
}

export function getClassificationStats() {
  const total = classificationStats.simple + classificationStats.moderate + classificationStats.complex;
  return {
    ...classificationStats,
    total,
    percentages: {
      simple: total > 0 ? (classificationStats.simple / total * 100).toFixed(1) : 0,
      moderate: total > 0 ? (classificationStats.moderate / total * 100).toFixed(1) : 0,
      complex: total > 0 ? (classificationStats.complex / total * 100).toFixed(1) : 0,
    },
  };
}
