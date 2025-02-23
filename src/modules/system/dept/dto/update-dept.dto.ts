import { PartialType } from '@nestjs/mapped-types';
import { CreateDeptDto } from './create-dept.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateDeptDto extends PartialType(CreateDeptDto) {
  @ApiProperty({ required: true })
  @IsNumber()
  deptId: number;
}
