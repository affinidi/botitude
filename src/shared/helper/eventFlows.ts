/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SlackService } from '../../services/SlackService'
import { issueVCBlockFactory, maxUsersBlockFactory } from './slack/blocksFactory'
import { UsersInfoResponse, WebClient } from '@slack/web-api'
import { Usergroup } from '@slack/web-api/dist/response/UsergroupsListResponse'
import { RespondFn, SayFn } from '@slack/bolt'
import IssueKudosVCFlow from './issueKudosVC'
import { publishSnsIssueVC } from '../snsTopics/snsTopics'
import { slackToUnicode } from '../../shared/helper/emojiParser/emojiParser'

export class KudosVCTriggerFlow {
  public slackService: SlackService
  public say: SayFn
  public message: any
  public userInfos: UsersInfoResponse[]
  public groupInfos: Usergroup[]
  public client: WebClient

  constructor(slackService: SlackService, message: any, say: SayFn, client: any) {
    this.slackService = slackService
    this.say = say
    this.message = message
    this.userInfos = []
    this.groupInfos = []
    this.client = client
  }

  // Allow only parent message
  isParentMessage(): boolean {
    return !this.message.thread_ts
  }

  isBot(userInfo: UsersInfoResponse): boolean {
    return userInfo.user.is_bot
  }

  isBeyondCheckBoxLimits(): boolean {
    return this.userInfos.length + this.groupInfos.length >= 11
  }

  isWithinCheckBoxLimits(): boolean {
    return this.userInfos.length + this.groupInfos.length > 0 && this.userInfos.length + this.groupInfos.length <= 10
  }

  async populateUsersInfosAndGroupInfos(): Promise<void> {
    const userIds = await this.slackService.getMentionedUserIdFromMessage(this.message)
    const groupIds = await this.slackService.getGroupIdFromMessage(this.message)
    for (const userId of userIds) {
      const userInfo = await this.slackService.getUserInfo(userId, this.client)
      if (!this.isBot(userInfo)) {
        this.userInfos.push(userInfo)
      }
    }

    this.groupInfos = await this.slackService.getGroupInfo(groupIds, this.client)
  }

  async responseBeyondCheckBoxLimits(): Promise<void> {
    const blocks = maxUsersBlockFactory()
    await this.say({
      text: 'Would you like to issue Kudos VCs to all the colleagues you tagged?',
      thread_ts: this.message.ts,
      blocks: blocks,
    })
  }

  async responseWithinCheckboxLimits(): Promise<void> {
    const blocks = issueVCBlockFactory(this.userInfos, this.groupInfos)
    await this.say({
      text: 'Would you like to issue a Kudos VC to a colleague?',
      thread_ts: this.message.ts,
      blocks: blocks,
    })
  }

  async execute(): Promise<void> {
    if (this.isParentMessage()) {
      await this.populateUsersInfosAndGroupInfos()
    }

    if (this.isWithinCheckBoxLimits()) {
      await this.responseWithinCheckboxLimits()
    }

    if (this.isBeyondCheckBoxLimits()) {
      await this.responseBeyondCheckBoxLimits()
    }
  }
}

export class KudosVCSelectingIssuerFlow {
  public slackService: SlackService
  public body: any
  public payload: any

  constructor(slackService: SlackService, body: any, payload: any) {
    this.slackService = slackService
    this.body = body
    this.payload = payload
  }

  async execute(): Promise<void> {
    await SlackService.setCheckBoxState(this.body.message.ts, this.payload.selected_options)
  }
}

export class KudosVCSubmitFlow {
  public slackService: SlackService
  public client: WebClient
  public body: any
  public respond: RespondFn
  public userInfos: UsersInfoResponse[]
  public userIds: string[]
  public groupInfos: Usergroup[] = []
  public groupIds: string[]
  public threadConversation: any[]
  public finalVCText: string

  constructor(slackService: SlackService, client: WebClient, body: any, respond: RespondFn) {
    this.slackService = slackService
    this.client = client
    this.body = body
    this.respond = respond
    this.userInfos = []
    this.userIds = []
    this.groupInfos = []
    this.groupIds = []
    this.threadConversation = []
    this.finalVCText = ''
  }

  async populateThreadConversation(): Promise<void> {
    this.threadConversation = await this.slackService.getThreadConversation(
      this.body.channel.id,
      this.body.container.thread_ts,
      this.client,
    )
  }

  async setUnprocessedKudosVCText(): Promise<void> {
    this.finalVCText = this.threadConversation[0].text
  }

  async deleteIntermediateMessages(): Promise<void> {
    if (this.threadConversation.length > 2) {
      const tsToDelete = this.threadConversation[2].ts
      await this.slackService.deleteMessage(this.body.channel.id, tsToDelete)
    }
  }

  async deleteAllBotMessages(): Promise<void> {
    const convo = await this.slackService.getThreadConversation(
      this.body.channel.id,
      this.body.message.thread_ts,
      this.client,
    )
    convo.forEach(async (message, index) => {
      if (index > 0 && message.user === this.body.message.user) {
        const tsToDelete = convo[index].ts
        await this.slackService.deleteMessage(this.body.channel.id, tsToDelete)
      }
    })
    this.slackService.replyMessage('Thank you & Goodbye', this.body.channel.id, this.body.message.thread_ts)
  }

