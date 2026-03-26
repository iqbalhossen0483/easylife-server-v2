import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/currentUser';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import type { JWT_Payload } from 'src/types/common';
import { BalanceTransferDto } from './transaction.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction & Balance Transfer')
@UseGuards(AuthGaurd, RoleGaurd)
@Controller('user/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/transfer')
  async initiateTransfer(
    @Body() payload: BalanceTransferDto,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.transactionService.initiateTransfer(
      payload,
      user.sub,
      user.designation,
    );
  }

  @Post('/receive/:id')
  async acceptTransfer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.transactionService.acceptTransfer(id, user.sub);
  }

  @Delete('/decline/:id')
  async declineTransfer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.transactionService.declineTransfer(id, user.sub);
  }

  @Get('/pending')
  async getPendingTransfers(@CurrentUser() user: JWT_Payload) {
    return this.transactionService.getPendingTransfers(user.sub);
  }

  @Get('/history')
  async getTransactionHistory() {
    return this.transactionService.getTransactionHistory();
  }
}
