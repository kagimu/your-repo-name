import type { VoiceResponse } from './voiceIntents';
import { educationResponses, labEquipmentResponses } from './feedbackHandlers';

interface VoiceFeedbackOptions {
  intent: string;
  slots?: Record<string, any>;
  success?: boolean;
  error?: Error;
  variation?: boolean;
  includeSuggestions?: boolean; // Whether to add follow-up suggestions
}

// Helper to format currency amounts
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

// Voice response variation helpers
const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)];
};

export class VoiceFeedback {
  // Education-specific responses
  private static readonly EDUCATION_RESPONSES = {
    SearchEducationalMaterials: {
      success: (slots: Record<string, any>): VoiceResponse => ({
        text: `Here are the study materials I found for ${slots.subject}${slots.level ? ` at ${slots.level} level` : ''}.`,
        ssml: `<speak>Here are the study materials I found for ${slots.subject}${slots.level ? ` at ${slots.level} level` : ''}.</speak>`,
        visualHints: {
          focus: 'education-materials',
          show: ['materials-list']
        }
      }),
      error: (): VoiceResponse => ({
        text: "I couldn't find any study materials matching your request. Would you like to try a different subject or level?",
        ssml: "<speak>I couldn't find any study materials matching your request. Would you like to try a different subject or level?</speak>",
        visualHints: {
          show: ['subject-suggestions']
        }
      })
    },
    FindPastPapers: {
      success: (slots: Record<string, any>): VoiceResponse => ({
        text: `I found these past papers for ${slots.subject}${slots.examBoard ? ` from ${slots.examBoard}` : ''}${slots.year ? ` (${slots.year})` : ''}.`,
        ssml: `<speak>I found these past papers for ${slots.subject}${slots.examBoard ? ` from ${slots.examBoard}` : ''}${slots.year ? ` from ${slots.year}` : ''}.</speak>`,
        visualHints: {
          focus: 'past-papers',
          show: ['papers-list']
        }
      }),
      error: (): VoiceResponse => ({
        text: "I couldn't find any past papers matching your criteria. Would you like to see available options?",
        ssml: "<speak>I couldn't find any past papers matching your criteria. Would you like to see available options?</speak>",
        visualHints: {
          show: ['paper-suggestions']
        }
      })
    },
    ExploreEducationalResources: {
      success: (slots: Record<string, any>): VoiceResponse => ({
        text: `Here are the ${slots.type} available for ${slots.subject}.`,
        ssml: `<speak>Here are the ${slots.type} available for ${slots.subject}.</speak>`,
        visualHints: {
          focus: 'education-resources',
          show: ['resource-list']
        }
      }),
      error: (): VoiceResponse => ({
        text: "I couldn't find any resources matching your request. Would you like to see what's available?",
        ssml: "<speak>I couldn't find any resources matching your request. Would you like to see what's available?</speak>",
        visualHints: {
          show: ['resource-suggestions']
        }
      })
    }
  };

  // Lab equipment-specific responses
  private static readonly LAB_RESPONSES = {
    SearchLabEquipment: {
      success: (slots: Record<string, any>): VoiceResponse => ({
        text: `Here's what I found for ${slots.type}${slots.category ? ` in ${slots.category}` : ''}.`,
        ssml: `<speak>Here's what I found for ${slots.type}${slots.category ? ` in ${slots.category}` : ''}.</speak>`,
        visualHints: {
          focus: 'lab-equipment',
          show: ['equipment-list']
        }
      }),
      error: (): VoiceResponse => ({
        text: "I couldn't find any equipment matching your request. Would you like to see what's available?",
        ssml: "<speak>I couldn't find any equipment matching your request. Would you like to see what's available?</speak>",
        visualHints: {
          show: ['equipment-suggestions']
        }
      })
    },
    LabEquipmentSpecifications: {
      success: (slots: Record<string, any>): VoiceResponse => ({
        text: `Here are the specifications for ${slots.item}.`,
        ssml: `<speak>Here are the specifications for ${slots.item}.</speak>`,
        visualHints: {
          focus: 'equipment-specs',
          show: ['specifications']
        }
      }),
      error: (): VoiceResponse => ({
        text: "I couldn't find specifications for that equipment. Would you like to see our available equipment?",
        ssml: "<speak>I couldn't find specifications for that equipment. Would you like to see our available equipment?</speak>",
        visualHints: {
          show: ['equipment-list']
        }
      })
    },
    LabSetupRecommendations: {
      success: (slots: Record<string, any>): VoiceResponse => ({
        text: `Here's my recommended setup for ${slots.purpose}.`,
        ssml: `<speak>Here's my recommended setup for ${slots.purpose}.</speak>`,
        visualHints: {
          focus: 'lab-setup',
          show: ['setup-recommendations']
        }
      }),
      error: (): VoiceResponse => ({
        text: "I couldn't generate recommendations for that setup. Would you like to see some example setups?",
        ssml: "<speak>I couldn't generate recommendations for that setup. Would you like to see some example setups?</speak>",
        visualHints: {
          show: ['setup-examples']
        }
      })
    }
  };

