// Type declarations for Google APIs
declare global {
  interface Window {
    gapi: {
      load: (apis: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey?: string;
          clientId: string;
          discoveryDocs: string[];
          scope: string;
        }) => Promise<void>;
        calendar: {
          events: {
            list: (params: {
              calendarId: string;
              timeMin: string;
              timeMax: string;
              singleEvents: boolean;
              orderBy: string;
              maxResults: number;
            }) => Promise<{
              result: {
                items: any[];
              };
            }>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          signIn: () => Promise<{
            getAuthResponse: () => any;
            getBasicProfile: () => {
              getEmail: () => string;
            };
          }>;
          signOut: () => void;
          isSignedIn: {
            get: () => boolean;
          };
        };
      };
    };
  }
}

export {};