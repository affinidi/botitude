import axios, { AxiosInstance } from 'axios'
import { LoginOutput } from '../shared/typings/ApiService'
import config from '../config'
import { AFFINIDI_API_ENDPOINTS } from '../shared/consts'
import NodeCache from 'node-cache'

const baseURL = {
  cloudWallet: 'https://cloud-wallet-api.prod.affinity-project.org/api/v1',
  issuer: 'https://affinity-issuer.prod.affinity-project.org/api/v1',
  gdeMiddleware: 'https://gde-wallet-middleware.prod.affinidi.io'
}

export const cloudWalletApi: AxiosInstance = axios.create({
  baseURL: baseURL.cloudWallet,
  headers: {
    'Api-Key': config.affinidiAccessKey,
    'Content-Type': 'application/json',
  },
})

export const issuerApi: AxiosInstance = axios.create({
  baseURL: baseURL.issuer,
  headers: {
    'Api-Key': config.affinidiAccessKey,
    'Content-Type': 'application/json',
  },
})

export const gdeMiddlewareApi: AxiosInstance = axios.create({
  baseURL: baseURL.gdeMiddleware,
  headers: {
    'Api-Key': config.affinidiAccessKey,
    'Content-Type': 'application/json',
  },
})

const cache = new NodeCache()

class ApiService {

  /**
   * Method to login user using API
   * @param username
   * @param password
   * @returns
   */
  static async login(username: string, password: string): Promise<LoginOutput> {
    try {
      const loginParams = { username: username, password: password }
      const response = await cloudWalletApi.post<LoginOutput>(AFFINIDI_API_ENDPOINTS.LOGIN, loginParams)
      return response.data
    } catch (error) {
      if (error.response) {
        if (error.response.status == 400) {
          throw new Error('Incorrect username or password')
        } else if (error.response.status == 404) {
          throw new Error('User not found')
        } else {
          console.error(JSON.stringify(error))
          throw error
        }
      } else {
        console.error(JSON.stringify(error))
        throw error
      }
    }
  }

  static async issueVC(data: any, accessToken: string) {
    try {
      const response = await gdeMiddlewareApi.post(
        AFFINIDI_API_ENDPOINTS.ISSUE_VC, data, {
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        }
      }
      );
      return { response: response.data, error: false };
    }
    catch (err: any) {
      return { errorMsg: err, error: true }
    }
  }


  static setLoginDetails(accessToken: string, did: string, ttl = 0): boolean {
    const loginDetails = { accessToken: accessToken, did: did }
    return cache.set('loginDetails', loginDetails, ttl)
  }

  static getLoginDetails(): LoginOutput {
    const loginDetails: LoginOutput = cache.get('loginDetails')
    return loginDetails
  }

  static async clientSideLogin(accessToken: string, did: string): Promise<void> {
    const isSet = ApiService.setLoginDetails(accessToken, did)
    if (!isSet) {
      throw new Error('Login details is not set, please check')
    }

    ApiService.setAuthorizationBearer(accessToken)
  }

  static setAuthorizationBearer(accessToken: string): void {
    cloudWalletApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }
}

export default ApiService
