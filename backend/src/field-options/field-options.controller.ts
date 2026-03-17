import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FieldOptionsService } from './field-options.service';
import { CreateFieldOptionDto, UpdateFieldOptionDto } from './dto/field-option.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('field-options')
@UseGuards(JwtAuthGuard)
export class FieldOptionsController {
  constructor(private readonly fieldOptionsService: FieldOptionsService) {}

  @Post()
  create(@Body() createFieldOptionDto: CreateFieldOptionDto) {
    return this.fieldOptionsService.create(createFieldOptionDto);
  }

  @Get()
  findAll(@Query('category') category: string) {
    return this.fieldOptionsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldOptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFieldOptionDto: UpdateFieldOptionDto) {
    return this.fieldOptionsService.update(id, updateFieldOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldOptionsService.remove(id);
  }
}
