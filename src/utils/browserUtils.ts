export const checkBrowserSupport = () => {
  const features = {
    webSpeechAPI: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    mediaDevices: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
  };

  const missingFeatures = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([name]) => name);

  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
    features
  };
};

export const requestMicrophoneAccess = async () => {
  try {
    // First check if permissions API is supported
    if ('permissions' in navigator) {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionStatus.state === 'granted') {
        return { granted: true };
      }
      
      if (permissionStatus.state === 'denied') {
        return { 
          granted: false, 
          error: 'Microphone access is blocked. Please allow microphone access in your browser settings.' 
        };
      }
    }

    // If permission is prompt or Permissions API isn't supported, try getUserMedia
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return { granted: true };
  } catch (error: any) {
    let message = 'Unable to access microphone.';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      message = 'Microphone access was denied. Please allow microphone access to use voice commands.';
    } else if (error.name === 'NotFoundError') {
      message = 'No microphone detected. Please connect a microphone and try again.';
    } else if (error.name === 'NotReadableError') {
      message = 'Your microphone is busy or unavailable. Please check other applications that might be using it.';
    }

    return {
      granted: false,
      error: message,
      technical: error.message
    };
  }
};

export const setupAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) {
    throw new Error('AudioContext is not supported in this browser');
  }
  return new AudioContext();
};
