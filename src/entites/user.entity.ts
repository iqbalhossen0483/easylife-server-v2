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
import { UserCommissionTarget } from './UserCommissionTarget.entity';
import { NotesEntity } from './notes.entity';

export enum Designation {
  SALES_MAN = 'sales_man',
  ADMIN = 'admin',
  STORE_MANAGER = 'store_manager',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  address: string;

  // index
  @Index('IDX_USER_PHONE', { unique: true })
  @Column({ type: 'varchar', length: 11 })
  phone: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'enum', enum: Designation })
  designation: Designation;

  @Column({ type: 'varchar', length: 100, default: null })
  profile?: string;

  @Column({ default: 0 })
  deliveredOrder?: number;

  @Column({ default: 0 })
  totalSale: number;

  @Column({ default: 0 })
  dueSale: number;

  @Column({ default: 0 })
  dueCollection: number;

  @Column({ default: 0 })
  getSalary: number;

  @Column({ default: 0 })
  incentive: number;

  @Column({ default: 0 })
  haveMoney: number;

  @Column({ default: 0 })
  debt: number;

  @Column({ type: 'text', default: null })
  pushToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // relations
  @ManyToOne(() => UserEntity, (user) => user.createdUsers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'createdBy' })
  createdBy: UserEntity | null;

  @OneToMany(() => UserEntity, (user) => user.createdBy)
  createdUsers: UserEntity[];

  @OneToMany(() => UserCommissionTarget, (target) => target.user)
  targets: UserCommissionTarget[];

  @OneToMany(() => NotesEntity, (note) => note.user)
  notes: NotesEntity[];
}
