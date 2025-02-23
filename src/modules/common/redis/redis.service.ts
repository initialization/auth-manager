import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis()
    private readonly client: Redis,
  ) {}

  /**
   * redis基本信息
   * @returns
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 返回对应 value
   * @param key
   */
  async get(key: string): Promise<any> {
    if (!key || key === '*') return null;
    const res = await this.client.get(key);
    return res ? JSON.parse(res) : null;
  }

  /* ----------------------------------- string 相关----------------------------------- */
  /**
   * 
   * @param key 
   * @param value 
   * @param ttl time to live
   * @returns 
   */
  async set(key: string, value: any, ttl?: number): Promise<any> {
    const data = JSON.stringify(value);
    if (ttl) {
      return await this.client.set(key, data, 'PX', ttl);
    }
    return await this.client.set(key, data);
  }
}
