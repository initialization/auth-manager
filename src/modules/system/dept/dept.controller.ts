import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { DeptService } from './dept.service';
import { CreateDeptDto, ListDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('部门管理')
@Controller('system/dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @ApiOperation({ summary: '部门创建' })
  @ApiBody({ type: CreateDeptDto, required: true })
  @Post()
  @HttpCode(200)
  create(@Body() createDeptDto: CreateDeptDto) {
    return this.deptService.create(createDeptDto)
  }

  @ApiOperation({
    summary: '部门管理-列表',
  })
  @Post('/list')
  findAll(@Body() listDeptDto: ListDeptDto) {
    return this.deptService.findAll(listDeptDto);
  }

  @ApiOperation({ summary: '部门树' })
  @Get('/tree')
  getDeptTree() {
    return this.deptService.deptTree();
  }
}
