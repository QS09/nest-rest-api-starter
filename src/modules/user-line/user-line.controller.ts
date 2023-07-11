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
import { UserLineService } from './user-line.service';
import { CreateUserLineDto } from './dtos/create-user-line.dto';
import { CreateBulkUserLineDto } from './dtos/create-bulk-user-line.dto';
import { UpdateUserLineDto } from './dtos/update-user-line.dto';
import { AccessLevelEnum } from 'src/common/constants/security.constants';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';

@Controller({ path: 'user-lines' })
@ApiTags('UserLine')
export class UserLineController {
  constructor(private userLineService: UserLineService) {}

  /**
   * Get all user lines
   */
  @Get()
  @ApiOperation({ summary: 'Get all user lines' })
  @ApiPaginationQuery()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserLines(
    @AuthUser() authUser: UserEntity,
    @Query('level', new DefaultValuePipe(1), ParseIntPipe)
    level = AccessLevelEnum.USER,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit = 100,
  ) {
    const { items, meta } = await this.userLineService.getUserLines(
      authUser,
      level,
      {
        limit: limit > 100 ? 100 : limit,
        page,
        paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      },
    );

    return { data: { items: instanceToPlain(items), meta } };
  }

  /**
   * Get all lines with messages
   */
  @Get('/messages')
  @ApiOperation({ summary: 'Get all user lines with messages' })
  @ApiPaginationQuery()
  @ApiQuery({ name: 'level', required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserLinesWithMessages(
    @AuthUser() authUser: UserEntity,
    @Query('level', new DefaultValuePipe(1), ParseIntPipe)
    level = AccessLevelEnum.USER,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit = 100,
  ) {
    const { items, meta } = await this.userLineService.getUserLinesWithMessages(
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
   * Create user line
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create user line' })
  async createUserLine(@Body() createUserLineDto: CreateUserLineDto) {
    const userLine = await this.userLineService.create(createUserLineDto);
    return { data: userLine };
  }

  /**
   * Create bulk user lines
   */
  @Post('/bulk')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create bulk user lines' })
  async createBulkUserLine(
    @Body() createBulkUserLineDto: CreateBulkUserLineDto,
  ) {
    const userLines = await this.userLineService.createBulk(
      createBulkUserLineDto,
    );
    return { data: userLines };
  }

  /**
   * Get user line by id
   */
  @Get(':userLine')
  @ApiOperation({ summary: 'Get user line by id' })
  @ApiParam({ name: 'userLine', description: 'user line ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserLine(@Param('userLine', ParseUUIDPipe) userLineId: string) {
    const userLine = await this.userLineService.findById(userLineId);
    if (!userLine) {
      throw new NotFoundException('UserLine not found by given id');
    }
    return { data: userLine };
  }

  /**
   * Update user line
   */
  @Put(':userLine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user line' })
  async updateUserLine(
    @Param('userLine', ParseUUIDPipe) userLineId: string,
    @Body() updateUserLineDto: UpdateUserLineDto,
  ) {
    const userLine = await this.userLineService.update(
      userLineId,
      updateUserLineDto,
    );
    return { data: userLine };
  }

  /**
   * Delete user line
   */
  @Delete(':userLine')
  @ApiOperation({
    summary: 'Delete user line by id',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async deleteUserLine(@Param('userLine', ParseUUIDPipe) userLineId: string) {
    await this.userLineService.delete(userLineId);
    return { message: 'User line deleted successfully' };
  }
}
