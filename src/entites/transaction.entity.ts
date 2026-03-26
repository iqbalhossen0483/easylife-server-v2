import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum TransferPurpose {
  SALARY = 'salary',
  INCENTIVE = 'incentive',
  DEBT_PAYMENT = 'debt_payment',
  PURCHASE_PRODUCT = 'purchase_product',
  OTHER = 'other',
}

export enum TransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DECLINED = 'declined',
}

@Entity('pending_balance_transfer')
export class PendingBalanceTransferEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user' })
  from_user: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_user' })
  to_user: UserEntity;

  @Column({ type: 'enum', enum: TransferPurpose, default: TransferPurpose.OTHER })
  purpose: TransferPurpose;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'from_user' })
  from_user: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'to_user' })
  to_user: UserEntity;

  @Column({ type: 'enum', enum: TransferPurpose, default: TransferPurpose.OTHER })
  purpose: TransferPurpose;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
