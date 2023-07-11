import {
  Entity,
  BaseEntity,
  Column,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import * as bcrypt from 'bcryptjs';
import { instanceToPlain, Exclude } from 'class-transformer';

import { UserLineEntity } from 'src/modules/user-line/entities/user-line.entity';
import { MessageEntity } from 'src/modules/message/entities/message.entity';

import { UserRoleEnum } from '../user.types';
import { UserStatusEnum } from '../user.types';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Exclude({ toPlainOnly: true })
  private _jti: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  nickName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  previousPassword?: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.PENDING,
  })
  status: UserStatusEnum;

  @Column({ default: false })
  isEmailVerified?: boolean;

  @Column({ default: false })
  isPhoneVerified?: boolean;

  @Column({ nullable: true })
  note: string;

  @Column('jsonb', { nullable: false, default: {} })
  meta: string;

  @OneToMany(() => UserLineEntity, (UserLineEntity) => UserLineEntity.user, {
    eager: true,
    cascade: true,
  })
  lines: UserLineEntity[];

  @OneToMany(() => MessageEntity, (MessageEntity) => MessageEntity.user, {
    eager: true,
    cascade: true,
  })
  messages: MessageEntity[];

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

  public get jti(): string {
    return this._jti;
  }

  public set jti(v: string) {
    this._jti = v;
  }

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
