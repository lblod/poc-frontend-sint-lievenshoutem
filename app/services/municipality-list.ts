import Store from '@ember-data/store';
import Service, { service } from '@ember/service';
import CONSTANTS from 'frontend-burgernabije-besluitendatabank/config/constants';
import LocationModel from 'frontend-burgernabije-besluitendatabank/models/location';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
type Municipality = { label: string; id: string };

export default class MunicipalityListService extends Service {
  @service declare store: Store;

  private _municipalities?: Array<Municipality>;
  private _municipalityCleanedLabels?: Array<{ label: string }>;

  /**
   * Get all municipalities
   *
   * - If possible, return it from local variable/cache
   * - If that is empty, populate it with & return from
   *
   * @returns A promise for an array of municipalities
   **/
  async municipalities() {
    if (!this._municipalities) {
      this._municipalities = await this._loadMunicipalities();
    }

    return this._municipalities;
  }

  /**
   * Get all municipalities, filtered on the following criteria:
   * - no duplicate labels
   * - remove 'Kruishoutem' (because it's not a municipality anymore) #BNB-402
   *
   * Filtering is managed frontend as a temporary solution ^^
   * TODO: move this to the backend
   *
   * @returns A promise for an array of municipality labels
   **/

  async municipalityLabels() {
    if (!this._municipalityCleanedLabels) {
      this._municipalityCleanedLabels = this._filteredMunicipalities(
        await this.municipalities()
      );
    }

    return this._municipalityCleanedLabels;
  }

  private _filteredMunicipalities(municipalities?: Array<Municipality>) {
    if (!municipalities) {
      return [];
    }

    const uniqueLabels = [
      ...new Set(
        municipalities
          .filter(
            (municipality) =>
              municipality.label && municipality.label !== 'Kruishoutem'
          )
          .map(({ label }) => label)
      ),
    ].map((label) => ({ label, type: CONSTANTS['municipalities'] }));

    return uniqueLabels;
  }

  /**
   * Requests & parses municipalities from Ember-Data
   *
   * @returns An promise for an array of municipalities, parsed into objects with an id & label property
   */

  private async _loadMunicipalities() {
    const municipalities = await this.store.query('location', {
      page: { size: 600 },
      filter: {
        niveau: 'Gemeente',
      },
      sort: ':no-case:label',
    });

    return municipalities.map((location: LocationModel) => ({
      id: location.id,
      label: location.label,
      // look at the environment APP.municipalities for the type
      type: CONSTANTS['municipalities'],
    }));
  }

  /**
   *
   * @param labels an array of location labels
   *               Alternatively, a string of location labels
   * @param stringSeperator the seperator to split labels, if labels is a string
   *                        Defaults to the seperator defined in helpers/constants.ts
   * @returns a Promise for a joined string of those locations' id's, or undefined
   */
  async getLocationIdsFromLabels(
    labels?: Array<string> | string
  ): Promise<string | undefined> {
    const municipalities = await this.municipalities();
    if (typeof labels === 'string') {
      labels = deserializeArray(labels);
    }

    if (!labels || !municipalities) {
      return undefined;
    }

    const locationIds: Array<string> = municipalities
      .filter(({ label }) => labels?.includes(label))
      .map(({ id }) => id);

    return locationIds.join(',');
  }
}
