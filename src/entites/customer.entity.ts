import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'shop_name', type: 'varchar', length: 100 })
  shop_name!: string;

  @Column({ type: 'varchar', length: 150 })
  address!: string;

  @Index('IDX_CUSTOMER_PHONE')
  @Column({ type: 'varchar', length: 11 })
  phone!: string;

  @Column({ name: 'machine_type', type: 'varchar', length: 50, nullable: true })
  machine_type!: string;

  @Column({
    name: 'machine_model',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  machine_model!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profile!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  commission!: number;

  // Financial fields
  @Column({
    name: 'total_sale',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  total_sale!: number;

  @Column({
    name: 'due_sale',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  due_sale!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  due!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  collection!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({ name: 'last_order', type: 'timestamp', nullable: true })
  last_order!: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at!: Date;

  // Relations
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'added_by' })
  added_by!: UserEntity | null;
}
