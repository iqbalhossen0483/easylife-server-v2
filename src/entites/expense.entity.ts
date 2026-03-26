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

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('expense_type')
export class ExpenseCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 200, default: null })
  description?: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'updated_by' })
  updated_by: UserEntity;

  @Column({ name: 'prev_name', type: 'varchar', length: 50, default: null })
  prev_name: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}

@Entity('expense_info')
export class ExpenseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpenseCategoryEntity, (type) => type.id)
  @JoinColumn({ name: 'type_id' })
  type: ExpenseCategoryEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approved_by: UserEntity;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approved_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
