import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { instanceToPlain } from 'class-transformer';
import { LineStatus } from '../line.types';
import { UserLineEntity } from 'src/modules/user-line/entities/user-line.entity';

@Entity({ name: 'lines' })
export class LineEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: LineStatus,
    default: LineStatus.PENDING,
  })
  status: LineStatus;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  note: string;

  @OneToOne(() => UserLineEntity, (userLine) => userLine.line, {
    nullable: true,
  })
  @JoinColumn({ name: 'userLineId' })
  userLine: UserLineEntity;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
