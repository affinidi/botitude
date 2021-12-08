import envConfig from '../../config'
import aws from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
const sns = new aws.SNS({ region: 'us-east-1' })

interface IData {
  email: string
  finalVCText: string
  issuer: string
  holderName: string
}

// SNS Functions
export const publishSnsIssueVC = async (data: IData): Promise<PromiseResult<aws.SNS.PublishResponse, aws.AWSError>> => {
  const params = {
    Message: JSON.stringify(data),
    TopicArn: envConfig.awsTopicArn,
  }
  return sns.publish(params).promise()
}
