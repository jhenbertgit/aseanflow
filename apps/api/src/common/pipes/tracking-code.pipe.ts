import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const TRACKING_CODE_RE = /^TXN[A-Z0-9]{3,12}$/;

@Injectable()
export class TrackingCodePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!TRACKING_CODE_RE.test(value)) {
      throw new BadRequestException(
        'Invalid tracking code format. Expected TXN followed by 3-12 alphanumeric characters.',
      );
    }
    return value;
  }
}
