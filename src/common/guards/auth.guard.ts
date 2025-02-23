import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { RedisService } from "src/modules/common/redis/redis.service";
import { CacheEnum } from "../enum";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly reflector: Reflector,
		private readonly redisService: RedisService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {

		// 不受权限路由直接通行
		const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
			context.getHandler(),
			context.getClass()
		]);

		if(isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if(!token) {
			throw new UnauthorizedException('token验证失败');
		}

		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: this.configService.get('jwt.secretkey')
				}
			);

			const user = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${payload.uuid}`);

			if(!user) {
				throw new UnauthorizedException('token过期,请重新登陆!');
			}
			request['user'] = user;
		} catch (error) {
			throw new UnauthorizedException('token过期,请重新登陆!');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [ type, token ] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}   

}