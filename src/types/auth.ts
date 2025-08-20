import { LabFeatureFlags } from './lab';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  accountType: 'personal' | 'institution' | 'supplier';
  featureFlags: LabFeatureFlags;
}
