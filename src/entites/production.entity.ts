import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('production')
export class ProductionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  product_id!: number;

  @Column({ name: 'product_name', type: 'varchar', length: 100 })
  product_name!: string;

  @Column({ type: 'int', default: 0 })
  production!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'production_by' })
  production_by!: UserEntity;

  @OneToMany(() => ProductionProductEntity, (pp) => pp.production_record, {
    cascade: true,
  })
  components!: ProductionProductEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}

@Entity('production_product')
export class ProductionProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProductionEntity, (p) => p.components, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'production_id' })
  production_record!: ProductionEntity;

  @Column({ name: 'product_id', type: 'int' })
  product_id!: number;

  @Column({ name: 'product_name', type: 'varchar', length: 100 })
  product_name!: string;

  @Column({ type: 'int', default: 0 })
  qty!: number;
}
