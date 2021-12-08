import { Block } from '../../../typings/SlackService'

export const helpView: Block = {
  type: 'section',
  text: {
    type: 'mrkdwn',
    text:
      "Start the interaction by writing a message in a channel where Botitude is a member, tagging one or more users of your workspace. Then follow Botitude's prompts in the thread to issue a Kudos Verifiable Credential to a colleague.",
  },
}
