import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyLogService, BizyPopupService, BizyToastService } from '@bizy/core';
import { DEFAULT_USER_PICTURE, IMG_PATH } from '@core/constants';
@Component({
  selector: 'tero-contact-picture-popup',
  templateUrl: 'contact-picture-popup.html',
  styleUrls: ['contact-picture-popup.css'],
  imports: SharedModules
})
export class ContactPicturePopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #ref = inject(ChangeDetectorRef);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);

  loading: boolean = false;
  selectedPicture: string | null = null;

  readonly MAX_LIMIT: number = 3;

  readonly IMG_PATH = IMG_PATH;
  readonly DEFAULT_USER_PICTURE = DEFAULT_USER_PICTURE;

  readonly CONTACT_PICTURES = [
    'picture_afro_female.svg',
    'picture_afro_male.svg',
    'picture_avocado.svg',
    'picture_band.svg',
    'picture_batman.svg',
    'picture_bear.svg',
    'picture_boy_orange_shirt.svg',
    'picture_boy.svg',
    'picture_bulb.svg',
    'picture_cactus.svg',
    'picture_chaplin.svg',
    'picture_chef_female.svg',
    'picture_chihiro.svg',
    'picture_city.svg',
    'picture_clock.svg',
    'picture_delivery.svg',
    'picture_doctor_female.svg',
    'picture_doctor_male.svg',
    'picture_female.svg',
    'picture_fighter.svg',
    'picture_forest.svg',
    'picture_gameboy.svg',
    'picture_girl_pink_shirt.svg',
    'picture_girl.svg',
    'picture_globe.svg',
    'picture_grandma.svg',
    'picture_grandpa.svg',
    'picture_grass.svg',
    'picture_headset_man.svg',
    'picture_headset_woman.svg',
    'picture_lazy.svg',
    'picture_male.svg',
    'picture_man_beard.svg',
    'picture_man.svg',
    'picture_nurse_female.svg',
    'picture_nurse_male.svg',
    'picture_office_male.svg',
    'picture_pilot.svg',
    'picture_police_man.svg',
    'picture_red_female.svg',
    'picture_sand.svg',
    'picture_sea.svg',
    'picture_rocket.svg',
    'picture_sheep.svg',
    'picture_sister.svg',
    'picture_spider.svg',
    'picture_trees.svg',
    'picture_vampire.svg',
    'picture_wallet.svg',
    'picture_webcam.svg',
    'picture_woman_blue.svg',
    'picture_woman_pink.svg',
    'picture_woman.svg',
    'picture_worker.svg'
  ];

  async ngOnInit() {
    try {
      this.loading = true;

      const data = this.#popup.getData<{ picture: string }>();
      if (data && data.picture) {
        this.selectedPicture = data.picture;
      }
    } catch (error) {
      this.#log.error({
        fileName: 'contact-picture-popup.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
      this.#ref.detectChanges();
    }
  }

  apply() {
    this.#popup.close({ response: { picture: this.selectedPicture } });
  }

  close() {
    this.#popup.close();
  }
}
