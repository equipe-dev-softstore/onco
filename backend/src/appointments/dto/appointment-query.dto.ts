import { IsOptional, IsInt, Min, Max, IsDateString, IsUUID, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentQueryDto {
  @IsOptional()
  @IsString()
  nome_paciente?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  tipo_tratamento?: string;

  @IsOptional()
  @IsString()
  status_comparecimento?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
