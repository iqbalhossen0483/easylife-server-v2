import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { SupplierEntity } from './supplier.entity';
import { UserEntity } from './user.entity';

@Entity('purchased')
export class PurchaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  payment!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  due!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'purchased_by' })
  purchased_by!: UserEntity;

  @Column({ name: 'payment_info', type: 'text', nullable: true })
  payment_info!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  files!: string[] | null;

  @OneToMany(() => PurchaseProductEntity, (pp) => pp.purchase)
  products!: PurchaseProductEntity[];

  @OneToMany(() => PurchaseCollectionEntity, (pc) => pc.purchase)
  payments!: PurchaseCollectionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @CreateDateColumn({ name: 'deleted_at' })
  deleted_at!: Date;
}

@Entity('purchased_product')
export class PurchaseProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PurchaseEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_id' })
  purchase!: PurchaseEntity;

  @ManyToOne(() => ProductEntity, {
    eager: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ type: 'int', default: 0 })
  qty!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: number;
}

@Entity('purchased_collection')
export class PurchaseCollectionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PurchaseEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'purchase_id' })
  purchase!: PurchaseEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender!: UserEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  file!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
