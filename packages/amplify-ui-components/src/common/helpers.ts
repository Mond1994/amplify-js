import { Hub, I18n } from '@aws-amplify/core';
import {
  UI_AUTH_CHANNEL,
  TOAST_AUTH_ERROR_EVENT,
  AUTH_STATE_CHANGE_EVENT,
  PHONE_EMPTY_ERROR_MESSAGE,
  NO_STORAGE_MODULE_FOUND,
} from './constants';
import { AuthState, AuthStateHandler, UsernameAlias } from '../common/types/auth-types';
import { PhoneNumberInterface } from '../components/amplify-auth-fields/amplify-auth-fields-interface';
import { Translations } from './Translations';
import { Storage } from '@aws-amplify/storage';

export interface ToastError {
  code: string;
  name: string;
  message: string;
}

export const hasShadowDom = (el: HTMLElement) => {
  return !!el.shadowRoot && !!(el as any).attachShadow;
};

export const dispatchToastHubEvent = (error: ToastError) => {
  Hub.dispatch(UI_AUTH_CHANNEL, {
    event: TOAST_AUTH_ERROR_EVENT,
    message: error.message,
  });
};

export const dispatchAuthStateChangeEvent: AuthStateHandler = (nextAuthState: AuthState, data?: object) => {
  Hub.dispatch(UI_AUTH_CHANNEL, {
    event: AUTH_STATE_CHANGE_EVENT,
    message: nextAuthState,
    data,
  });
};

export const composePhoneNumberInput = (phoneNumber: PhoneNumberInterface) => {
  if (!phoneNumber.phoneNumberValue) {
    throw new Error(PHONE_EMPTY_ERROR_MESSAGE);
  }

  const sanitizedPhoneNumberValue = phoneNumber.phoneNumberValue.replace(/[-()\s]/g, '');

  return `${phoneNumber.countryDialCodeValue}${sanitizedPhoneNumberValue}`;
};

export const checkUsernameAlias = (usernameAlias: any) => {
  if (!(usernameAlias in UsernameAlias)) {
    throw new Error(`Invalid username Alias - ${usernameAlias}. Instead use ${Object.values(UsernameAlias)}`);
  }
};

export const onAuthUIStateChange = (authStateHandler: AuthStateHandler) => {
  const authUIStateHandler = data => {
    const { payload } = data;
    switch (payload.event) {
      case AUTH_STATE_CHANGE_EVENT:
        if (payload.message) {
          authStateHandler(payload.message as AuthState, payload.data);
        }
        break;
    }
  };
  Hub.listen(UI_AUTH_CHANNEL, authUIStateHandler);
  return () => Hub.remove(UI_AUTH_CHANNEL, authUIStateHandler);
};

export const isHintValid = field => {
  return !(field['hint'] === null || typeof field['hint'] === 'string');
};

// Required attributes come from https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
export const requiredAttributesMap = {
  address: {
    label: I18n.get(Translations.ADDRESS_LABEL),
    placeholder: I18n.get(Translations.ADDRESS_PLACEHOLDER),
  },
  nickname: {
    label: I18n.get(Translations.NICKNAME_LABEL),
    placeholder: I18n.get(Translations.NICKNAME_PLACEHOLDER),
  },
  birthdate: {
    label: I18n.get(Translations.BIRTHDATE_LABEL),
    placeholder: I18n.get(Translations.BIRTHDATE_PLACEHOLDER),
  },
  phone_number: {
    label: I18n.get(Translations.PHONE_LABEL),
    placeholder: I18n.get(Translations.PHONE_PLACEHOLDER),
  },
  email: {
    lable: I18n.get(Translations.EMAIL_LABEL),
    placeholder: I18n.get(Translations.EMAIL_PLACEHOLDER),
  },
  picture: {
    label: I18n.get(Translations.PICTURE_LABEL),
    placeholder: I18n.get(Translations.PICTURE_PLACEHOLDER),
  },
  family_name: {
    label: I18n.get(Translations.FAMILY_NAME_LABEL),
    placeholder: I18n.get(Translations.FAMILY_NAME_PLACEHOLDER),
  },
  preferred_username: {
    label: I18n.get(Translations.PREFERRED_USERNAME_LABEL),
    placeholder: I18n.get(Translations.PREFERRED_USERNAME_PLACEHOLDER),
  },
  gender: {
    label: I18n.get(Translations.GENDER_LABEL),
    placeholder: I18n.get(Translations.GENDER_PLACEHOLDER),
  },
  profile: {
    label: I18n.get(Translations.PROFILE_LABEL),
    placeholder: I18n.get(Translations.PROFILE_PLACEHOLDER),
  },
  given_name: {
    label: I18n.get(Translations.GIVEN_NAME_LABEL),
    placeholder: I18n.get(Translations.GIVEN_NAME_LABEL),
  },
  zoneinfo: {
    label: I18n.get(Translations.ZONEINFO_LABEL),
    placeholder: I18n.get(Translations.ZONEINFO_PLACEHOLDER),
  },
  locale: {
    label: I18n.get(Translations.LOCALE_LABEL),
    placeholder: I18n.get(Translations.LOCALE_PLACEHOLDER),
  },
  updated_at: {
    label: I18n.get(Translations.UPDATED_AT_LABEL),
    placeholder: I18n.get(Translations.UPDATED_AT_PLACEHOLDER),
  },
  middle_name: {
    label: I18n.get(Translations.MIDDLE_NAME_LABEL),
    placeholder: I18n.get(Translations.MIDDLE_NAME_PLACEHOLDER),
  },
  website: {
    label: I18n.get(Translations.WEBSITE_LABEL),
    placeholder: I18n.get(Translations.WEBSITE_PLACEHOLDER),
  },
  name: {
    label: I18n.get(Translations.NAME_LABEL),
    placeholder: I18n.get(Translations.NAME_PLACEHOLDER),
  },
};

export const calcKey = (file, fileToKey) => {
  const { name, size, type } = file;
  let key = encodeURI(name);
  if (fileToKey) {
    const callback_type = typeof fileToKey;
    if (callback_type === 'string') {
      key = fileToKey;
    } else if (callback_type === 'function') {
      key = fileToKey({ name, size, type });
    } else {
      key = encodeURI(JSON.stringify(fileToKey));
    }
    if (!key) {
      key = 'empty_key';
    }
  }

  return key.replace(/\s/g, '_');
};

export const getStorageObject = async (key, level, track, identityId, logger) => {
  if (!Storage || typeof Storage.get !== 'function') {
    throw new Error(NO_STORAGE_MODULE_FOUND);
  }

  try {
    const src = await Storage.get(key, { level, track, identityId });
    return src;
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
};
