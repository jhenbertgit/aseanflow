import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { FxService } from '../fx/fx.service';
import { SettlementService } from '../settlement/settlement.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TrackingCodePipe } from '../../common/pipes/tracking-code.pipe';

@ApiTags('Transfer')
@Controller('api')
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    private readonly fxService: FxService,
    private readonly settlementService: SettlementService,
  ) {}

  @Post('quote')
  @ApiOperation({ summary: 'Get FX quote' })
  @ApiResponse({ status: 201, description: 'Quote calculated' })
  async getQuote(@Body() dto: CreateQuoteDto) {
    return this.fxService.calculateQuote(
      dto.amount,
      dto.from,
      dto.to,
      dto.trackingCode,
    );
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created' })
  async createTransfer(@Body() dto: CreateTransferDto) {
    const result = await this.transferService.createTransfer(dto);

    // Look up the full transfer to get the internal ID for settlement
    const transfer = await this.transferService.getByTrackingCode(
      result.trackingCode,
    );

    // Run settlement synchronously in the API process
    await this.settlementService.orchestrate(transfer.id);

    return result;
  }

  @Get('transfers')
  @ApiOperation({ summary: 'List transfers for a user' })
  async listTransfers(@Query('userId') userId: string) {
    if (!userId) return [];
    return this.transferService.getTransfersByUser(userId);
  }

  @Get('transfer/:trackingCode')
  @ApiOperation({ summary: 'Track a transfer by code' })
  @ApiResponse({ status: 200, description: 'Transfer found' })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  async getTransfer(
    @Param('trackingCode', TrackingCodePipe) trackingCode: string,
  ) {
    const t = await this.transferService.getByTrackingCode(trackingCode);
    return {
      ...t,
      senderName: t.senderName,
      senderAccountNumber: t.senderAccountNumber,
    };
  }
}
