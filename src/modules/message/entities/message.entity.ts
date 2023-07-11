/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  BaseEntity,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import * as moment from 'moment';
import { instanceToPlain, Exclude, Expose, Transform } from 'class-transformer';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity({ name: 'messages' })
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  receiver: string;

  @Column({ nullable: false })
  sender: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: true })
  smsc: string;

  @Column({ nullable: true })
  scts: string;

  @Column({ nullable: true })
  port: string;

  @Column({ default: false })
  isVisible: boolean;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.messages, {
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

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
