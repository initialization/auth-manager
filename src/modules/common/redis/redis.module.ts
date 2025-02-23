import { DynamicModule, Global, Module, Res } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisModuleAsyncOptions, RedisModule as realRedisModule } from "@songkeys/nestjs-redis";

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {
  static forRoot(options: RedisModuleAsyncOptions, isGlobal = true): DynamicModule {  
    return {
      module: RedisModule,
      imports: [realRedisModule.forRootAsync(options, isGlobal)],
      providers: [RedisService],
      exports: [RedisService]
    }
  }

  static forRootAsync(options: RedisModuleAsyncOptions, isGlobal = true): DynamicModule {
    return {
      module: RedisModule,
      imports: [realRedisModule.forRootAsync(options, isGlobal)],
      providers: [RedisService],
      exports: [RedisService]
    }
  }
}