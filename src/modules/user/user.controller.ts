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
  ConflictException,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

import { ApiPaginationQuery } from 'src/common/decorators/api-pagination-query.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserStatusEnum } from './user.types';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';

/**
 * TODO: Admin guard
 */
@Controller({
  path: 'users',
})
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}
  /**
   * Get all users
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiPaginationQuery()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const { items, meta } = await this.userService.getUsers({
      limit: limit > 100 ? 100 : limit,
      page,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    });

    return { data: { items: instanceToPlain(items), meta } };
  }

  /**
   * Get user
   */
  @Get(':user')
  @ApiOperation({ summary: 'Get user' })
  @ApiParam({ name: 'user', description: 'user ID' })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('user', ParseUUIDPipe) userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found by given id');
    }
    return { data: user };
  }

  /**
   * Invite user
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invite user' })
  async invite(@Body() createUserDto: CreateUserDto) {
    let existingUser: any;
    existingUser = await this.userService.findByEmail(createUserDto.email);

    if (!existingUser) {
      existingUser = await this.userService.findByNickName(
        createUserDto.nickName,
      );
    }

    if (existingUser) {
      throw new ConflictException('Email or nick name already exist');
    }

    const newUser = await this.userService.register({
      ...createUserDto,
      status: UserStatusEnum.PENDING,
    });
    return { data: newUser };
  }

  /**
   * Update user
   */
  @Put(':user')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('user', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const existingUser = await this.userService.findByNickName(
      updateUserDto.nickName,
    );

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Nick name already exist');
    }

    const user = await this.userService.update(userId, updateUserDto);
    return { data: user };
  }

  /**
   * Delete user
   */
  @Delete(':user')
  @ApiOperation({
    summary: 'Delete a user by id',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('user', ParseUUIDPipe) userId: string) {
    await this.userService.delete(userId);
    return { message: 'User deleted successfully' };
  }
}
