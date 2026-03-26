import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/configs/redis.config.module';
import { DbListEntity } from 'src/entites/dbList.entity';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DailyCashReportEntity } from 'src/entites/report.entity';
import { CommissionStatus } from 'src/entites/target.entity';

@Injectable()
export class ScheduledTasksService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
    private readonly configService: ConfigService,
  ) {}

  // Run daily at midnight Asia/Dhaka (UTC+6 = 18:00 UTC previous day)
  @Cron('0 18 * * *', { name: 'daily_tasks' })
  async handleDailyTasks() {
    const lockKey = 'daily_tasks_lock';
    const lockAcquired = await this.redis.set(lockKey, '1', 'EX', 300, 'NX');

    if (!lockAcquired) {
      return; // Another instance is running
    }

    try {
      const tenants = await this.dbListRepo.find();

      for (const tenant of tenants) {
        try {
          const ds = new DataSource({
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USERNAME'),
            password: this.configService.get<string>('DB_PASS'),
            database: tenant.name,
            entities: [DailyCashReportEntity],
            synchronize: false,
          });

          await ds.initialize();

          await this.createDailyCashReport(ds);
          await this.processExpiredTargets(ds);

          await ds.destroy();
        } catch (err) {
          console.error(`Daily task failed for tenant ${tenant.name}:`, err);
        }
      }
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async createDailyCashReport(ds: DataSource) {
    const repo = ds.getRepository(DailyCashReportEntity);
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const existing = await repo.findOne({ where: { date: new Date(dateStr) } });
    if (existing) return;

    // Get yesterday's closing as today's opening
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayReport = await repo.findOne({
      where: { date: new Date(yesterdayStr) },
    });

    const opening = yesterdayReport ? Number(yesterdayReport.closing) : 0;

    const report = repo.create({
      date: new Date(dateStr),
      opening,
      closing: opening,
    });

    await repo.save(report);
  }

  private async processExpiredTargets(ds: DataSource) {
    // Using raw query since Target entity imports are complex for standalone DataSource
    const result = await ds.query(
      `UPDATE user_commision_target
       SET status = CASE
         WHEN achived_amnt >= targeted_amnt THEN 'achived'
         ELSE 'failed'
       END
       WHERE status = 'running'
         AND end_date < NOW()`,
    );

    // Create pending commissions for achieved targets
    const achieved = await ds.query(
      `SELECT id, user_id, targeted_amnt, achived_amnt, commission_percentage
       FROM user_commision_target
       WHERE status = 'achived'
         AND id NOT IN (SELECT target_id FROM pending_commissions)
         AND end_date < NOW()
         AND deleted_at IS NULL`,
    );

    for (const target of achieved) {
      const commission =
        Math.min(Number(target.targeted_amnt), Number(target.achived_amnt)) *
        Number(target.commission_percentage) / 100;

      await ds.query(
        `INSERT INTO pending_commissions (user_id, target_id, commission, achieved, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [target.user_id, target.id, commission, target.achived_amnt],
      );
    }
  }
}
