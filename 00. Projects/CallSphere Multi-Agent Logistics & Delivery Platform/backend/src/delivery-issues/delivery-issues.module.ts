import { Module } from '@nestjs/common';
import { DeliveryIssuesService } from './delivery-issues.service';
import { DeliveryIssuesController } from './delivery-issues.controller';

@Module({
  controllers: [DeliveryIssuesController],
  providers: [DeliveryIssuesService],
  exports: [DeliveryIssuesService],
})
export class DeliveryIssuesModule {}

