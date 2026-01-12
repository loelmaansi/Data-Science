import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'CallSphere Logistics & Delivery Platform API';
  }
}

