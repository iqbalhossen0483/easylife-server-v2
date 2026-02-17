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

  @Column({ type: 'varchar', length: 11 })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  address: string;

  @Column({ type: 'varchar', length: 11 })
  alt_phone: string;

  @Column({ type: 'varchar', length: 40 })
  owner_name: string;
}
