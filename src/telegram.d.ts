declare global {
  interface Window {
    Telegram: {
      WebApp: {
        SecondaryButton: any;
        platform: string;
        initData: string;
        initDataUnsafe: any;
        version: string;
        colorScheme: string;
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        MainButton: any;
        BackButton: any;
        HapticFeedback: any;
        enableClosingConfirmation: any;
        disableVerticalSwipes: any;
        lockOrientation: any;
      };
    };
  }
}

export {}; 