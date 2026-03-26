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
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'targeted_amnt', type: 'int', default: 0 })
  targeted_amnt: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  start_date: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  end_date: Date;

  @Column({
    name: 'commission_percentage',
    type: 'decimal',
    default: 0,
    precision: 100,
    scale: 4,
  })
  commission_percentage: number;

  @Column({ name: 'commission_amount', type: 'decimal', default: 0 })
  commission_amount: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @Column({ name: 'achived_amnt', type: 'int', default: 0 })
  achived_amnt: number;

  @Column({ name: 'failed_amnt', type: 'int', default: 0 })
  failed_amnt: number;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
