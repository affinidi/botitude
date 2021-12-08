import { Block } from '../../../typings/SlackService'

export const issueVCSubmitButton: Block = {
  type: 'actions',
  elements: [
    {
      type: 'button',
      text: {
        type: 'plain_text',
        emoji: true,
        text: 'Submit',
      },
      style: 'primary',
      value: 'click_me_123',
      action_id: 'VC_submit',
    },
    {
      type: 'button',
      text: {
        type: 'plain_text',
        emoji: true,
        text: 'Cancel',
      },
      style: 'danger',
      value: 'click_me_123',
      action_id: 'VC_cancel',
    },
  ],
}

export const issueVCConfirmationButton: Block = {
  type: 'actions',
  elements: [
    {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Yes',
        emoji: true,
      },
      value: 'click_me_123',
      action_id: 'yes_VC',
    },
    {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'No',
        emoji: true,
      },
      value: 'click_me_123',
      action_id: 'no_VC',
    },
  ],
}

export const maxUsersVCConfirmationButton: Block = {
  type: 'actions',
  elements: [
    {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Yes',
        emoji: true,
      },
      value: 'click_me_123',
      action_id: 'yes_maxUsersVC',
    },
    {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'No',
        emoji: true,
      },
      value: 'click_me_123',
      action_id: 'no_VC',
    },
  ],
}
