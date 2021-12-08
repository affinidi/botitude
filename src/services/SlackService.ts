import { App, LogLevel } from '@slack/bolt'
import { UsergroupsListArguments, UsersInfoResponse, WebClient } from '@slack/web-api'
import { Usergroup } from '@slack/web-api/dist/response/UsergroupsListResponse'
import envConfig from '../config'
import { Block } from '../shared/typings/SlackService'
import NodeCache from 'node-cache'
import { User } from '@slack/web-api/dist/response/UsersInfoResponse'
import RedisService from './Redis'
import ExpressReceiver from '../shared/helper/ExpressReceiver'

const redisService = new RedisService()
const cache = new NodeCache()

export class SlackService {
  web: WebClient
  client: WebClient

  constructor(token: string) {
    this.web = new WebClient(token)
  }

  async findUser(email: string): Promise<User> {
    const response = await this.web.users.lookupByEmail({ email })
    if (!response || !response.user) {
      throw Error(`User ${email} did not found.`)
    }

    return response.user
  }

  async replyMessage(message: string, channel: string, threadTs: string, blocks: Block[] = []): Promise<void> {
    try {
      await this.web.chat.postMessage({
        text: message,
        channel,
        thread_ts: threadTs,
        link_names: true,
        blocks: blocks,
      })
    } catch (error) {
      console.error(error)
    }
  }

  async deleteMessage(channel: string, ts: string): Promise<void> {
    try {
      const result = await this.web.chat.delete({
        channel,
        ts: ts,
      })
    } catch (error) {
      console.error(error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async getUserInfo(userId: string, client?: WebClient): Promise<UsersInfoResponse> {
    try {
      const userInfo = await this.web.users.info({
        user: userId,
        token: client.token,
      })
      return userInfo
    } catch (error) {
      if (error.data.error == 'user_not_found') {
        console.log('this user not found')
        return null
      } else {
        console.error(error)
        throw error
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async getMentionedUserIdFromMessage(message: any): Promise<string[]> {
    const text: string = message.text
    // Format of mentioned user in message.text: <@U01QHCSQUKV>
    const regexUserId = /<@(.*?)>/g
    const userIds: string[] = []

    if (text && text.match(regexUserId)) {
      for (const handler of text.match(regexUserId)) {
        const id = handler.substring(handler.indexOf('@') + 1, handler.indexOf('>'))
        if (!userIds.includes(id)) {
          userIds.push(id)
        }
      }
    }

    return userIds
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async getGroupIdFromMessage(message: any): Promise<string[]> {
    const text: string = message.text
    const groupIds: string[] = []
    // Format: <!subteam^S026G7ZBRPS|@grat-bot-test>
    const regexGroupId = /<!(.*?)>/g
    if (text && text.match(regexGroupId)) {
      for (const handler of text.match(regexGroupId)) {
        const id = handler.substring(handler.indexOf('^') + 1, handler.indexOf('|'))
        groupIds.push(id)
      }
    }

    return groupIds
  }

  async getUsersIdsFromGroupId(groupId: string[], client: WebClient): Promise<string[]> {
    const groupIds: string[] = groupId
    let userIds: string[] = []
    for (const groupId of groupIds) {
      const { users } = await this.web.usergroups.users.list({
        usergroup: groupId,
        token: client.token,
      })
      userIds = userIds.concat(users)
    }

    return userIds
  }

  async getGroupInfo(groupID: string[], client: WebClient, teamId?: UsergroupsListArguments): Promise<Usergroup[]> {
    try {
      const groupsListResponse = await this.web.usergroups.list({ team_id: teamId, token: client.token })
      const groupInfo = groupsListResponse.usergroups.filter((group) => groupID.includes(group.id))
      return groupInfo
    } catch (error) {
      if (error.data.error == 'user_not_found') {
        console.log('group user not found')
        return null
      } else {
        console.error(error)
        throw error
      }
    }
  }

  async getThreadConversation(channel: string, parentTs: string, client: WebClient): Promise<any[]> {
    // Store thread
    let threadConversation
    try {
      // Call the conversations.replies method using WebClient
      const result = await this.web.conversations.replies({
        channel: channel,
        ts: parentTs,
        token: client.token,
      })

      threadConversation = result.messages

      return threadConversation
    } catch (error) {
      console.error(error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static setCheckBoxState(message_ts: string, state: any): void {
    cache.set(message_ts, state)
  }

  static getCheckBoxState(message_ts: string): any {
    return cache.get(message_ts)
  }
}

//Installation Store
const myInstallationStore = {
  storeInstallation: async (installation: any) => {
    if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
      // support for org wide app installation
      return await redisService.setValue(installation.enterprise.id, JSON.stringify(installation))
    }

    if (installation.team !== undefined) {
      // single team app installation
      return await redisService.setValue(installation.team.id, JSON.stringify(installation))
    }

    throw new Error('Failed saving installation data to installationStore')
  },
  fetchInstallation: async (installQuery: any) => {
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      // org wide app installation lookup
      return await redisService.getValue(installQuery.enterpriseId)
    }

    if (installQuery.teamId !== undefined) {
      // single team app installation lookup
      const result = await redisService.getValue(installQuery.teamId)
      return result
    }

    throw new Error('Failed fetching installation')
  },
  deleteInstallation: async (installQuery: any) => {
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      // org wide app installation deletion
      return await redisService.deleteValue(installQuery.enterpriseId)
    }

    if (installQuery.teamId !== undefined) {
      // single team app installation deletion
      return await redisService.deleteValue(installQuery.teamId)
    }

    throw new Error('Failed to delete installation')
  },
}

// OAuth Flow
export const expressReceiver = new ExpressReceiver({
  signingSecret: envConfig.slackBotSigningToken,
  clientId: envConfig.slackBotClientId,
  clientSecret: envConfig.slackBotClientSecret,
  stateSecret: envConfig.slackBotStateSecret,
  scopes: [
    'channels:history',
    'chat:write',
    'groups:history',
    'incoming-webhook',
    'usergroups:read',
    'users:read',
    'users:read.email',
    'app_mentions:read',
  ],
  installationStore: myInstallationStore,
  processBeforeResponse: true,
  installerOptions: {
    directInstall: true
  },
})

export const eventListener = new App({
  logLevel: LogLevel.DEBUG,
  receiver: expressReceiver,
})
