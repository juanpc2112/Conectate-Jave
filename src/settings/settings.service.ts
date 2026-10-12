import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationSettingsDto } from './dto/notification-settings.dto.js';
import { PrivacySettingsDto } from './dto/privacy-settings.dto.js';
import { serverResponse } from '../server-response.js';

@Injectable()
export class SettingsService {
  private readonly notificationSettings = new Map<
    string,
    NotificationSettingsDto
  >();
  private readonly privacySettings = new Map<string, PrivacySettingsDto>();
  getNotifications(userId: string) {
    return serverResponse((
      this.notificationSettings.get(userId) ?? {
        messages: true,
        groups: true,
        sharedNotes: true,
        sound: false,
        messagePreview: true,
        vibration: false,
      }
    ), 'Preferencias de notificación encontradas exitosamente');
  }
  updateNotifications(userId: string, dto: NotificationSettingsDto) {
    const keys: (keyof NotificationSettingsDto)[] = [
      'messages',
      'groups',
      'sharedNotes',
      'sound',
      'messagePreview',
      'vibration',
    ];
    if (!dto || keys.some((key) => typeof dto[key] !== 'boolean'))
      throw new BadRequestException(
        'Se requieren las seis preferencias booleanas de notificación',
      );
    const settings = Object.fromEntries(
      keys.map((key) => [key, dto[key]]),
    ) as unknown as NotificationSettingsDto;
    this.notificationSettings.set(userId, settings);
    return serverResponse(settings, 'Preferencias de notificación actualizadas exitosamente');
  }
  getPrivacy(userId: string) {
    return serverResponse((
      this.privacySettings.get(userId) ?? {
        lastSeen: 'everyone',
        profilePhoto: 'contacts',
        info: 'everyone',
        whoCanAddToGroups: 'contacts',
        readReceipts: true,
      }
    ), 'Preferencias de privacidad encontradas exitosamente');
  }
  updatePrivacy(userId: string, dto: PrivacySettingsDto) {
    const visibility = ['everyone', 'contacts', 'nobody'];
    if (
      !dto ||
      !visibility.includes(dto.lastSeen) ||
      !visibility.includes(dto.profilePhoto) ||
      !visibility.includes(dto.info) ||
      !['everyone', 'contacts'].includes(dto.whoCanAddToGroups) ||
      typeof dto.readReceipts !== 'boolean'
    )
      throw new BadRequestException('Preferencias de privacidad inválidas');
    this.privacySettings.set(userId, dto);
    return serverResponse(dto, 'Preferencias de privacidad actualizadas exitosamente');
  }
}
