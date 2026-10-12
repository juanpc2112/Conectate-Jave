import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { User, UserSchema } from './schemas/user.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
