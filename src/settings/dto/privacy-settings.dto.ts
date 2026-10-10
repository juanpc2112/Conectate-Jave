export type PrivacyVisibility = 'everyone' | 'contacts' | 'nobody';
export class PrivacySettingsDto {
  lastSeen!: PrivacyVisibility;
  profilePhoto!: PrivacyVisibility;
  info!: PrivacyVisibility;
  whoCanAddToGroups!: 'everyone' | 'contacts';
  readReceipts!: boolean;
}
