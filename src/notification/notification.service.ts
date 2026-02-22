import Expo from 'expo-server-sdk';

export class NotificationService {
  expo: Expo;
  constructor() {
    this.expo = new Expo();
  }
}
