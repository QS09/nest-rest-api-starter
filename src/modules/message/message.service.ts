import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserRoleEnum } from '../user/user.types';
import { AccessLevelEnum } from 'src/common/constants/security.constants';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepo: Repository<MessageEntity>,
  ) {}

  /**
   * Get all messages
   */
  async getMessages(
    level: AccessLevelEnum,
    authUser: UserEntity,
    options: IPaginationOptions,
  ) {
    if (authUser.role === UserRoleEnum.USER && level > AccessLevelEnum.USER) {
      throw new ForbiddenException();
    }

    let queryBuilder: any;
    if (level === AccessLevelEnum.ADMIN) {
      queryBuilder = this.messageRepo
        .createQueryBuilder('messages')
        .orderBy('messages.updatedAt', 'DESC');
    } else {
      queryBuilder = this.messageRepo
        .createQueryBuilder('messages')
        .leftJoin('messages.user', 'user')
        .where('user.id=:userId', {
          userId: authUser.id,
        })
        .orderBy('messages.updatedAt', 'DESC');
    }

    const { items, meta } = await paginate<MessageEntity>(
      queryBuilder,
      options,
    );
    const plainItems = instanceToPlain(items).map((item: any) => ({
      ...item,
      message:
        item.isVisible || level === AccessLevelEnum.ADMIN
          ? item.message
          : item.message.replace(/[^\s]/g, 'x'),
    }));
    return { items: plainItems, meta };
  }

  /**
   * Get message by id
   */
  async findById(id: string) {
    const message = await this.messageRepo.findOne({
      where: { id },
    });
    return message;
  }

  /**
   * Create message
   */
  async create(createMessageDto: CreateMessageDto) {
    return await this.messageRepo.save(
      this.messageRepo.create({
        ...createMessageDto,
      }),
    );
  }

  /**
   * Update message
   */
  async update(
    level: AccessLevelEnum,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
  ) {
    await this.messageRepo.update(
      { id: messageId },
      this.messageRepo.create({
        ...updateMessageDto,
      }),
    );
    const updatedMessage = await this.findById(messageId);
    return {
      ...updatedMessage,
      message:
        updatedMessage.isVisible || level === AccessLevelEnum.ADMIN
          ? updatedMessage.message
          : updatedMessage.message.replace(/[^\s]/g, 'x'),
    };
  }

  /**
   * Delete message
   */
  async delete(messageId: string) {
    // TODO: delete message users, goodData accounts
    await this.messageRepo.delete(messageId);
  }
}
