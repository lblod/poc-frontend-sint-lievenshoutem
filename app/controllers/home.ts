import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;

  /** Controls the loading animation of the "locatie's opslaan" button */
  @tracked loading = false;

  get localGovernmentGroupOptions() {
    return Promise.all([this.municipalities, this.provinces]).then(
      ([municipalities, provinces]) => [
        { groupName: 'Gemeente', options: municipalities },
        { groupName: 'Provincie', options: provinces },
      ]
    );
  }

  get provinces() {
    return this.provinceList.provinceLabels();
  }

  get municipalities() {
    return this.municipalityList.municipalityLabels();
  }

  /** Resets the button loading animation */
  @action resetLoading() {
    this.loading = false;
  }
  /** Handles keyword search on homepage */
  @tracked keywordValue = '';

  @action handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.handleMunicipalitySelect();
    }
  }

  @action
  handleChange(event: Event) {
    this.keywordValue = (event.target as HTMLInputElement).value;
  }

  @tracked selectedLocalGovernments: Array<{
    label: string;
    id: string;
    type: 'gemeentes' | 'provincies';
  }> = [];

  @action handleSelectLocalGovernmentsChange(
    selectedLocalGovernments: Array<{
      label: string;
      id: string;
      type: 'gemeentes' | 'provincies';
    }>
  ) {
    this.selectedLocalGovernments = selectedLocalGovernments;
  }

  @action handleMunicipalitySelect() {
    this.loading = true;
    this.router.transitionTo('agenda-items', {
      queryParams: {
        trefwoord: this.keywordValue,
        provincies: serializeArray(
          this.selectedLocalGovernments
            .filter((municipality) => municipality.type === 'provincies')
            .map((municipality) => municipality.label)
        ),
        gemeentes: serializeArray(
          this.selectedLocalGovernments
            .filter((municipality) => municipality.type === 'gemeentes')
            .map((municipality) => municipality.label)
        ),
      },
    });
  }
}
