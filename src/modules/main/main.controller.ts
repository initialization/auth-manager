import { Controller, Get, Post, Body, Patch, Param, Delete, Request, HttpCode } from '@nestjs/common';
import { MainService } from './main.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/index.dto';
import { ConfigService } from '@nestjs/config';
import { ResultData } from 'src/common/utils/result';
import { GenerateUUID } from 'src/common/utils';
import { createMath } from 'src/common/utils/captcha';
import { Public } from '../system/user/user.decorator';

@ApiTags('公共路由')
@Controller('/')
export class MainController {
  constructor(
    private readonly mainService: MainService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({
    summary: '用户登录',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @Public()
  @Post('/login')
  @HttpCode(200)
  login(@Body() user: LoginDto, @Request() req) {
    return this.mainService.login(user);
  }

  @ApiOperation({
    summary: '获取验证图片',
  })
  @Public()
  @Get('/captchaImage')
  async captchaImage() {
    const data = {
      img: '',
      uuid: '',
    };
    try {
      const captchaInfo = createMath();
      data.img = captchaInfo.data;
      data.uuid = GenerateUUID();
      return ResultData.ok(data, '操作成功');
    } catch (err) {
      return ResultData.fail(500, '生成验证码错误，请重试');
    }
  }
}
