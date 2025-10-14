import type { VoiceResponse } from './voiceIntents';

export const educationResponses = {
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

export const labEquipmentResponses = {
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
