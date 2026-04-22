import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('suppliers')
export class SupplierEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 11 })
  phone!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profile!: string;

  // Financial fields
  @Column({
    name: 'total_purchased',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  total_purchased!: number;

  @Column({
    name: 'give_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  give_amount!: number;

  @Column({
    name: 'due_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  due_amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at!: Date;
}
