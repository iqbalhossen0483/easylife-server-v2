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
  BALANCE_TRANSFER = 'balance_transfer',
  SALARY = 'salary',
  INCENTIVE = 'incentive',
  COMMISSION = 'commission',
  DEBT = 'debt',
  DEBT_PAYMENT = 'debt_payment',
}

@Entity('pending_balance_transfer')
export class PendingBalanceTransferEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user' })
  from_user!: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_user' })
  to_user!: UserEntity;

  @Column({
    type: 'enum',
    enum: TransferPurpose,
    default: TransferPurpose.BALANCE_TRANSFER,
  })
  purpose!: TransferPurpose;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'from_user' })
  from_user!: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'to_user' })
  to_user!: UserEntity;

  @Column({
    type: 'enum',
    enum: TransferPurpose,
    default: TransferPurpose.BALANCE_TRANSFER,
  })
  purpose!: TransferPurpose;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
