import { Block } from '../../../typings/SlackService'

export const appHomeHeading = (userId: string): Block => {
  const block: Block = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Welcome to Botitude's home page, <@${userId}> !*\nWith Botitude, you can now issue Kudos Verifiable Credentials to users of your Slack workspace. Kudos VCs are a tangible way to show appreciation for your colleagues, who will be able to share their VCs online. Kudos VCs show the issue date and sender's name, and can be personalised with a message.`,
    },
  }

  return block
}

export const appHomePara: Block = {
  type: 'section',
  text: {
    type: 'mrkdwn',
    text:
      '*How to make the most of Botitude:*\n\n•  Start the interaction by writing a message in a channel where Botitude is a member, tagging one or more users of your workspace\n•  Botitude will start a thread, where it will prompt you to confirm that you really want to issue a Kudos VC\n•  Remember that the message that you wrote will be shown in the VC \n•  After submitting, an email will be sent to the holder of the VC with a link to an online wallet where they can see, store and share their VC\n•  Botitude only responds to first messages in a channel, and not in a thread',
  },
}

export const appHomeDivider: Block = {
  type: 'divider',
}

export const appHomeFooter: Block = {
  type: 'section',
  text: {
    type: 'mrkdwn',
    text:
      "*About Verifiable Credentials and Affinidi*\n Botitude uses Affinidi's open source APIs to issue VCs.\n\n https://academy.affinidi.com/what-are-verifiable-credentials-79f1846a7b9 ",
  },
}
