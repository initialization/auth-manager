import { Injectable } from '@nestjs/common';
import { CreateDeptDto, ListDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SysDeptEntity } from './entities/dept.entity';
import { Repository } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { ListToTree } from 'src/common/utils';

@Injectable()
export class DeptService {
  constructor(
    @InjectRepository(SysDeptEntity)
    private readonly deptRepo: Repository<SysDeptEntity>
  ) {}

  /**
   * 新建部门
   * @param createDeptDto 
   * @returns 
   */
  async create(createDeptDto: CreateDeptDto) {
    if(createDeptDto.parentId) {
      const parentData = await this.deptRepo.findOne({
        where: {
          deptId: createDeptDto.parentId,
          delFlag: '0'
        },
        select: [ 'ancestors' ]
      });

      if(!parentData) {
        return ResultData.fail(500, '父级部门不存在!');
      }

      const ancestors = parentData.ancestors ? `${parentData.ancestors},${createDeptDto.parentId}` : `${createDeptDto.parentId}`;
      Object.assign(createDeptDto, { ancestors });
    }


    await this.deptRepo.save(createDeptDto);
    return ResultData.ok();
  }

  /**
   * 查询部门列表
   * @param listDeptDto 
   * @returns 
   */
  async findAll(listDeptDto: ListDeptDto) {
    const deptEntity = this.deptRepo.createQueryBuilder('dept');
    deptEntity.where('dept.delFlag = :delFlag', { delFlag: '0' });

    if(listDeptDto?.deptName) {
      deptEntity.andWhere(`dept.deptName LIKE "%${listDeptDto.deptName}%"`);
    }

    const [ list, total ] = await deptEntity.getManyAndCount();
    return ResultData.ok({
      list,
      total
    });
  }

  /**
   * 更新部门信息
   * @param deptId 部门ID
   * @param updateDeptDto 更新部门数据
   * @returns 
   */
  async update(deptId: number, updateDeptDto: UpdateDeptDto) {
    // 查询当前部门信息
    const deptInfo = await this.deptRepo.findOne({
      where: { deptId, delFlag: '0' }
    });

    if (!deptInfo) {
      return ResultData.fail(500, '部门不存在！');
    }

    // 如果更新了父级部门
    if (updateDeptDto.parentId && updateDeptDto.parentId !== deptInfo.parentId) {
      // 不能将部门的父级设置为自己或下级
      const childDepts = await this.deptRepo.find({
        where: { delFlag: '0' },
        select: ['deptId', 'ancestors']
      });
      
      const childIds = childDepts
        .filter(d => d.ancestors && d.ancestors.split(',').includes(deptId.toString()))
        .map(d => d.deptId);

      if (childIds.includes(updateDeptDto.parentId)) {
        return ResultData.fail(500, '不能将部门的父级设置为自己或下级！');
      }

      // 查询新的父级部门
      const parentDept = await this.deptRepo.findOne({
        where: { deptId: updateDeptDto.parentId, delFlag: '0' },
        select: ['ancestors']
      });

      if (!parentDept) {
        return ResultData.fail(500, '父级部门不存在！');
      }

      // 更新ancestors
      const newAncestors = parentDept.ancestors 
        ? `${parentDept.ancestors},${updateDeptDto.parentId}` 
        : `${updateDeptDto.parentId}`;
      
      // 更新所有下级部门的ancestors
      const oldAncestors = deptInfo.ancestors ? `${deptInfo.ancestors},${deptId}` : `${deptId}`;
      const newChildAncestors = newAncestors ? `${newAncestors},${deptId}` : `${deptId}`;

      const updates = childDepts
        .filter(d => d.ancestors && d.ancestors.startsWith(oldAncestors))
        .map(child => {
          const newChildAncestorStr = child.ancestors.replace(oldAncestors, newChildAncestors);
          return { deptId: child.deptId, ancestors: newChildAncestorStr };
        });

      // 批量更新所有下级部门的ancestors
      await this.deptRepo
        .createQueryBuilder()
        .update(SysDeptEntity)
        .set({ ancestors: () => 'CASE deptId ' + updates.map(update => `WHEN ${update.deptId} THEN '${update.ancestors}'`).join(' ') + ' END' })
        .whereInIds(updates.map(update => update.deptId))
        .execute();

      // updateDeptDto.ancestors = newAncestors;
    }

    // 更新部门信息
    await this.deptRepo.update(deptId, updateDeptDto);
    return ResultData.ok();
  }

  /**
   * 部门树
   * @returns 
   */
  async deptTree() {
    const res = await this.deptRepo.find({
      where: {
        delFlag: '0',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.deptId,
      (m) => m.deptName,
    );
    return tree;
  }
}
