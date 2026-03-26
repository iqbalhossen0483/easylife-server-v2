import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('db_list')
export class DbListEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'varchar', length: 15 })
  short_title: string;

  @Column({ type: 'int' })
  max_user: number;

  @Column({ type: 'bool' })
  production: boolean;

  @Column({ type: 'int' })
  primary_user: number;

  @Column({ type: 'int' })
  max_product: number;

  @Column({ type: 'int' })
  max_customer: number;

  @Column({ type: 'int', default: 0 })
  current_user: number;

  @Column({ type: 'int', default: 0 })
  current_product: number;

  @Column({ type: 'int', default: 0 })
  current_customer: number;

  @Column({ type: 'varchar', length: 11, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  alt_phone: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  owner_name: string;
}
