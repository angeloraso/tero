import { Inject, Injectable } from '@angular/core';
import { LANGUAGE } from '@core/constants';
import { TranslateService } from '@ngx-translate/core';

export interface ILocale {
  lang: LANGUAGE;
  translations: Record<string, unknown>;
}

@Injectable()
export class TeroTranslateService {
  constructor(@Inject(TranslateService) private translate: TranslateService) {}

  public loadTranslations(...args: ILocale[]): void {
    const locales = [...args];
    locales.forEach(locale => {
      this.translate.setTranslation(locale.lang, locale.translations, true);
    });
  }

  addLangs(langs: Array<LANGUAGE>) {
    this.translate.addLangs(langs);
  }

  getLangs(): Array<LANGUAGE> {
    return this.translate.getLangs() as Array<LANGUAGE>;
  }

  setDefault(lang: LANGUAGE): void {
    this.translate.setDefaultLang(lang);
  }

  getCurrentLang(): LANGUAGE {
    return this.translate.currentLang as LANGUAGE;
  }

  use(lang: LANGUAGE): void {
    this.translate.use(lang);
  }

  get(translation: string): string {
    return this.translate.instant(translation);
  }
}
