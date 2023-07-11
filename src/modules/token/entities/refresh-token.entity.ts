import { Entity, BaseEntity, Column } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshTokenEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, primary: true })
  id: string;

  @Column()
  accessTokenId: string;

  @Column({ type: 'smallint', default: 0 })
  revoked: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
