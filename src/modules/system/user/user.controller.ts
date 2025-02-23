import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { RequireRole } from 'src/common/decorators/require-role.decorator';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';

@Controller('system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: '用户-创建',
  })
  @ApiBody({
    type: CreateUserDto,
    required: true,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({
    summary: '用户-列表',
  })
  // @RequireRole('admin')
  @RequirePermission('system:user:list')
  @Post('list')
  findAll(@Query() query: ListUserDto) {
    return this.userService.findAll(query);
  }
}
