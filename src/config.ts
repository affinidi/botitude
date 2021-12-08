import { config } from 'dotenv'

config()
interface EnvConfig {
  awsTopicArn: string

  slackBotSigningToken: string
  slackBotToken: string

  slackEventListenerPort: number

  slackBotClientId: string
  slackBotClientSecret: string
  slackBotStateSecret: string

  redisHost: string
  redisPort: number
  redisPassword: string

  affinidiAccessKey: string

  affinidiLemmaTreeUsername: string
  affinidiLemmaTreePassword: string

  mixpanelToken: string
  mixpanelId: string
}

const envConfig: EnvConfig = {
  awsTopicArn: process.env.BOT_TOPIC_ARN,

  slackBotSigningToken: process.env.SLACKBOT_SIGNING_TOKEN,
  slackBotToken: process.env.SLACKBOT_TOKEN,
  slackEventListenerPort: parseInt(process.env.SLACK_EVENT_LISTENER_PORT),
  slackBotClientId: process.env.SLACK_CLIENT_ID,
  slackBotClientSecret: process.env.SLACK_CLIENT_SECRET,
  slackBotStateSecret: process.env.SLACK_STATE_SECRET,

  redisHost: process.env.REDIS_HOST,
  redisPort: Number.parseInt(process.env.REDIS_PORT),
  redisPassword: process.env.REDIS_PASSWORD,

  affinidiAccessKey: process.env.AFFINIDI_API_KEY,
  affinidiLemmaTreeUsername: process.env.AFFINIDI_LEMMATREE_ISSUER_USERNAME,
  affinidiLemmaTreePassword: process.env.AFFINIDI_LEMMATREE_ISSUER_PASSWORD,

  mixpanelToken: process.env.MIXPANEL_TOKEN,
  mixpanelId: process.env.MIXPANEL_ID,
}

export default envConfig
