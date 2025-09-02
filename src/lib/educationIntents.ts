import { VoiceIntent, VoiceContext, VoiceSlot } from './voiceIntents';

// Education-specific intents
export const educationIntents: VoiceIntent[] = [
  {
    name: 'SearchEducationalMaterials',
    patterns: [
      /^(?:show|find|get)\s+(?:me\s+)?(?:study\s+)?materials?\s+(?:for\s+)?(?<subject>[\w\s]+)(?:\s+(?:at|for)\s+(?<level>[\w\s]+)\s+level)?$/i,
      /^what\s+(?:study\s+)?materials?\s+(?:do\s+you\s+have\s+)?(?:for\s+)?(?<subject>[\w\s]+)$/i,
    ],
    slots: {
      subject: {
        name: 'subject',
        type: 'string',
        required: true,
        validation: (value) => value.length >= 2,
        prompts: {
          missing: "Which subject are you looking for?",
          invalid: "I don't recognize that subject. Would you like me to list available subjects?"
        }
      },
      level: {
        name: 'level',
        type: 'string',
        values: ['primary', 'secondary', 'university'],
        transform: (value) => value.toLowerCase(),
        prompts: {
          invalid: "Please specify: primary, secondary, or university level"
        }
      }
    },
    examples: [
      "show me materials for physics",
      "find study materials for chemistry at secondary level",
      "what materials do you have for biology"
    ],
    action: async (slots, context) => {
      try {
        const results = await context.searchProducts({
          category: 'education',
          subject: slots.subject,
          level: slots.level
        });
        return results.length > 0;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'FindPastPapers',
    patterns: [
      /^(?:show|find|get)\s+(?:me\s+)?(?<examBoard>UNEB|Cambridge|Edexcel)?\s*(?:past\s+)?papers\s+(?:for\s+)?(?<subject>[\w\s]+)?(?:\s+(?<year>\d{4}))?$/i,
      /^what\s+past\s+papers?\s+(?:do\s+you\s+have\s+)?(?:for\s+)?(?<subject>[\w\s]+)$/i
    ],
    slots: {
      examBoard: {
        name: 'examBoard',
        type: 'string',
        values: ['UNEB', 'Cambridge', 'Edexcel'],
        transform: (value) => value.toUpperCase(),
        prompts: {
          missing: "Which exam board would you like? (UNEB, Cambridge, or Edexcel)",
          invalid: "Please specify: UNEB, Cambridge, or Edexcel"
        }
      },
      subject: {
        name: 'subject',
        type: 'string',
        validation: (value) => value.length >= 2,
        prompts: {
          missing: "Which subject's past papers would you like?",
          invalid: "I don't recognize that subject. Would you like me to list available subjects?"
        }
      },
      year: {
        name: 'year',
        type: 'string',
        validation: (value) => /^\d{4}$/.test(value) && parseInt(value) >= 2000,
        prompts: {
          invalid: "Please specify a valid year (2000 or later)"
        }
      }
    },
    examples: [
      "find UNEB past papers for mathematics",
      "show me Cambridge physics papers 2023",
      "what past papers do you have for chemistry"
    ],
    action: async (slots, context) => {
      try {
        const results = await context.searchProducts({
          category: 'past-papers',
          examBoard: slots.examBoard,
          subject: slots.subject,
          year: slots.year
        });
        return results.length > 0;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'ExploreEducationalResources',
    patterns: [
      /^(?:show|list|explore)\s+(?:all\s+)?(?<type>textbooks|notes|tutorials|guides)\s+(?:for\s+)?(?<subject>[\w\s]+)?$/i,
      /^what\s+(?<type>textbooks|notes|tutorials|guides)\s+(?:do\s+you\s+have)\s+(?:for\s+)?(?<subject>[\w\s]+)?$/i
    ],
    slots: {
      type: {
        name: 'type',
        type: 'string',
        values: ['textbooks', 'notes', 'tutorials', 'guides'],
        transform: (value) => value.toLowerCase(),
        required: true,
        prompts: {
          missing: "What type of resources are you looking for? (textbooks, notes, tutorials, or guides)",
          invalid: "Please specify: textbooks, notes, tutorials, or guides"
        }
      },
      subject: {
        name: 'subject',
        type: 'string',
        validation: (value) => value.length >= 2,
        prompts: {
          missing: "Which subject would you like to explore?",
          invalid: "I don't recognize that subject. Would you like me to list available subjects?"
        }
      }
    },
    examples: [
      "show all textbooks for physics",
      "list tutorials for mathematics",
      "what notes do you have for chemistry"
    ],
    action: async (slots, context) => {
      try {
        const results = await context.searchProducts({
          category: 'education',
          resourceType: slots.type,
          subject: slots.subject
        });
        return results.length > 0;
      } catch (error) {
        return false;
      }
    }
  }
];
