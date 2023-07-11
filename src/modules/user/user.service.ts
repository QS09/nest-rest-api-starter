import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginateRawAndEntities,
} from 'nestjs-typeorm-paginate';

import { UserEntity } from './entities/user.entity';
import { UserRoleEnum } from './user.types';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Get all users
   */
  async getUsers(options: IPaginationOptions) {
    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.lines', 'lines')
      .where('user.deleted=:deleted', { deleted: false })
      .orderBy('user.id', 'DESC');

    const [pagination] = await paginateRawAndEntities(queryBuilder, options);
    const totalItems = await queryBuilder.getCount();
    pagination.meta.totalItems = totalItems;
    return pagination;
  }

  /**
   * Get admins
   */
  async getAdmins() {
    return await this.userRepo.findBy({ role: UserRoleEnum.ADMIN });
  }

  /**
   * Get by id
   */
  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    return user;
  }

  /**
   * Get by email
   */
  async findByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }

  /**
   * Get by nick name
   */
  async findByNickName(nickName: string) {
    const user = await this.userRepo.findOne({ where: { nickName } });
    return user;
  }

  /**
   * Register user
   */
  async register(data: DeepPartial<UserEntity>) {
    const newUser = await this.userRepo.save(
      // save user repo to execute decorator hooks
      this.userRepo.create({
        ...data,
      }),
    );

    const user = await this.findById(newUser.id);
    return user;
  }

  /**
   * Update user
   */
  async update(userId: string, updateUserDto: UpdateUserDto) {
    await this.userRepo.update(
      { id: userId },
      this.userRepo.create({
        ...updateUserDto,
      }),
    );
    const updatedUser = await this.findById(userId);
    return updatedUser;
  }

  /**
   * Delete user
   */
  async delete(userId: string) {
    await this.userRepo.update({ id: userId }, { deleted: true });
  }
}
