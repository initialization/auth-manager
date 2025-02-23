import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { ListRoleDto } from './dto/role.dto';

@ApiTags('角色')
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: '角色管理-创建',
  })
  @ApiBody({
    type: CreateRoleDto,
    required: true,
  })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: '角色列表' })
  @ApiBody({ type: ListRoleDto })
  @Post('list')
  findAll(@Body() listRoleDto: ListRoleDto) {
    return this.roleService.findAll(listRoleDto);
  }
}
