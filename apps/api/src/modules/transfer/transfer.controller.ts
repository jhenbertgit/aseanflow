import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { TransferService } from './transfer.service';
import { FxService } from '../fx/fx.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';

@ApiTags('Transfer')
@Controller('api')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    private readonly fxService: FxService,
    @Inject('SETTLEMENT_QUEUE') private readonly settlementQueue: Queue,
  ) {}

  @Post('quote')
  @ApiOperation({ summary: 'Get FX quote' })
  @ApiResponse({ status: 201, description: 'Quote calculated' })
  async getQuote(@Body() dto: CreateQuoteDto) {
    return this.fxService.calculateQuote(dto.amount, dto.from, dto.to);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created' })
  async createTransfer(@Body() dto: CreateTransferDto) {
    const transfer = await this.transferService.createTransfer(dto);

    await this.settlementQueue.add('settle', {
      transferId: transfer.trackingCode,
    });

    return transfer;
  }

  @Get('transfer/:trackingCode')
  @ApiOperation({ summary: 'Track a transfer by code' })
  @ApiResponse({ status: 200, description: 'Transfer found' })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  async getTransfer(@Param('trackingCode') trackingCode: string) {
    return this.transferService.getByTrackingCode(trackingCode);
  }
}
