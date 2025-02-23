import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/index.dto';
import { UserService } from '../system/user/user.service';

@Injectable()
export class MainService {
  constructor(
    private readonly userService: UserService
  ) {}
  /**
   * 登陆
   * @param user
   * @returns
   */
  async login(user: LoginDto ) {
    const loginRes = await this.userService.login(user);

    return loginRes;
  }
}
