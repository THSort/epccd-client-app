import { Location } from '../../App.types';

export interface RegistrationScreenProps {
  onRegistrationComplete: () => void;
}

export interface RegistrationFormData {
  selectedLocation: Location | undefined;
  mobileNumber: string;
}

export enum RegistrationStep {
  Location = 1,
  MobileNumber = 2,
  Asthma = 3
} 