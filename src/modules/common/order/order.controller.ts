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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/currentUser';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import type { JWT_Payload } from 'src/types/common';
import {
  CollectPaymentDto,
  CreateOrderDto,
  GetAllOrderDto,
  UpdateOrderDto,
} from './order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@UseGuards(AuthGaurd, RoleGaurd)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Post('/create')
  async create(
    @Body() payload: CreateOrderDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.orderService.createOrder(payload, user.sub);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Get('/all')
  async getAll(@Query() payload: GetAllOrderDto) {
    return this.orderService.getAllOrders(payload);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getSingleOrder(id);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, payload);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Put('/deliver/:id')
  async deliver(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deliverOrder(id);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Put('/collect/:id')
  async collect(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: CollectPaymentDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.orderService.collectPayment(id, payload, user.sub);
  }

  @Role(Designation.ADMIN)
  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deleteOrder(id);
  }

  @Role(Designation.ADMIN, Designation.SALES_MAN)
  @Get('/my-collections')
  async myCollections(@CurrentUser() user: JWT_Payload) {
    return this.orderService.getMyCollections(user.sub);
  }
}
