import { multiFileMulterConfig } from '@/configs/multer.config';
import { CurrentUser } from '@/decorators/currentUser';
import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import type { JWT_Payload } from '@/types/common';
import { deleteFile } from '@/utils/file.util';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreatePurchaseDto,
  GetAllPurchaseDto,
  PaySupplierDto,
} from './purchase.dto';
import { PurchaseService } from './purchase.service';

@ApiTags('Purchase')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.SUPER_ADMIN)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('/create')
  @UseInterceptors(FilesInterceptor('files', 10, multiFileMulterConfig))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreatePurchaseDto,
    @CurrentUser() user: JWT_Payload,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      const fileNames = files?.map((f) => f.filename) ?? [];
      return await this.purchaseService.createPurchase(
        payload,
        fileNames,
        user.sub,
      );
    } catch (error) {
      if (files) files?.forEach((file) => void deleteFile(file.filename));
      throw error;
    }
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllPurchaseDto) {
    return this.purchaseService.getAllPurchases(payload);
  }

  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseService.getSinglePurchase(id);
  }

  @Put('/pay/:id')
  async paySupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: PaySupplierDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.purchaseService.paySupplier(id, payload, user.sub);
  }
}
