import { Module } from '@nestjs/common';
import { UserSelfController } from './user_self.controller';
import { UserSelfService } from './user_self.service';

@Module({
  imports: [],
  controllers: [UserSelfController],
  providers: [UserSelfService],
})
export class UserSelfModule {}
