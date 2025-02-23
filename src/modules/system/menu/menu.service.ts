import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { SysMenuEntity } from './entities/menu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMenuDto, ListDeptDto } from './dto/create-menu.dto';
import { ResultData } from 'src/common/utils/result';
import { ListToTree } from 'src/common/utils';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(SysMenuEntity)
    private readonly sysMenuRep: Repository<SysMenuEntity>,
  ) {}

  /**
   * 新建菜单
   * @param createMenuDto
   * @returns
   */
  async create(createMenuDto: CreateMenuDto) {
    const res = await this.sysMenuRep.save(createMenuDto);
    return ResultData.ok(res);
  }

  /**
   * 菜单列表
   * @param query 
   * @returns 
   */
  async findAll(query: ListDeptDto) {
    const entity = this.sysMenuRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
    if (query.menuName) {
      entity.andWhere(`entity.menuName LIKE "%${query.menuName}%"`);
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    entity.orderBy('entity.orderNum', 'ASC');

    const [list, total] = await entity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 菜单树
   * @returns 
   */
  async treeSelect() {
    const res = await this.sysMenuRep.find({
      where: {
        delFlag: '0',
      },
      order: {
        orderNum: 'ASC',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    return ResultData.ok(tree);
  }

  /**
   * 查询角色权限
   * @param where 
   * @returns 
   */
  async findMany(where: FindManyOptions) {
    return await this.sysMenuRep.find(where);
  }
}
