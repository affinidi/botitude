import { Block } from '../../../typings/SlackService'

export const invalidEmailFormatErrorMessage: Block = {
  type: 'section',
  text: {
    type: 'plain_text',
    text: 'Please input email in a valid format',
    emoji: true,
  },
}

export const invalidEmployeeEmailErrorMessage: Block = {
  type: 'section',
  text: {
    type: 'plain_text',
    text: 'This email is not a valid employee email',
    emoji: true,
  },
}
