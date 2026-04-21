import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('daily_cash_report')
export class DailyCashReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'int', default: 0 })
  opening!: number;

  @Column({ type: 'int', default: 0 })
  closing!: number;

  @Column({ type: 'int', default: 0 })
  total_sale!: number;

  @Column({ type: 'int', default: 0 })
  due_sale!: number;

  @Column({ type: 'int', default: 0 })
  collection!: number;

  @Column({ type: 'int', default: 0 })
  expense!: number;

  @Column({ type: 'int', default: 0 })
  purchase!: number;

  @Column({ type: 'int', default: 0 })
  market_due!: number;

  @Column({ type: 'int', default: 0 })
  cash_in!: number;

  @Column({ type: 'int', default: 0 })
  cash_out!: number;
}

@Entity('monthly_cash_report')
export class MonthlyCashReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  month!: number;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int', default: 0 })
  opening!: number;

  @Column({ type: 'int', default: 0 })
  closing!: number;

  @Column({ type: 'int', default: 0 })
  total_sale!: number;

  @Column({ type: 'int', default: 0 })
  due_sale!: number;

  @Column({ type: 'int', default: 0 })
  collection!: number;

  @Column({ type: 'int', default: 0 })
  expense!: number;

  @Column({ type: 'int', default: 0 })
  purchase!: number;

  @Column({ type: 'int', default: 0 })
  market_due!: number;

  @Column({ type: 'int', default: 0 })
  cash_in!: number;

  @Column({ type: 'int', default: 0 })
  cash_out!: number;
}

@Entity('yearly_cash_report')
export class YearlyCashReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int', default: 0 })
  opening!: number;

  @Column({ type: 'int', default: 0 })
  closing!: number;

  @Column({ type: 'int', default: 0 })
  total_sale!: number;

  @Column({ type: 'int', default: 0 })
  due_sale!: number;

  @Column({ type: 'int', default: 0 })
  collection!: number;

  @Column({ type: 'int', default: 0 })
  expense!: number;

  @Column({ type: 'int', default: 0 })
  purchase!: number;

  @Column({ type: 'int', default: 0 })
  market_due!: number;

  @Column({ type: 'int', default: 0 })
  cash_in!: number;

  @Column({ type: 'int', default: 0 })
  cash_out!: number;
}

@Entity('daily_stock_report')
export class DailyStockReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: Date;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sold!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remaining_stock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  previous_stock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchased!: number;
}

@Entity('monthly_stock_report')
export class MonthlyStockReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  month!: number;

  @Column({ type: 'int' })
  year!: number;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sold!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remaining_stock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  previous_stock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchased!: number;
}

@Entity('yearly_stock_report')
export class YearlyStockReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  year!: number;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sold!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remaining_stock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  previous_stock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchased!: number;
}
