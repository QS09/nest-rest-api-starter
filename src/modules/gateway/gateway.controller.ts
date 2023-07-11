import { Controller, Req, RawBodyRequest, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';

import { GatewayService } from './gateway.service';
import { GatewayQueryDto } from './dtos/gateway-query.dto';

@Controller({ path: 'gateway' })
@ApiTags('Gateway')
export class GatewayController {
  constructor(private service: GatewayService) {}

  @Post('message')
  @ApiOperation({ summary: 'Process messages from gateway' })
  @ApiConsumes('text/plain')
  @ApiBody({
    description: 'Request body from gateway text/plain',
  })
  async processMessage(
    @Query() query: GatewayQueryDto,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const { url, headers } = req;
    const body = req.body.toString();

    /**
     * TODO: Verify host name to make sure request is from real gateway
     */
    const res = await this.service.processMessage(body, query, headers);
    return { url, ...res };
  }
}
