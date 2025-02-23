import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SysUserWithRoleEntity } from './entities/user-width-role.entity';
import { RedisService } from 'src/modules/common/redis/redis.service';
import { SysRoleEntity } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';
import { RoleModule } from '../role/role.module';
import { SysRoleWithMenuEntity } from '../role/entities/role-width-menu.entity';
import { MenuModule } from '../menu/menu.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SysUserWithRoleEntity, SysRoleEntity, SysRoleWithMenuEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get('jwt.secretkey'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') }
      })
    }),
    RoleModule,
    MenuModule
  ],
  controllers: [UserController],
  providers: [UserService, RedisService, RoleService],
  exports: [UserService]
})
export class UserModule {}
