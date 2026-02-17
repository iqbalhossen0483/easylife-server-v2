import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Designation {
  SALES_MAN = 'Sales Man',
  ADMIN = 'Admin',
  STORE_MANAGER = 'Store Manager',
}

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

  @Column({ type: 'varchar', length: 100 })
  profile: string;

  @Column()
  delivered_order: number;

  @Column()
  total_sale: number;

  @Column()
  due_sale: number;

  @Column()
  due_collection: number;

  @Column()
  get_salary: number;

  @Column()
  incentive: number;

  @Column()
  haveMoney: number;

  @Column()
  debt: number;

  @Column({ type: 'varchar', length: 50 })
  pushToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
