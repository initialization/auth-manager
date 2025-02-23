import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateMenuDto, ListDeptDto } from './dto/create-menu.dto';

@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '菜单创建' })
  @ApiBody({ type: CreateMenuDto, required: true })
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({
    summary: '菜单管理-列表',
  })
  @Post('/list')
  findAll(@Body() query: ListDeptDto) {
    return this.menuService.findAll(query);
  }

  @ApiOperation({
    summary: '菜单管理-树表',
  })
  @Post('/treeselect')
  treeSelect() {
    return this.menuService.treeSelect();
  }
}
