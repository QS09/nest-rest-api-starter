import {
  Entity,
  BaseEntity,
  Column,
  UpdateDateColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'access_tokens' })
export class AccessTokenEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, primary: true })
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  @Column({
    type: 'smallint',
    default: 0,
  })
  revoked: number;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
