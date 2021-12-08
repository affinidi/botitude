import { Block } from '../../../typings/SlackService'

export const issueVCOpener: Block = {
  type: 'section',
  text: {
    type: 'plain_text',
    text: 'Would you like to issue a Kudos VC to a colleague?',
    emoji: true,
  },
}

export const maxUsersOpener: Block = {
  type: 'section',
  text: {
    type: 'plain_text',
    text: 'Would you like to issue Kudos VCs to all the colleagues you tagged?',
    emoji: true,
  },
}
