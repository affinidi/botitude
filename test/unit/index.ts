'use strict'

import { config } from 'dotenv'
config()

describe('OnboardingBot', () => {
  require('./services/ApiService.test')
  require('./helper/issueKudosVC.test')
})
