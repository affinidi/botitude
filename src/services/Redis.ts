import redis from 'redis'
import { promisify } from 'util'
import envConfig from '../config'

export const redisClient = redis.createClient({
  host: envConfig.redisHost,
  port: envConfig.redisPort,
  password: envConfig.redisPassword,
})

class RedisService {
  public redisClient: redis.RedisClient

  constructor() {
    this.redisClient = redisClient
  }

  async setValue(key: string, value: string): Promise<any> {
    const setAsync = promisify(this.redisClient.set).bind(this.redisClient)
    await setAsync(key, value)
    return JSON.parse(value)
  }

  async getValue(key: string): Promise<any> {
    const getAsync = promisify(this.redisClient.get).bind(this.redisClient)
    return JSON.parse(await getAsync(key))
  }

  async deleteValue(key: string): Promise<void> {
    const deleteAsync = promisify(this.redisClient.del).bind(this.redisClient)
    await deleteAsync(key)
  }
}

export default RedisService
