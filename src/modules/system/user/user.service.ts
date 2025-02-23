import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { LoginDto } from 'src/modules/main/dto/index.dto';
import { GenerateUUID, Uniq } from 'src/common/utils';
import { CacheEnum, DelFlagEnum, StatusEnum } from 'src/common/enum';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ResultData } from 'src/common/utils/result';
import { LOGIN_TOKEN_EXPIRESIN, SYS_USER_TYPE } from 'src/common/constant';
import { ListUserDto } from './dto/list-user.dto';
import { SysUserWithRoleEntity } from './entities/user-width-role.entity';
import { UserType } from './dto/user';
import { RedisService } from 'src/modules/common/redis/redis.service';
import { instanceToPlain } from 'class-transformer';
import { SysRoleEntity } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SysUserWithRoleEntity)
    private readonly userWithRoleRepo: Repository<SysUserWithRoleEntity>,
    @InjectRepository(SysRoleEntity)
    private readonly roleRepo: Repository<SysRoleEntity>,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 后台创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hashSync(
        createUserDto.password,
        salt,
      );
    }

    const res = await this.userRepo.save({
      ...createUserDto,
      userType: SYS_USER_TYPE.CUSTOM,
    });

    // 用户角色关联表
    if (createUserDto.roleIds?.length) {
      const userRoleData = createUserDto.roleIds.map((id) => {
        return {
          userId: res.userId,
          roleId: id,
        };
      });
      const userRoleEntity = this.userWithRoleRepo.createQueryBuilder();
      userRoleEntity.insert().values(userRoleData).execute();
    }

    return ResultData.ok();
  }

  async findAll(query: ListUserDto) {
    const userEntity = await this.userRepo.createQueryBuilder('user');
    userEntity.where('user.delFlag = :delFlag', { delFlag: '0' });

    if (query.userName) {
      userEntity.andWhere(`user.userName LIKE "%${query.userName}%"`);
    }

    if (query.status) {
      userEntity.andWhere('user.status = :status', { status: query.status });
    }

    const [list, total] = await userEntity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 登陆
   * @param loginDto
   * @returns
   */
  async login(loginDto: LoginDto) {
    const data = await this.userRepo.findOne({
      where: { userName: loginDto.username },
      select: ['userId', 'password'],
    });

    if (!data) {
      return ResultData.fail(500, '用户不存在');
    }

    const userInfoResult = await this.getUserInfo(data.userId);

    if (userInfoResult instanceof ResultData) {
      return userInfoResult;
    }
    const userData = userInfoResult;

    if ('delFlag' in userData && userData.delFlag === DelFlagEnum.DELETE) {
      return ResultData.fail(500, `您已被禁用，如需正常使用请联系管理员`);
    }
    if ('status' in userData && userData.status === StatusEnum.STOP) {
      return ResultData.fail(500, `您已被停用，如需正常使用请联系管理员`);
    }

    const uuid = GenerateUUID();
    const token = this.createToken({ uuid, userId: userData.userId });

    // 获取用户权限
    const permissions = await this.getUserPermissions(userData.userId);

    const userInfo = {
      userId: userData.userId,
      userName: userData.userName,
      token: uuid,
      roles: userData.roles,
      permissions,
    };
    await this.updateRedisToken(uuid, userInfo);

    return ResultData.ok({ token }, '登陆成功');
  }

  async updateRedisToken(token: string, metaData: Partial<UserType>) {
    const oldMetaData = await this.redisService.get(
      `${CacheEnum.LOGIN_TOKEN_KEY}${token}`,
    );
    let newMetaData = metaData;
    if (oldMetaData) {
      newMetaData = { ...oldMetaData, ...metaData };
    }

    await this.redisService.set(
      `${CacheEnum.LOGIN_TOKEN_KEY}${token}`,
      newMetaData,
      LOGIN_TOKEN_EXPIRESIN,
    );
  }

  /**
   * 获取某用户详情信息
   * @param userId
   * @returns
   */
  async getUserInfo(userId: number) {

    let [ user, userRoels ] =  await Promise.all([
      this.userRepo.findOne({
        where: { userId },
      }),
      this.userWithRoleRepo.find({
        where: { userId },
      }),
    ])

    if (!user) {
      return ResultData.fail(500, '用户不存在');
    }

    const roleIds = userRoels.map((item) => item.roleId);

    const roles = await this.roleRepo.find({
      where: { roleId: In(roleIds) },
      select: ['roleId', 'roleKey'],
    })

    user = instanceToPlain(user) as UserEntity;
    return {
      ...user,
      roles,
    };
  }

    /**
   * 获取权限列表
   * @param userId
   * @returns
   */
    async getUserPermissions(userId: number) {
      const roleIds = await this.getRoleIds([userId]);
      const list = await this.roleService.getPermissionsByRoleIds(roleIds);
      const permissions = Uniq((list || []).map((item) => item.perms)).filter((item) => {
        return item;
      });
      return permissions;
    }

  /**
   * 获取角色Id列表
   * @param userId
   * @returns
   */
  async getRoleIds(userIds: Array<number>) {
    const roleList = await this.userWithRoleRepo.find({
      where: {
        userId: In(userIds),
      },
      select: ['roleId'],
    });
    const roleIds = roleList.map((item) => item.roleId);
    return Uniq(roleIds);
  }

  /**
   * 从数据声明生成令牌
   *
   * @param payload 数据声明
   * @return 令牌
   */
  createToken(payload: { uuid: string; userId: number }): string {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }
}
