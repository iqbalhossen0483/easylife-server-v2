import { Injectable } from '@nestjs/common';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

type NotificationParams = {
  tokens: string[];
  title: string;
  body: string;
  data: Record<string, unknown>;
};

@Injectable()
export class NotificationService {
  expo: Expo;
  constructor() {
    this.expo = new Expo();
  }

  async sendNotification({ tokens, title, body, data }: NotificationParams) {
    const messages: ExpoPushMessage[] = [];
    for (const pushToken of tokens) {
      const isValid = Expo.isExpoPushToken(pushToken);
      if (!isValid) {
        console.error(`This token is invalid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      await this.expo.sendPushNotificationsAsync(chunk);
    }
  }
}
