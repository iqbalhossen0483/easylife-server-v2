import { multerConfig } from '@/configs/multer.config';
import { CurrentUser } from '@/decorators/currentUser';
import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import type { JWT_Payload } from '@/types/common';
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
  CreateCustomerDto,
  GetAllCustomerDto,
  UpdateCustomerDto,
} from './customer.dto';
import { CustomerService } from './customer.service';

@ApiTags('Customer')
@UseGuards(AuthGaurd, RoleGaurd)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Post('/create')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateCustomerDto,
    @CurrentUser() user: JWT_Payload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
    return this.customerService.createCustomer(payload, user.sub);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Get('/all')
  async getAll(@Query() payload: GetAllCustomerDto) {
    return this.customerService.getAllCustomers(payload);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getSingleCustomer(id);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Put('/update/:id')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateCustomerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
    return this.customerService.updateCustomer(id, payload);
  }

  @Role(Designation.ADMIN)
  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.softDeleteCustomer(id);
  }
}
