import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { HealthCheckResult } from '@nestjs/terminus';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { HomeService } from './home.service';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(
    private service: HomeService,
    private healthCheckService: HealthCheckService,
    private ormIndicator: TypeOrmHealthIndicator,
  ) {}

  @Get('info')
  appInfo() {
    return this.service.appInfo();
  }

  @Get('health')
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.ormIndicator.pingCheck('database', { timeout: 1500 }),
    ]);
  }
}
