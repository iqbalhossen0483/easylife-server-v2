import { REDIS_CLIENT } from '@/configs/redis.config.module';
import { TenantConnectionManager } from '@/database/tenant-connection.manager';
import { DbListEntity } from '@/entites/dbList.entity';
import { PendingCommissionEntity } from '@/entites/pending_commission.entity';
import { DailyCashReportEntity } from '@/entites/report.entity';
import { CommissionStatus, Target } from '@/entites/target.entity';
import type { LoggerService } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class ScheduledTasksService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
    private readonly connectionManager: TenantConnectionManager,
  ) {}

  @Cron('0 18 * * *', { name: 'daily_tasks' })
  async handleDailyTasks() {
    const lockKey = 'daily_tasks_lock';
    const lockAcquired = await this.redis.set(lockKey, '1', 'EX', 300, 'NX');

    if (!lockAcquired) {
      this.logger.log('Daily tasks already running, skipping', 'CronJob');
      return;
    }

    this.logger.log('Starting daily tasks', 'CronJob');

    try {
      const tenants = await this.dbListRepo.find();

      for (const tenant of tenants) {
        try {
          await this.createDailyCashReport(tenant.db_name);
          await this.processExpiredTargets(tenant.db_name);
          this.logger.log(
            `Daily tasks completed for tenant: ${tenant.db_name}`,
            'CronJob',
          );
        } catch (err) {
          this.logger.error(
            `Daily task failed for tenant ${tenant.db_name}`,
            err instanceof Error ? err.stack : String(err),
            'CronJob',
          );
        }
      }

      this.logger.log('All daily tasks completed', 'CronJob');
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async createDailyCashReport(dbName: string) {
    const repo = await this.connectionManager.getRepository(
      dbName,
      DailyCashReportEntity,
    );

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const existing = await repo.findOne({
      where: { date: new Date(dateStr) },
    });
    if (existing) return;

    // Get yesterday's closing as today's opening
    const yesterday = today;
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

  private async processExpiredTargets(dbName: string) {
    const targetRepo = await this.connectionManager.getRepository(
      dbName,
      Target,
    );
    const pcRepo = await this.connectionManager.getRepository(
      dbName,
      PendingCommissionEntity,
    );

    // Find expired running targets
    const expiredTargets = await targetRepo.find({
      where: {
        status: CommissionStatus.RUNNING,
        end_date: LessThan(new Date()),
      },
      relations: { user: true },
    });

    for (const target of expiredTargets) {
      const achieved = Number(target.achived_amnt);
      const targeted = Number(target.targeted_amnt);

      // Mark as achieved or failed
      target.status =
        achieved >= targeted
          ? CommissionStatus.ACHIVED
          : CommissionStatus.FAILED;
      await targetRepo.save(target);

      // Create pending commission for achieved targets
      if (target.status === CommissionStatus.ACHIVED) {
        const alreadyExists = await pcRepo.findOne({
          where: { target: { id: target.id } },
        });
        if (alreadyExists) continue;

        const commission =
          (Math.min(targeted, achieved) *
            Number(target.commission_percentage)) /
          100;

        const pending = pcRepo.create({
          user: target.user,
          target,
          commission,
          achieved,
        });
        await pcRepo.save(pending);
      }
    }
  }
}