  replaceEmojiFilter(text: string): string {
    return slackToUnicode(text)
  }

  replaceGroupIdWithGroupNameFilter(text: string): string {
    for (const groupInfo of this.groupInfos) {
      text = text.split(`<!subteam^${groupInfo.id}|@${groupInfo.handle}>`).join(groupInfo.name)
    }

    return text
  }

  replaceUserIdWithUserNameFilter(text: string): string {
    for (const userInfo of this.userInfos) {
      text = text.split(`<@${userInfo.user.id}>`).join(userInfo.user.profile.display_name)
    }

    return text
  }

  getSuccessMessage(): string {
    let message = `Success! A VC has been sent to the following: \n`
    for (const userInfo of this.userInfos) {
      message += `- ${userInfo.user.profile.real_name}\n`
    }

    return message
  }

  getFilteredKudosVCText(): void {
    this.finalVCText = this.replaceGroupIdWithGroupNameFilter(this.finalVCText)
    this.finalVCText = this.replaceUserIdWithUserNameFilter(this.finalVCText)
    this.finalVCText = this.replaceEmojiFilter(this.finalVCText)
  }

  async populateIdsAndInfoFromCheckbox(checkBoxState: any[]): Promise<void> {
    for (const checkbox of checkBoxState) {
      const userInfo = await this.slackService.getUserInfo(checkbox.value, this.client)
      if (this.userIds.includes(checkbox.value) || this.groupIds.includes(checkbox.value)) break
      if (userInfo) {
        this.userIds.push(checkbox.value)
        this.userInfos.push(userInfo)
      } else {
        const groupInfo = await this.slackService.getGroupInfo([checkbox.value], this.client)
        this.groupIds.push(checkbox.value)
        this.groupInfos = this.groupInfos.concat(groupInfo)
      }
    }

    for (const groupInfo of this.groupInfos) {
      const userIdsGroup = await this.slackService.getUsersIdsFromGroupId([groupInfo.id], this.client)
      for (const userId of userIdsGroup) {
        const userInfoGroup = await this.slackService.getUserInfo(userId, this.client)
        if (this.userIds.includes(userInfoGroup.user.id) === false) {
          this.userInfos.push(userInfoGroup)
        }
      }
    }
  }

  async populateIdsAndInfoFromMessage() {
    //get profiles from single users
    this.userIds = await this.slackService.getMentionedUserIdFromMessage(this.threadConversation[0])
    if (this.userIds) {
      for (const userId of this.userIds) {
        const userInfo = await this.slackService.getUserInfo(userId, this.client)
        this.userInfos.push(userInfo)
      }
    }

    //get profiles from single users by group
    this.groupIds = await this.slackService.getGroupIdFromMessage(this.threadConversation[0])
    if (this.groupIds) {
      const groupUserIds = await this.slackService.getUsersIdsFromGroupId(this.groupIds, this.client)
      this.groupInfos = await this.slackService.getGroupInfo(this.groupIds, this.client)

      for (const groupUserId of groupUserIds) {
        const userInfo = await this.slackService.getUserInfo(groupUserId, this.client)
        if (this.userIds.includes(userInfo.user.id) === false) {
          this.userInfos.push(userInfo)
        }
      }
    }
  }

  async issueKudosVCs(token: string): Promise<void> {
    const issuer = await this.slackService.getUserInfo(this.threadConversation[0].user, this.client)
    for (const holder of this.userInfos) {
      await publishSnsIssueVC({
        email: holder.user.profile.email,
        finalVCText: this.finalVCText,
        issuer: issuer.user.profile.real_name,
        holderName: holder.user.profile.real_name,
      })
    }
  }

  async flowWithinCheckboxLimits() {
    await this.populateThreadConversation()
    await this.setUnprocessedKudosVCText()
    await this.deleteIntermediateMessages()
    const checkBoxState = SlackService.getCheckBoxState(this.threadConversation[1].ts)

    if (checkBoxState) {
      await this.respond('Please wait while we process your request')
      await this.populateIdsAndInfoFromCheckbox(checkBoxState)
      this.getFilteredKudosVCText()
      await this.issueKudosVCs(this.client.token)
      await this.respond(this.getSuccessMessage())
    } else {
      await this.slackService.replyMessage('Please choose at least one of the checkboxes', this.body.channel.id, this.body.container.thread_ts)
    }
  }

  async flowBeyondCheckboxLimits() {
    await this.populateThreadConversation()
    await this.setUnprocessedKudosVCText()
    await this.populateIdsAndInfoFromMessage()

    if (this.userInfos.length) {
      this.getFilteredKudosVCText()
      await this.issueKudosVCs(this.client.token)
      await this.respond(this.getSuccessMessage())
    }
  }

  async execute(actionType: string): Promise<void> {
    if (actionType == 'yes_maxUsersVC') {
      await this.flowBeyondCheckboxLimits()
    } else if (actionType == 'VC_submit') {
      await this.flowWithinCheckboxLimits()
    }
  }
}
