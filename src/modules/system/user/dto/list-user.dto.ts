import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsOptional, IsString, Length } from "class-validator";
import { PagingDto } from "src/common/dto";

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class ListUserDto extends PagingDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  nickName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  userName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phonenumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}