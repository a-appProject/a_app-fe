import store from "@/store";

export class ApiService {
  public static url =  import.meta.env.VITE_API_URL;
  // public static url =  '77.232.139.243';
  public static baseUrl = `${ApiService.url}/api`;

  static getToken(): string | undefined {
    const launchParams = store.getters.TELEGRAM_RETRIENE_LAUNCH_PARAMS;
    const authToken = store.getters.AUTH_TOKEN;

    if (launchParams) {
      return launchParams;
    }

    if (authToken) {
      return authToken;
    }

    return undefined;
  }

  static withAuth(): HeadersInit {
    const token = this.getToken();

    
    if (!token) {
      return {};
    }

    const devMode = import.meta.env.VITE_DEV;
    if (store.getters.TELEGRAM_RETRIENE_LAUNCH_PARAMS) {
      if (devMode === 'true') {
        return {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `tma-dev ${token}`,
        };
      }
      else {
        return {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `tma-prod ${token}`,
        };
      }
    }
    
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `web-prod ${encodeURIComponent(JSON.stringify(token))}`,
    };
  }
}
