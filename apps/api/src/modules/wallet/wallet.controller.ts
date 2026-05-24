import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TrackingCodePipe } from '../../common/pipes/tracking-code.pipe';

@ApiTags('Wallet')
@Controller('api/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':trackingCode')
  @ApiOperation({ summary: 'Get wallet info by tracking code' })
  @ApiResponse({ status: 200, description: 'Wallet info' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWallet(
    @Param('trackingCode', TrackingCodePipe) trackingCode: string,
  ) {
    const wallet = await this.walletService.findByTrackingCode(trackingCode);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balance = await this.walletService.getBalance(wallet.address);

    return {
      address: wallet.address,
      balance,
      symbol: 'AFT',
    };
  }

  @Get(':trackingCode/history')
  @ApiOperation({ summary: 'Get reward mint history for wallet' })
  @ApiResponse({ status: 200, description: 'Mint history' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getHistory(
    @Param('trackingCode', TrackingCodePipe) trackingCode: string,
  ) {
    const wallet = await this.walletService.findByTrackingCode(trackingCode);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const rewards = await this.walletService.getRewardHistory(wallet.id);
    return { rewards };
  }
}
