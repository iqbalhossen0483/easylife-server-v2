import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotesEntity } from './notes.entity';
import { Target } from './target.entity';

export enum Designation {
  SALES_MAN = 'sales_man',
  ADMIN = 'admin',
  STORE_MANAGER = 'store_manager',
  MANAGER = 'manager',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  @Index('IDX_USER_PHONE', { unique: true })
  @Column({ type: 'varchar', length: 11 })
  phone: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'enum', enum: Designation })
  designation: Designation;

  @Column({ type: 'varchar', length: 100, default: null })
  profile?: string;

  @Column({ name: 'delivered_order', default: 0 })
  delivered_order?: number;

  @Column({ name: 'total_sale', default: 0 })
  total_sale: number;

  @Column({ name: 'due_sale', default: 0 })
  due_sale: number;

  @Column({ name: 'due_collection', default: 0 })
  due_collection: number;

  @Column({ name: 'get_salary', default: 0 })
  get_salary: number;

  @Column({ default: 0 })
  incentive: number;

  @Column({ name: 'have_money', default: 0 })
  have_money: number;

  @Column({ default: 0 })
  debt: number;

  @Column({ name: 'push_token', type: 'text', default: null })
  push_token: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  // relations
  @ManyToOne(() => UserEntity, (user) => user.created_users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity | null;

  @OneToMany(() => UserEntity, (user) => user.created_by)
  created_users: UserEntity[];

  @OneToMany(() => Target, (target) => target.user)
  targets: Target[];

  @OneToMany(() => NotesEntity, (note) => note.user)
  notes: NotesEntity[];
}
