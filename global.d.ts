export {};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: GoogleInitializeConfig) => void;
          prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: AppleAuthConfig) => void;
        signIn: () => Promise<AppleSignInResponse>;
      };
    };
  }

  interface GoogleCredentialResponse {
    credential?: string;
    select_by?: string;
  }

  interface GooglePromptNotification {
    isNotDisplayed?: () => boolean;
    isSkippedMoment?: () => boolean;
  }

  interface GoogleInitializeConfig {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    ux_mode?: 'popup' | 'redirect';
    itp_support?: boolean;
    context?: string;
  }

  interface AppleAuthConfig {
    clientId: string;
    scope?: string;
    redirectURI: string;
    state?: string;
    usePopup?: boolean;
  }

  interface AppleAuthorization {
    id_token?: string;
    code?: string;
    state?: string;
  }

  interface AppleSignInResponse {
    authorization?: AppleAuthorization;
    user?: {
      email?: string;
      name?: {
        firstName?: string;
        lastName?: string;
      };
    };
  }
}

