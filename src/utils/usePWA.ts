/** @format */

import { useEffect, useState } from 'react';

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Function to prompt the user to install the app
  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    // Show the install prompt
    const promptEvent = installPrompt as any;
    const userChoice = await promptEvent.prompt();

    // Wait for the user to respond to the prompt
    const outcome = await userChoice.userChoice;

    // Clear the saved prompt
    setInstallPrompt(null);

    return outcome && outcome.outcome === 'accepted';
  };

  return {
    isInstallable: !!installPrompt,
    isInstalled,
    promptInstall
  };
}