  static generateResponse({ intent, slots = {}, success = true, error, variation = false }: VoiceFeedbackOptions): VoiceResponse {
    const responses = {
      ...this.EDUCATION_RESPONSES,
      ...this.LAB_RESPONSES
    };

    const intentResponses = responses[intent];
    if (!intentResponses) {
      return {
        text: "I'm not sure how to handle that request.",
        ssml: "<speak>I'm not sure how to handle that request.</speak>"
      };
    }

    if (!success || error) {
      return intentResponses.error();
    }

    return intentResponses.success(slots);
  }
}
  static addEmphasis(text: string, keywords: string[]): string {
    let result = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      result = result.replace(regex, `<emphasis>${keyword}</emphasis>`);
    });
    return result;
  }

  static addSuggestion(response: string, suggestions: string[]): string {
    return `${response} ${getRandomResponse(suggestions)}`;
  }

  static generateResponse({ intent, slots = {}, success = true, error, variation = false }: VoiceFeedbackOptions): VoiceResponse {
    const responses = {
      ...this.EDUCATION_RESPONSES,
      ...this.LAB_RESPONSES
    };

    const intentResponses = responses[intent];
    if (!intentResponses) {
      return {
        text: "I'm not sure how to handle that request.",
        ssml: "<speak>I'm not sure how to handle that request.</speak>"
      };
    }

    if (!success || error) {
      return intentResponses.error();
    }

    const response = intentResponses.success(slots);

    // Add variations and suggestions if requested
    if (variation) {
      response.text = this.addSuggestion(response.text, [
        "Would you like to see more details?",
        "I can help you find similar items if needed.",
        "Let me know if you need anything else."
      ]);
      response.ssml = `<speak>${this.addSuggestion(response.ssml.replace(/<\/?speak>/g, ''), [
        "Would you like to see more details?",
        "I can help you find similar items if needed.",
        "Let me know if you need anything else."
      ])}</speak>`;
    }

    return response;
  }
        response = "I'm not sure what you want to do with the cart.";
    }

    if (this.options.personalizeResponse && this.userName) {
      response = `${this.userName}, ${response.toLowerCase()}`;
    }

    return response;
  }

  // Generate a response for lab-related queries
  generateLabResponse(
    type: 'stock' | 'specimens',
    params: {
      item?: string;
      quantity?: number;
      items?: string[];
      specimens?: string[];
    }
  ): string {
    let response: string;

    switch (type) {
      case 'stock':
        if (params.item && typeof params.quantity === 'number') {
          if (params.quantity === 0) {
            response = this.options.variation
              ? getRandomResponse(voiceResponses.lab.stock.none(params.item))
              : voiceResponses.lab.stock.none(params.item)[0];
          } else {
            response = this.options.variation
              ? getRandomResponse(voiceResponses.lab.stock.check(params.item, params.quantity))
              : voiceResponses.lab.stock.check(params.item, params.quantity)[0];
          }
        } else if (params.items) {
          response = this.options.variation
            ? getRandomResponse(voiceResponses.lab.stock.low(params.items))
            : voiceResponses.lab.stock.low(params.items)[0];
        } else {
          response = "I couldn't check the stock level.";
        }
        break;

      case 'specimens':
        if (params.specimens) {
          response = this.options.variation
            ? getRandomResponse(voiceResponses.lab.specimens.available(params.specimens))
            : voiceResponses.lab.specimens.available(params.specimens)[0];
        } else {
          response = "No specimens are currently available.";
        }
        break;

      default:
        response = "I'm not sure what lab information you're looking for.";
    }

    return response;
  }

  // Generate error and clarification responses
  generateErrorResponse(
    type: 'general' | 'specific' | 'clarification',
    params?: {
      issue?: string;
      clarificationType?: 'quantity' | 'product' | 'filter';
    }
  ): string {
    let response: string;

    switch (type) {
      case 'general':
        response = this.options.variation
          ? getRandomResponse(voiceResponses.context.error.general)
          : voiceResponses.context.error.general[0];
        break;

      case 'specific':
        if (params?.issue) {
          response = this.options.variation
            ? getRandomResponse(voiceResponses.context.error.specific(params.issue))
            : voiceResponses.context.error.specific(params.issue)[0];
        } else {
          response = this.generateErrorResponse('general');
        }
        break;

      case 'clarification':
        if (params?.clarificationType) {
          response = this.options.variation
            ? getRandomResponse(voiceResponses.context.clarification[params.clarificationType])
            : voiceResponses.context.clarification[params.clarificationType][0];
        } else {
          response = "Could you please provide more information?";
        }
        break;

      default:
        response = "Something went wrong. Please try again.";
    }

    return response;
  }
}
