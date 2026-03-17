import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateFieldOptionDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateFieldOptionDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
