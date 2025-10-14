import React from 'react';
import { Outlet } from 'react-router-dom';
import VoiceAssistant from './VoiceAssistant';

const VoiceAssistantWrapper: React.FC = () => {
  return (
    <>
      <Outlet />
      <VoiceAssistant />
    </>
  );
};

export default VoiceAssistantWrapper;
