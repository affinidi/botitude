import ApiService from '../../services/ApiService'
import envConfig from '../../config'
import { VCBuildUnsignedInput } from '../typings/ApiService'

class IssueKudosVCFlow {
  public email: string
  public kudosVCText: string
  public issuerName: string
  public holderName: string

  constructor(email: string, kudosVCText: string, issuerName: string, token: string, holderName: string) {
    this.email = email
    this.kudosVCText = kudosVCText
    this.issuerName = issuerName
    this.holderName = holderName
  }

  async loginLemmaTree() {
    const { accessToken, did } = await ApiService.login(
      envConfig.affinidiLemmaTreeUsername,
      envConfig.affinidiLemmaTreePassword,
    )
    await ApiService.clientSideLogin(accessToken, did)
    return { accessToken, did }
  }

  getUnsignedKudosVC(name: string): VCBuildUnsignedInput {
    return {
      type: 'KudosCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'KudosPerson'],
        name: name,
        message: this.kudosVCText,
        awardedDate: new Date().toLocaleString().replace(',', ''),
        awardedBy: this.issuerName,
      },
      holderDid: '',
    }
  }

  async lemmaTreeIssueKudosVC(accessToken: string, did: string): Promise<void> {
    const vc = this.getUnsignedKudosVC(this.holderName)
    const data = {
      data: [{
        email: this.email,
        vc: vc
      }],
      didToken: did
    }

    const { error, errorMsg } = await ApiService.issueVC(data, accessToken)
    if (error) {
      console.log('Error ' + errorMsg)
      throw error
    }

    return
  }

  async execute(): Promise<void> {
    try {
      const { accessToken, did } = await this.loginLemmaTree()
      await this.lemmaTreeIssueKudosVC(accessToken, did)
    } catch (error) {
      console.log('Unable to issue VC')
      throw error
    }
  }
}

export default IssueKudosVCFlow
