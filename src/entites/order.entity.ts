import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { UserEntity } from './user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  UNDELIVERED = 'undelivered',
  DELIVERED = 'delivered',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop!: CustomerEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by!: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'delivered_by' })
  delivered_by!: UserEntity;

  @Column({
    name: 'total_sale',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  total_sale!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  payment!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  due!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.UNDELIVERED,
  })
  status!: OrderStatus;

  @OneToMany(() => OrderProductEntity, (op) => op.order, { cascade: true })
  products!: OrderProductEntity[];

  @OneToMany(() => CollectionEntity, (c) => c.order)
  collections!: CollectionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at!: Date;
}

@Entity('orders_products')
export class OrderProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrderEntity, (order) => order.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;

  @Column({ name: 'product_id', type: 'int' })
  product_id!: number;

  @Column({ name: 'product_name', type: 'varchar', length: 100 })
  product_name!: string;

  @Column({ type: 'int', default: 0 })
  qty!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ name: 'is_free', type: 'boolean', default: false })
  is_free!: boolean;
}

@Entity('collections')
export class CollectionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrderEntity, (order) => order.collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver!: UserEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
