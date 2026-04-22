import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductType {
  RAW_MATERIAL = 'raw_material',
  MAIN_PRODUCT = 'main_product',
}

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'short_name', type: 'varchar', length: 50, nullable: true })
  short_name!: string;

  @Column({ type: 'varchar', length: 50, default: ProductType.MAIN_PRODUCT })
  type!: ProductType;

  @Column({ type: 'int', default: 0 })
  sl!: number;

  @Column({ type: 'text', nullable: true })
  image!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cost!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  init_stock!: number;

  // Inventory fields
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_stock!: number;

  @Column({ type: 'int', default: 0 })
  purchased!: number;

  @Column({ type: 'int', default: 0 })
  sold!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at!: Date;
}
