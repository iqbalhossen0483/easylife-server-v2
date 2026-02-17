import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Designation {
  SALES_MAN = 'Sales Man',
  ADMIN = 'Admin',
  STORE_MANAGER = 'Store Manager',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  @Column({ type: 'varchar', length: 11 })
  phone: string;

  @Column({ type: 'varchar', length: 20 })
  password: string;

  @Column({ type: 'enum', enum: Designation })
  designation: Designation;

  @Column({ type: 'varchar', length: 100, default: null })
  profile?: string;

  @Column({ default: 0 })
  delivered_order?: number;

  @Column({ default: 0 })
  total_sale: number;

  @Column({ default: 0 })
  due_sale: number;

  @Column({ default: 0 })
  due_collection: number;

  @Column({ default: 0 })
  get_salary: number;

  @Column({ default: 0 })
  incentive: number;

  @Column({ default: 0 })
  haveMoney: number;

  @Column({ default: 0 })
  debt: number;

  @Column({ type: 'varchar', length: 50, default: null })
  pushToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
