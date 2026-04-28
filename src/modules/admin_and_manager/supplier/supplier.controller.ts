import { multerConfig } from '@/configs/multer.config';
import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import { deleteFile } from '@/utils/file.util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateSupplierDto,
  GetAllSupplierDto,
  UpdateSupplierDto,
} from './supplier.dto';
import { SupplierService } from './supplier.service';

@ApiTags('Supplier')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.SUPER_ADMIN)
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('/create')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateSupplierDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (file) {
        payload.profile = file.filename;
      }
      return await this.supplierService.createSupplier(payload);
    } catch (error) {
      void deleteFile(file?.filename);
      throw error;
    }
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllSupplierDto) {
    return this.supplierService.getAllSuppliers(payload);
  }

  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.getSingleSupplier(id);
  }

  @Put('/update/:id')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateSupplierDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (file) {
        payload.profile = file.filename;
      }
      return await this.supplierService.updateSupplier(id, payload);
    } catch (error) {
      void deleteFile(file?.filename);
      throw error;
    }
  }

  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.deleteSupplier(id);
  }
}
