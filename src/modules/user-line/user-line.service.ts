import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  IPaginationOptions,
  paginateRawAndEntities,
} from 'nestjs-typeorm-paginate';
import { UserLineEntity } from './entities/user-line.entity';
import { CreateUserLineDto } from './dtos/create-user-line.dto';
import { CreateBulkUserLineDto } from './dtos/create-bulk-user-line.dto';
import { UpdateUserLineDto } from './dtos/update-user-line.dto';
import { UserRoleEnum } from '../user/user.types';
import { UserEntity } from '../user/entities/user.entity';

import { UserService } from '../user/user.service';
import { LineService } from '../line/line.service';
import { LineStatus } from '../line/line.types';
import { UserLineStatus } from './user-line.types';
import { instanceToPlain } from 'class-transformer';
import { AccessLevelEnum } from 'src/common/constants/security.constants';
import { ForbiddenException } from '@nestjs/common/exceptions';

@Injectable()
export class UserLineService {
  constructor(
    @InjectRepository(UserLineEntity)
    private userLineRepo: Repository<UserLineEntity>,
    private userService: UserService,
    private lineService: LineService,
  ) {}

  /**
   * Get all user lines
   */
  async getUserLines(
    authUser: UserEntity,
    level: AccessLevelEnum,
    options: IPaginationOptions,
  ) {
    if (authUser.role === UserRoleEnum.USER && level > AccessLevelEnum.USER) {
      throw new ForbiddenException();
    }

    let queryBuilder: any;
    if (level === AccessLevelEnum.ADMIN) {
      queryBuilder = this.userLineRepo
        .createQueryBuilder('user_lines')
        .leftJoinAndSelect('user_lines.line', 'line')
        .leftJoinAndSelect('user_lines.user', 'user')
        .where('user_lines.deleted = :deleted', { deleted: false })
        .orderBy('user_lines.updatedAt', 'DESC');
    } else {
      queryBuilder = this.userLineRepo
        .createQueryBuilder('user_lines')
        .leftJoin('user_lines.user', 'user')
        .leftJoin('user_lines.line', 'line')
        .select(['user_lines', 'line.id', 'line.phoneNumber', 'line.status'])
        .where('user.id=:userId', { userId: authUser.id })
        .andWhere('user_lines.deleted = :deleted', { deleted: false })
        .orderBy('user_lines.updatedAt', 'DESC');
    }

    const [pagination] = await paginateRawAndEntities(queryBuilder, options);
    const totalItems = await queryBuilder.getCount();
    pagination.meta.totalItems = totalItems;
    return pagination;
  }

  /**
   * Get all user lines with messages
   */
  async getUserLinesWithMessages(
    level: AccessLevelEnum,
    authUser: UserEntity,
    options: IPaginationOptions,
  ) {
    if (authUser.role === UserRoleEnum.USER && level > AccessLevelEnum.USER) {
      throw new ForbiddenException();
    }

    let queryBuilder: any;
    if (level === AccessLevelEnum.ADMIN) {
      queryBuilder = this.userLineRepo
        .createQueryBuilder('user_lines')
        .leftJoin('user_lines.line', 'line')
        .leftJoin('user_lines.user', 'user')
        .leftJoin('user.messages', 'messages')
        .select(['user_lines', 'line.phoneNumber', 'user', 'messages'])
        .orderBy('user_lines.updatedAt', 'DESC');
    } else {
      queryBuilder = this.userLineRepo
        .createQueryBuilder('user_lines')
        .leftJoin('user_lines.user', 'user')
        .leftJoin('user_lines.line', 'line')
        .leftJoin('user.messages', 'messages')
        .select(['user_lines', 'line.phoneNumber', 'user', 'messages'])
        .where('user_lines.userId=:userId', { userId: authUser.id })
        .orderBy('user_lines.updatedAt', 'DESC');
    }

    const { items, meta } = await paginate<UserLineEntity>(
      queryBuilder,
      options,
    );
    const plainItems = instanceToPlain(items).map((item: any) => ({
      phone_number: item.line.phoneNumber,
      label: item.label,
      status: item.status,
      assigned_at: item.updatedAt,
      messages: item.user.messages.map((msg: any) => {
        if (msg.isVisible) return msg;
        else return { ...msg, message: msg.message.replace(/[^\s]/g, 'x') };
      }),
    }));

    return { items: plainItems, meta };
  }

  /**
   * Get user line by id
   */
  async findById(id: string) {
    const line = await this.userLineRepo.findOne({
      where: { id },
      relations: ['line', 'user'],
    });
    return line;
  }

  /**
   * Create user line
   */
  async create(createUserLineDto: CreateUserLineDto) {
    const user = await this.userService.findById(createUserLineDto.userId);
    const line = await this.lineService.findById(createUserLineDto.lineId);

    const userLine = await this.userLineRepo.save(
      this.userLineRepo.create({
        ...createUserLineDto,
        user,
        line,
      }),
    );

    line.userLine = userLine;
    line.status = LineStatus.ALLOCATED;
    await line.save();

    return userLine;
  }

  /**
   * Create bulk user line
   */
  async createBulk(createBulkUserLineDto: CreateBulkUserLineDto) {
    const { lineIds, ...createUserLine } = createBulkUserLineDto;
    const user = await this.userService.findById(createBulkUserLineDto.userId);
    const lines = await this.lineService.findByIds(lineIds);

    const userLines = await Promise.all(
      lines.map(async (line) => {
        const userLine = await this.userLineRepo.save(
          this.userLineRepo.create({
            ...createUserLine,
            user,
            line,
          }),
        );

        line.userLine = userLine;
        line.status = LineStatus.ALLOCATED;
        await line.save();
        return userLine;
      }),
    );

    return userLines;
  }

  /**
   * Update user line
   */
  async update(id: string, updateUserLineDto: UpdateUserLineDto) {
    const userLine = await this.findById(id);
    userLine.label = updateUserLineDto.label ?? userLine.label;
    userLine.status = updateUserLineDto.status ?? userLine.status;
    userLine.note = updateUserLineDto.note ?? userLine.note;
    await userLine.save();

    return userLine;
  }

  /**
   * Delete user line
   */
  async delete(id: string) {
    const userLine = await this.findById(id);

    userLine.line.status = LineStatus.AVAILABLE;
    await userLine.line.save();

    await this.userLineRepo.update(
      { id },
      {
        deleted: true,
        status: UserLineStatus.RELEASED,
        line: null,
      },
    );
  }
}
