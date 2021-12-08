import { UsersInfoResponse } from '@slack/web-api'
import { Block } from '../../typings/SlackService'
import { Usergroup } from '@slack/web-api/dist/response/UsergroupsListResponse'
import { issueVCOpener, maxUsersOpener } from './blocks/openers'
import { issueVCSubmitButton, issueVCConfirmationButton, maxUsersVCConfirmationButton } from './blocks/buttons'
import { issueVCCheckBoxBlockGenerator } from './blocks/checkboxes'
import { emailInput } from './blocks/inputs'
import { invalidEmailFormatErrorMessage, invalidEmployeeEmailErrorMessage } from './blocks/errorMessages'
import { appHomeDivider, appHomeFooter, appHomeHeading, appHomePara } from './blocks/appHome'

export const issueVCBlockFactory = (usersInfos: UsersInfoResponse[], groupsInfo: Usergroup[] = []): Block[] => {
  return usersInfos.length > 0 || groupsInfo.length > 0
    ? [issueVCOpener, issueVCCheckBoxBlockGenerator(usersInfos, groupsInfo), issueVCSubmitButton]
    : [issueVCOpener, issueVCConfirmationButton]
}

export const emailBlockFactory = (isEmail: boolean, employee: string | null): Block[] => {
  if (isEmail) {
    if (employee) {
      return []
    }

    return [invalidEmployeeEmailErrorMessage, emailInput]
  }

  return [invalidEmailFormatErrorMessage, emailInput]
}

export const maxUsersBlockFactory = (): Block[] => {
  return [maxUsersOpener, maxUsersVCConfirmationButton]
}

export const appHomeBlockFactory = (userId: string): Block[] => {
  return [appHomeHeading(userId), appHomeDivider, appHomePara, appHomeDivider, appHomeFooter]
}
