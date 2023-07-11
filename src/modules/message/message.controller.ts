import {
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination-query.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorators';
import { UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

import { MessageService } from './message.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { AccessLevelEnum } from 'src/common/constants/security.constants';

@Controller({ path: 'messages' })
@ApiTags('Message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  /**
   * Get all messages
   */
  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  @ApiPaginationQuery()
  @ApiQuery({ name: 'level', required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAdminMessages(
    @AuthUser() authUser: UserEntity,
    @Query('level', new DefaultValuePipe(1), ParseIntPipe)
    level = AccessLevelEnum.USER,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit = 100,
  ) {
    const { items, meta } = await this.messageService.getMessages(
      level,
      authUser,
      {
        limit: limit > 100 ? 100 : limit,
        page,
      },
    );

    return { data: { items: instanceToPlain(items), meta } };
  }

  /**
   * Create message
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create message' })
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);
    return { data: message };
  }

  /**
   * Get a message
   */
  @Get(':message')
  @ApiOperation({ summary: 'Get message' })
  @ApiParam({ name: 'message', description: 'message ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMessage(@Param('message', ParseUUIDPipe) messageId: string) {
    const message = await this.messageService.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found by given id');
    }
    return { data: message };
  }

  /**
   * Update message
   */
  @Put(':message')
  @ApiBearerAuth()
  @ApiQuery({ name: 'level', required: false })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update message' })
  async updateMessage(
    @Query('level', new DefaultValuePipe(1), ParseIntPipe)
    level = AccessLevelEnum.USER,
    @Param('message', ParseUUIDPipe) messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const message = await this.messageService.update(
      level,
      messageId,
      updateMessageDto,
    );
    return { data: message };
  }

  /**
   * Delete message
   */
  @Delete(':message')
  @ApiOperation({
    summary: 'Delete a message by id',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async deleteMessage(@Param('message', ParseUUIDPipe) messageId: string) {
    await this.messageService.delete(messageId);
    return { message: 'Message deleted successfully' };
  }
}
