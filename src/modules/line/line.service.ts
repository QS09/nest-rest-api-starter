import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { LineEntity } from './entities/line.entity';
import { CreateLineDto } from './dtos/create-line.dto';
import { UpdateLineDto } from './dtos/update-line.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserRoleEnum } from '../user/user.types';
import { instanceToPlain } from 'class-transformer';
import { ConflictException } from '@nestjs/common/exceptions';
import { ImportLineDto } from './dtos/import-line.dto';

@Injectable()
export class LineService {
  constructor(
    @InjectRepository(LineEntity)
    private lineRepo: Repository<LineEntity>,
  ) {}

  /**
   * Get all lines
   */
  async getLines(authUser: UserEntity, options: IPaginationOptions) {
    const queryBuilder = this.lineRepo
      .createQueryBuilder('lines')
      .where('lines.deleted=:deleted', { deleted: false })
      .orderBy('lines.updatedAt', 'DESC');

    const { items, meta } = await paginate<LineEntity>(queryBuilder, options);

    const plainItems = instanceToPlain(items).map((item: any) => ({
      ...item,
      phoneNumber:
        authUser.role === UserRoleEnum.ADMIN
          ? item.phoneNumber
          : '******' + item.phoneNumber.slice(6, 10),
    }));

    return { items: plainItems, meta };
  }

  /**
   * Get line by id
   */
  async findById(id: string) {
    const line = await this.lineRepo.findOne({
      where: { id },
      relations: { userLine: true },
    });
    return line;
  }

  /**
   * Get lines by id array
   */
  async findByIds(ids: string[]) {
    const lines = await this.lineRepo.find({
      where: { id: In(ids) },
      relations: { userLine: true },
    });
    return lines;
  }

  /**
   * Get line by phone number
   */
  async findByPhoneNumber(phoneNumber: string) {
    const line = await this.lineRepo.findOne({
      where: { phoneNumber },
      relations: ['userLine', 'userLine.user'],
    });
    return line;
  }

  /**
   * Create line
   */
  async create(createLineDto: CreateLineDto) {
    const existingLine = await this.lineRepo.findOne({
      where: { phoneNumber: createLineDto.phoneNumber },
    });

    if (!existingLine) {
      return await this.lineRepo.save(
        this.lineRepo.create({
          ...createLineDto,
        }),
      );
    } else {
      if (existingLine.deleted) {
        existingLine.deleted = false;
        existingLine.status = createLineDto.status;
        existingLine.note = createLineDto.note;
        await existingLine.save();
        return existingLine;
      } else {
        throw new ConflictException(
          'Existing line found with the same phone number',
        );
      }
    }
  }

  /**
   * Import lines in CSV file
   */
  async importLines(lines: CreateLineDto[]) {
    const newLines = await Promise.all(
      lines.map(async (createLineDto) => {
        try {
          return await this.lineRepo.save(
            this.lineRepo.create({
              ...createLineDto,
            }),
          );
        } catch (err) {
          return null;
        }
      }),
    );
    return newLines.filter((line) => line !== null);
  }

  /**
   * Update line
   */
  async update(lineId: string, updateLineDto: UpdateLineDto) {
    const line = await this.findById(lineId);
    return await this.lineRepo.save(
      this.lineRepo.create({
        ...line,
        ...updateLineDto,
      }),
    );
  }

  /**
   * Delete line
   */
  async delete(lineId: string) {
    await this.lineRepo.update({ id: lineId }, { deleted: true });
  }
}
