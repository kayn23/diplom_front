import i18n from 'app/config/i18n';
import { FetchError } from 'ofetch';

const errorCodeTranslation = [401, 403, 404];

export const HttpErrorHandler = (e: FetchError, customMessage: Record<number, string> = {}): string => {
  if (e.statusCode) {
    if (customMessage[e.statusCode]) return i18n.t(customMessage[e.statusCode]);
    if (errorCodeTranslation.includes(e.statusCode)) {
      return i18n.t(`httpCodeMessage.${e.statusCode}`);
    }
  }
  return i18n.t('httpCodeMessage.unknown');
};
