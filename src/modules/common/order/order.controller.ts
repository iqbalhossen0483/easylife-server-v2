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
import { AuthGaurd } from 'src/guards/AuthGaurd';
import type { JWT_Payload } from 'src/types/common';
import {
  CollectPaymentDto,
  CreateOrderDto,
  GetAllOrderDto,
  UpdateOrderDto,
} from './order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@UseGuards(AuthGaurd)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create')
  async create(
    @Body() payload: CreateOrderDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.orderService.createOrder(payload, user.sub);
  }

  @Get('/all')
  async getAll(@Query() payload: GetAllOrderDto) {
    return this.orderService.getAllOrders(payload);
  }

  @Get('/single/:id')
  async getSingle(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getSingleOrder(id);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, payload);
  }

  @Put('/deliver/:id')
  async deliver(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deliverOrder(id);
  }

  @Put('/collect/:id')
  async collect(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: CollectPaymentDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.orderService.collectPayment(id, payload, user.sub);
  }

  @Delete('/delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deleteOrder(id);
  }
}
