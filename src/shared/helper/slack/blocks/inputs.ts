import { Block } from '../../../typings/SlackService'

export const emailInput: Block = {
  dispatch_action: true,
  type: 'input',
  element: {
    type: 'plain_text_input',
    action_id: 'VC_username',
  },
  label: {
    type: 'plain_text',
    text: "Please enter the person's email",
    emoji: true,
  },
}
