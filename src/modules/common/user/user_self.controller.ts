import { CurrentUser } from '@/decorators/currentUser';
import { AuthGaurd } from '@/guards/AuthGaurd';
import type { JWT_Payload } from '@/types/common';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserSelfService } from './user_self.service';

@ApiTags('User Self')
@UseGuards(AuthGaurd)
@Controller('user-self')
export class UserSelfController {
  constructor(private readonly userSelfService: UserSelfService) {}

  @Get('/recent-activity/:id')
  async recentActivity(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWT_Payload,
  ) {
    return this.userSelfService.getRecentActivity(id, user);
  }
}
