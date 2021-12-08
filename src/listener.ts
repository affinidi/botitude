import envConfig from './config'
import { eventListener, expressReceiver } from './services/SlackService'
import { SlackService } from './services/SlackService'
import { KudosVCSelectingIssuerFlow, KudosVCSubmitFlow, KudosVCTriggerFlow } from './shared/helper/eventFlows'
import IssueKudosVCFlow from './shared/helper/issueKudosVC'
import { helpView } from './shared/helper/slack/blocks/helpView'
import { appHomeBlockFactory } from './shared/helper/slack/blocksFactory'
const serverlessExpress = require('@vendia/serverless-express');

(async () => {
  try {
    await eventListener.start(envConfig.slackEventListenerPort || 3000)
    console.log('App has started.....')
  } catch (error) {
    console.error(error)
  }
})()

/**
 * Channel Message Event Listener:
 * Reads messages from channel and prompt user if he/she
 * wants to issue a VC in a thread
 */

eventListener.event('app_home_opened', async ({ payload, say, client }) => {
  try {
    const userId = payload.user
    const result = await eventListener.client.views.publish({
      token: client.token,
      user_id: userId,
      view: {
        type: 'home',
        blocks: appHomeBlockFactory(userId),
      },
    })
  } catch (error) {
    if (error) {
      say('There was an error opening home. Please try again, or contact the app administrator.')
    }
  }
})

eventListener.message(async ({ message, say, client }) => {
  const slack = new SlackService(client.token)
  const kudosVCTriggerFlow = new KudosVCTriggerFlow(slack, message, say, client)
  await kudosVCTriggerFlow.execute()
})

/**
 *listens to checkboxes
 */
eventListener.action('VC_target', async ({ ack, body, payload, client }) => {
  const slack = new SlackService(client.token)
  await ack()
  const kudosVCSelectingIssuerFlow = new KudosVCSelectingIssuerFlow(slack, body, payload)
  await kudosVCSelectingIssuerFlow.execute()
})

eventListener.command('/help', async ({ ack, respond }) => {
  await ack();
  await respond(`•  Start the interaction by writing a message in a channel where Botitude is a member, tagging one or more users of your workspace \n
  •  Botitude will start a thread, where it will prompt you to confirm that you really want to issue a Kudos VC \n
  •  Remember that the message that you wrote will be shown in the VC \n
  •  After submitting, an email will be sent to the holder of the VC with a link to an online wallet where they can see, store and share their VC \n
  •  Botitude only responds to first messages in a channel, and not in a thread`);
});

/**
 *listens to submit button
 */
eventListener.action('VC_submit', async ({ ack, client, body, respond }) => {
  const slack = new SlackService(client.token)
  await ack()
  const kudosVCSubmitFlow = new KudosVCSubmitFlow(slack, client, body, respond)
  await kudosVCSubmitFlow.execute('VC_submit')
})

/**
 *listens to Cancel VC button
 */
eventListener.action('VC_cancel', async ({ ack, client, body, respond }) => {
  const slack = new SlackService(client.token)
  await ack()
  const kudosVCSubmitFlow = new KudosVCSubmitFlow(slack, client, body, respond)
  await kudosVCSubmitFlow.deleteAllBotMessages()
})

/**
 *listens to Yes MaxUSersVC button
 */
eventListener.action('yes_maxUsersVC', async ({ ack, client, body, respond }) => {
  const slack = new SlackService(client.token)
  await ack()
  const kudosVCSubmitFlow = new KudosVCSubmitFlow(slack, client, body, respond)
  await kudosVCSubmitFlow.execute('yes_maxUsersVC')
})

/**
 *listens to No MaxUsersVC button
 */
eventListener.action('no_VC', async ({ ack, respond }) => {
  await ack()
  await respond('Thank you & goodbye')
})

module.exports.oauthHandler = serverlessExpress({
  app: expressReceiver.app
});

module.exports.handler = serverlessExpress({
  app: expressReceiver.app
});

module.exports.issueVC = async (event: any) => {
  if (event.Records[0]) {
    const { email, finalVCText, issuer, token, holderName } = JSON.parse(event.Records[0].Sns.Message)
    const issueKudosVCFlow = new IssueKudosVCFlow(email, finalVCText, issuer, token, holderName)
    await issueKudosVCFlow.execute()
    return 'Done'
  }
}