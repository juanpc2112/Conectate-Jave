import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { SettingsService } from './settings.service.js';
import { NotificationSettingsDto } from './dto/notification-settings.dto.js';
import { PrivacySettingsDto } from './dto/privacy-settings.dto.js';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('users/me')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  @Get('notification-settings') getNotifications(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.settingsService.getNotifications(req.user.id);
  }
  @Put('notification-settings') updateNotifications(
    @Req() req: AuthenticatedRequest,
    @Body() dto: NotificationSettingsDto,
  ) {
    return this.settingsService.updateNotifications(req.user.id, dto);
  }
  @Get('privacy-settings') getPrivacy(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getPrivacy(req.user.id);
  }
  @Put('privacy-settings') updatePrivacy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: PrivacySettingsDto,
  ) {
    return this.settingsService.updatePrivacy(req.user.id, dto);
  }
}
