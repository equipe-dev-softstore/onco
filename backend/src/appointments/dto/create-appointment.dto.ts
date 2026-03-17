import { IsUUID, IsISO8601, IsString, Matches, IsOptional, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  nome_paciente: string;

  @IsISO8601()
  data_atendimento: string;

  @IsString()
  tipo_tratamento: string;

  @IsString()
  status_comparecimento: string;

  @IsString()
  encaminhamento: string;

  @IsString()
  tipo_atendimento: string;

  @Matches(/^[A-Z]\d{2}(\.\d{1,2})?$/, { message: 'CID inválido. Ex: C50 ou C50.9' })
  cid: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}
