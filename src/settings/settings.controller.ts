import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { SettingsService } from './settings.service.js';
import { NotificationSettingsDto } from './dto/notification-settings.dto.js';
import { PrivacySettingsDto } from './dto/privacy-settings.dto.js';

interface AuthenticatedRequest {
  user: { id: number };
}

@Controller('users/me')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  @Get('notification-settings') getNotifications(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.settingsService.getNotifications(String(req.user.id));
  }
  @Put('notification-settings') updateNotifications(
    @Req() req: AuthenticatedRequest,
    @Body() dto: NotificationSettingsDto,
  ) {
    return this.settingsService.updateNotifications(String(req.user.id), dto);
  }
  @Get('privacy-settings') getPrivacy(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getPrivacy(String(req.user.id));
  }
  @Put('privacy-settings') updatePrivacy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PrivacySettingsDto,
  ) {
    return this.settingsService.updatePrivacy(String(req.user.id), dto);
  }
}
