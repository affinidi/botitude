import chai from 'chai'
import { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { AFFINIDI_API_ENDPOINTS } from '../../../src/shared/consts'
import MockAdapter from 'axios-mock-adapter'
import ApiService from '../../../src/services/ApiService'
import { cloudWalletApi, issuerApi } from '../../../src/services/ApiService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

const mockCloudWalletApi = new MockAdapter(cloudWalletApi)
const mockIssuerApi = new MockAdapter(issuerApi)

describe('ApiService', async () => {
  afterEach(() => {
    mockCloudWalletApi.reset()
    mockIssuerApi.reset()
    sinon.restore()
  })

  it('Can login', async () => {
    const user = {
      username: 'testUser',
      password: 'testPassword1',
    }

    const loginOutput = {
      accessToken: 'someAccessToken',
      did: 'someDid',
    }
    mockCloudWalletApi.onPost(AFFINIDI_API_ENDPOINTS.LOGIN, user).reply(200, loginOutput)
    await expect(ApiService.login(user.username, user.password)).to.eventually.be.deep.equal(loginOutput)
  })

  it('An error will be thrown if incorrect username/password during login', async () => {
    const user = {
      username: 'testUser',
      password: 'testPassword1',
    }
    mockCloudWalletApi.onPost(AFFINIDI_API_ENDPOINTS.LOGIN, user).reply(400)
    await expect(ApiService.login(user.username, user.password)).to.eventually.be.rejectedWith(
      'Incorrect username or password',
    )
  })

  it('An error will be thrown if user not found during login', async () => {
    const user = {
      username: 'testUser',
      password: 'testPassword1',
    }
    mockCloudWalletApi.onPost(AFFINIDI_API_ENDPOINTS.LOGIN, user).reply(404)
    await expect(ApiService.login(user.username, user.password)).to.eventually.be.rejectedWith('User not found')
  })

  it('An error will be thrown if other errors during login', async () => {
    const user = {
      username: 'testUser',
      password: 'testPassword1',
    }
    mockCloudWalletApi.onPost(AFFINIDI_API_ENDPOINTS.LOGIN, user).reply(500)
    await expect(ApiService.login(user.username, user.password)).to.eventually.be.rejected
  })

  it('Can set login details', () => {
    expect(ApiService.setLoginDetails('testAccessToken', 'testDid')).to.be.true
  })

  it('Can get login details', () => {
    expect(ApiService.getLoginDetails()).to.be.deep.equal({
      accessToken: 'testAccessToken',
      did: 'testDid',
    })
  })

  it('Can do client side login', () => {
    sinon.stub(ApiService, 'setLoginDetails').returns(true)
    sinon.stub(ApiService, 'setAuthorizationBearer')
    const accessToken = 'testAccessToken'
    const did = 'testDid'

    ApiService.clientSideLogin(accessToken, did)
    expect(ApiService.setLoginDetails).to.be.calledWith(accessToken, did)
    expect(ApiService.setAuthorizationBearer).to.be.calledWith(accessToken)
  })

  it('Will throw an error if login details not set in cache during client side login', () => {
    sinon.stub(ApiService, 'setLoginDetails').returns(false)
    sinon.stub(ApiService, 'setAuthorizationBearer')
    const accessToken = 'testAccessToken'
    const did = 'testDid'

    expect(ApiService.clientSideLogin(accessToken, did)).to.be.rejectedWith('Login details is not set, please check')
    expect(ApiService.setLoginDetails).to.be.calledWith(accessToken, did)
    expect(ApiService.setAuthorizationBearer).to.not.be.calledWith(accessToken)
  })

  it('Can set authorization bearer', () => {
    mockCloudWalletApi.restore()
    const accessToken = 'testAccessToken'
    ApiService.setAuthorizationBearer(accessToken)
    expect(cloudWalletApi.defaults.headers.common['Authorization']).to.be.equal(`Bearer ${accessToken}`)
  })
})
