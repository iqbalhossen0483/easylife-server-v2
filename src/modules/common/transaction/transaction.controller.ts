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
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { BalanceTransferDto } from './transaction.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction & Balance Transfer')
@UseGuards(AuthGaurd)
@Controller('user/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/transfer')
  async initiateTransfer(@Body() payload: BalanceTransferDto) {
    return this.transactionService.initiateTransfer(payload);
  }

  @Post('/receive/:id')
  async acceptTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.acceptTransfer(id);
  }

  @Delete('/decline/:id')
  async declineTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.declineTransfer(id);
  }

  @Get('/pending')
  async getPendingTransfers() {
    return this.transactionService.getPendingTransfers();
  }

  @Get('/history')
  async getTransactionHistory() {
    return this.transactionService.getTransactionHistory();
  }
}
