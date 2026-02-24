import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  ACHIVED = 'achived',
  FAILED = 'failed',
}

@Entity('user_commision_target')
export class Target {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'int', default: 0 })
  targetedAmnt: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'decimal', default: 0, precision: 100, scale: 4 })
  commissionPercentage: number;

  @Column({ type: 'decimal', default: 0 })
  commissionAmount: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ type: 'int', default: 0 })
  achivedAmnt: number;

  @Column({ type: 'int', default: 0 })
  failedAmnt: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'createdBy' })
  createdBy: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
