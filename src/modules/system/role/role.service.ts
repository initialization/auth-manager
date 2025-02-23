import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { In, Repository } from 'typeorm';
import { SysRoleEntity } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultData } from 'src/common/utils/result';
import { ListRoleDto } from './dto/role.dto';
import { SysRoleWithMenuEntity } from './entities/role-width-menu.entity';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly roleRep: Repository<SysRoleEntity>,
    @InjectRepository(SysRoleWithMenuEntity)
    private readonly roleWithMenuRep: Repository<SysRoleWithMenuEntity>,
    private readonly menuService: MenuService,
  ){}

  /**
   * 新建角色
   * @param createRoleDto 
   * @returns 
   */
  async create(createRoleDto: CreateRoleDto) {
    const res = await this.roleRep.save(createRoleDto);
    return ResultData.ok(res);
  }

  async findAll(listRoleDto: ListRoleDto) {
    const roleEntity = this.roleRep.createQueryBuilder('role');
    roleEntity.where('role.delFlag = :delFlag', { delFlag: '0' });

    if (listRoleDto.roleName) {
      roleEntity.andWhere(`role.roleName LIKE "%${listRoleDto.roleName}%"`);
    }

    if (listRoleDto.roleKey) {
      roleEntity.andWhere(`role.roleKey LIKE "%${listRoleDto.roleKey}%"`);
    }

    const [ list, total ] = await roleEntity.getManyAndCount();

    return ResultData.ok({
      list,
      total
    })
  }

  /**
   * 查询角色权限
   * @param roleIds 
   * @returns 
   */
  async getPermissionsByRoleIds(roleIds: number[]) {
    if (roleIds.includes(1)) return [{ perms: '*:*:*' }]; //当角色为超级管理员时，开放所有权限

    const list = await this.roleWithMenuRep.find({
      where: {
        roleId: In(roleIds),
      },
      select: ['menuId'],
    });

    const menuIds = list.map((item) => item.menuId);
    const permissions = await this.menuService.findMany({
      where: {
        delFlag: '0',
        status: '0',
        menuId: In(menuIds),
      }
    });

    return permissions;
  }

}
