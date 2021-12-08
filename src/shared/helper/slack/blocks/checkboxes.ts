import { Block, Option } from '../../../typings/SlackService'
import { Usergroup } from '@slack/web-api/dist/response/UsergroupsListResponse'
import { UsersInfoResponse } from '@slack/web-api'

export const issueVCCheckBoxBlockGenerator = (usersInfos: UsersInfoResponse[], groupsInfo: Usergroup[] = []): Block => {
  const vcTargetCheckBox: Option[] = usersInfos.map((userInfo) => {
    return {
      text: {
        type: 'plain_text',
        text: userInfo.user.real_name,
        emoji: true,
      },
      value: userInfo.user.id,
    }
  })
  groupsInfo.map((groupInfo: any) => {
    vcTargetCheckBox.push({
      text: {
        type: 'plain_text',
        text: groupInfo.name,
        emoji: true,
      },
      value: groupInfo.id,
    })
  })
  return {
    type: 'input',
    element: {
      type: 'checkboxes',
      options: vcTargetCheckBox,
      action_id: 'VC_target',
    },
    label: {
      type: 'plain_text',
      text: 'Label',
      emoji: true,
    },
  }
}
