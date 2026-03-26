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
import { multerConfig } from 'src/configs/multer.config';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import {
  CreateProductDto,
  GetAllProductDto,
  UpdateProductDto,
} from './product.dto';
import { ProductService } from './product.service';

@ApiTags('Product')
@UseGuards(AuthGaurd, RoleGaurd)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Role(Designation.STORE_MANAGER)
  @Post('/create')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
    return this.productService.createProduct(payload);
  }

  @Role(Designation.STORE_MANAGER)
  @Get('/all')
  async getAll(@Query() payload: GetAllProductDto) {
    return this.productService.getAllProducts(payload);
  }

  @Role(Designation.SUPER_ADMIN)
  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getSingleProduct(id);
  }

  @Role(Designation.SUPER_ADMIN)
  @Put('/update/:id')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
    return this.productService.updateProduct(id, payload);
  }

  @Role(Designation.SUPER_ADMIN)
  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
