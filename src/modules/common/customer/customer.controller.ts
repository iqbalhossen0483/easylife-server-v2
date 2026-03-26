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
import { AuthGaurd } from 'src/guards/AuthGaurd';
import {
  CreateCustomerDto,
  GetAllCustomerDto,
  UpdateCustomerDto,
} from './customer.dto';
import { CustomerService } from './customer.service';

@ApiTags('Customer')
@UseGuards(AuthGaurd)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('/create')
  @UseInterceptors(FileInterceptor('profile', multerConfig))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateCustomerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.profile = file.filename;
    }
    return this.customerService.createCustomer(payload);
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllCustomerDto) {
    return this.customerService.getAllCustomers(payload);
  }

  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getSingleCustomer(id);
  }

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

  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.softDeleteCustomer(id);
  }
}
