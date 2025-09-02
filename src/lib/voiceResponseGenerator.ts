import type { VoiceResponse } from './voiceIntents';
import { educationResponses, labEquipmentResponses } from './feedbackHandlers';

interface VoiceFeedbackOptions {
  intent: string;
  slots?: Record<string, any>;
  success?: boolean;
  error?: Error;
  variation?: boolean;
}

// Common suggestions for variations
const commonSuggestions = [
  "Would you like to see more details?",
  "I can help you find similar items if needed.",
  "Let me know if you need anything else."
];

// Get a random response from an array
const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)];
};

export class VoiceResponseGenerator {
  // Add emphasis markers for speech synthesis
  static addEmphasis(text: string, keywords: string[]): string {
    let result = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      result = result.replace(regex, `<emphasis>${keyword}</emphasis>`);
    });
    return result;
  }

  // Add follow-up suggestions
  static addSuggestion(response: string, suggestions: string[] = commonSuggestions): string {
    return `${response} ${getRandomResponse(suggestions)}`;
  }

  // Main response generator
  static generate(options: VoiceFeedbackOptions): VoiceResponse {
    const { intent, slots = {}, success = true, error, variation = false } = options;
    
    // Get the appropriate response handler
    const allResponses = {
      ...educationResponses,
      ...labEquipmentResponses
    };

    const intentResponses = allResponses[intent];
    if (!intentResponses) {
      return {
        text: "I'm not sure how to handle that request.",
        ssml: "<speak>I'm not sure how to handle that request.</speak>"
      };
    }

    // Get base response
    const response = (success && !error) ? intentResponses.success(slots) : intentResponses.error();

    // Add variations if requested
    if (variation) {
      const suggestion = getRandomResponse(commonSuggestions);
      response.text = `${response.text} ${suggestion}`;
      response.ssml = `<speak>${response.text}</speak>`;
    }

    return response;
  }
}
