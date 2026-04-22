import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Target } from './target.entity';
import { UserEntity } from './user.entity';

@Entity('pending_commissions')
export class PendingCommissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => Target, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_id' })
  target!: Target;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commission!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  achieved!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
