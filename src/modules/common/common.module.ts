import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisClientOptions, RedisModule } from "@songkeys/nestjs-redis";

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync(
      { 
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            closeClient: true,
            readyLog: true,
            errorLog: true,
            config: config.get<RedisClientOptions>('redis'),
          }
        },
      },
      true
    ),
  ],
})

export class CommonModule {}