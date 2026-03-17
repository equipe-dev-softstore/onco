import { Module } from '@nestjs/common';
import { FieldOptionsService } from './field-options.service';
import { FieldOptionsController } from './field-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FieldOptionsController],
  providers: [FieldOptionsService],
  exports: [FieldOptionsService],
})
export class FieldOptionsModule {}
