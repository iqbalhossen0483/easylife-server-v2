import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { UserEntity } from 'src/entites/user.entity';
import { NotificationService } from 'src/services/notification.service';
import { SendNotificationDto } from './notification.dto';
import { In, Not, IsNull } from 'typeorm';

@ApiTags('Notification')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly tenantDbService: TenantDatabaseService,
  ) {}

  @Post('/send')
  async send(@Body() payload: SendNotificationDto) {
    const userRepo = await this.tenantDbService.getRepository(UserEntity);

    let tokens: string[] = [];

    if (payload.user_ids && payload.user_ids.length > 0) {
      // Send to specific users
      const users = await userRepo.find({
        where: { id: In(payload.user_ids), push_token: Not(IsNull()) },
        select: { push_token: true },
      });
      tokens = users.map((u) => u.push_token).filter(Boolean);
    } else if (payload.target_roles && payload.target_roles.length > 0) {
      // Send to users by role
      const users = await userRepo.find({
        where: { designation: In(payload.target_roles), push_token: Not(IsNull()) },
        select: { push_token: true },
      });
      tokens = users.map((u) => u.push_token).filter(Boolean);
    } else {
      // Send to all users with tokens
      const users = await userRepo.find({
        where: { push_token: Not(IsNull()) },
        select: { push_token: true },
      });
      tokens = users.map((u) => u.push_token).filter(Boolean);
    }

    if (tokens.length === 0) {
      return {
        success: true,
        message: 'No users with push tokens found',
        data: { sent_to: 0 },
      };
    }

    await this.notificationService.sendNotification({
      tokens,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    });

    return {
      success: true,
      message: 'Notification sent successfully',
      data: { sent_to: tokens.length },
    };
  }
}
