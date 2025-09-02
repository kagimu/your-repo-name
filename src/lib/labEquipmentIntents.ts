import { VoiceIntent, VoiceContext, VoiceSlot } from './voiceIntents';

// Lab Equipment-specific intents
export const labEquipmentIntents: VoiceIntent[] = [
  {
    name: 'SearchLabEquipment',
    patterns: [
      /^(?:show|find|get)\s+(?:me\s+)?(?<type>microscopes?|beakers?|scales?|spectrometers?|pipettes?|burners?)\s+(?:for\s+)?(?<category>biology|chemistry|physics)?\s*(?:lab)?$/i,
      /^what\s+(?:lab\s+)?equipment\s+(?:do\s+you\s+have\s+)?(?:for\s+)?(?<category>biology|chemistry|physics)(?:\s+lab)?$/i
    ],
    slots: {
      type: {
        name: 'type',
        type: 'string',
        values: ['microscope', 'beaker', 'scale', 'spectrometer', 'pipette', 'burner'],
        transform: (value) => value.toLowerCase().replace(/s$/, ''),
        prompts: {
          missing: "What type of lab equipment are you looking for?",
          invalid: "Please specify a valid type of lab equipment"
        }
      },
      category: {
        name: 'category',
        type: 'string',
        values: ['biology', 'chemistry', 'physics'],
        transform: (value) => value.toLowerCase(),
        prompts: {
          missing: "Which lab category? (biology, chemistry, or physics)",
          invalid: "Please specify: biology, chemistry, or physics"
        }
      }
    },
    examples: [
      "show me microscopes for biology lab",
      "find beakers for chemistry",
      "what equipment do you have for physics lab"
    ],
    action: async (slots, context) => {
      try {
        const results = await context.searchProducts({
          category: 'lab-equipment',
          type: slots.type,
          labType: slots.category
        });
        return results.length > 0;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'LabEquipmentSpecifications',
    patterns: [
      /^(?:show|tell|get)\s+(?:me\s+)?(?:the\s+)?specs?(?:ifications?)?\s+(?:for\s+)?(?<item>[\w\s]+)$/i,
      /^what\s+(?:are\s+)?(?:the\s+)?specs?(?:ifications?)?\s+(?:of|for)\s+(?<item>[\w\s]+)$/i
    ],
    slots: {
      item: {
        name: 'item',
        type: 'string',
        required: true,
        validation: (value) => value.length >= 3,
        prompts: {
          missing: "Which piece of equipment would you like specifications for?",
          invalid: "I couldn't find that equipment. Would you like me to list available options?"
        }
      }
    },
    examples: [
      "show specifications for digital microscope",
      "what are the specs of analytical balance",
      "tell me specs for spectrometer"
    ],
    action: async (slots, context) => {
      try {
        const results = await context.getProductSpecifications({
          category: 'lab-equipment',
          productName: slots.item
        });
        return results !== null;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'LabSetupRecommendations',
    patterns: [
      /^(?:recommend|suggest)\s+(?:a\s+)?lab\s+setup\s+(?:for\s+)?(?<purpose>[\w\s]+)$/i,
      /^what\s+(?:equipment|setup)\s+(?:do\s+I\s+need)\s+(?:for\s+)?(?<purpose>[\w\s]+)(?:\s+lab)?$/i
    ],
    slots: {
      purpose: {
        name: 'purpose',
        type: 'string',
        required: true,
        validation: (value) => value.length >= 5,
        prompts: {
          missing: "What type of lab or experiment are you setting up?",
          invalid: "Could you provide more details about the lab setup you need?"
        }
      }
    },
    examples: [
      "recommend lab setup for high school chemistry",
      "what equipment do I need for basic biology lab",
      "suggest a lab setup for physics experiments"
    ],
    action: async (slots, context) => {
      try {
        const results = await context.getLabRecommendations({
          purpose: slots.purpose
        });
        return results.length > 0;
      } catch (error) {
        return false;
      }
    }
  }
];
