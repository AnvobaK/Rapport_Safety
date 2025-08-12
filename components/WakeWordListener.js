import React, { useEffect } from 'react';
import { PorcupineManager } from '@picovoice/porcupine-react-native';

const ACCESS_KEY = 'SWb1iriZG9JvmlQTCJGbaK5cvrkdop15NBsutNJylFzYjgAdpDiDZg==';
const KEYWORD_PATH = 'assets/keywords/Blueberry_en_android_v3_0_0.ppn'; 

export default function WakeWordListener() {
  useEffect(() => {
    let porcupineManager;

    const initPorcupine = async () => {
      porcupineManager = await PorcupineManager.fromKeywordPaths(
        ACCESS_KEY,
        [KEYWORD_PATH],
        wakeWordDetected
      );
      await porcupineManager.start();
    };

    const wakeWordDetected = (keywordIndex) => {
      console.log(`Wake word detected: ${keywordIndex}`);
      // Trigger SOS logic here
    };

    initPorcupine();

    return () => {
      if (porcupineManager) porcupineManager.stop();
    };
  }, []);

  return null;
}
