import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SupplierEntity } from './supplier.entity';
import { UserEntity } from './user.entity';

@Entity('purchased')
export class PurchaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SupplierEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  payment: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  due: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchased_by' })
  purchased_by: UserEntity;

  @Column({ name: 'payment_info', type: 'text', nullable: true })
  payment_info: string;

  @Column({ type: 'simple-array', nullable: true })
  files: string[];

  @OneToMany(() => PurchaseProductEntity, (pp) => pp.purchase, { cascade: true })
  products: PurchaseProductEntity[];

  @OneToMany(() => PurchaseCollectionEntity, (pc) => pc.purchase)
  collections: PurchaseCollectionEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

@Entity('purchased_product')
export class PurchaseProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PurchaseEntity, (p) => p.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: PurchaseEntity;

  @Column({ name: 'product_id', type: 'int' })
  product_id: number;

  @Column({ name: 'product_name', type: 'varchar', length: 100 })
  product_name: string;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;
}

@Entity('purchased_collection')
export class PurchaseCollectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PurchaseEntity, (p) => p.collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: PurchaseEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
