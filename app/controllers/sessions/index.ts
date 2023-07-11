import Controller from '@ember/controller';
import Store from '@ember-data/store';
import { action } from '@ember/object';
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import SessionIndexRoute from '../../routes/sessions/index';
import { ModelFrom } from '../../lib/type-utils';
import MunicipalityListService from "frontend-burgernabije-besluitendatabank/services/municipality-list";
import Session from 'frontend-burgernabije-besluitendatabank/models/session';


export default class SessionsIndexController extends Controller {
    @service declare store: Store;
    @service declare municipalityList: MunicipalityListService;

    /** Used to request more data */
    declare model: ModelFrom<SessionIndexRoute>;
    
    /** Controls the loading animation of the "load more" button */
    @tracked isLoadingMore = false;

    @tracked sessions: Session[] = [];

    plannedStartMin?: string;
    plannedStartMax?: string;
    municipality?: string;

    get municipalities() {
        return this.municipalityList.municipalities();
    }

    setup() {
      this.sessions = this.model.sessions.slice();
    }

    @action
    async loadMore() {
      //todo add max page guard
      if (this.model && !this.isLoadingMore) {
        this.isLoadingMore = true;
        const nextPage = this.model.currentPage + 1;

        const plannedStartMin = String(this.plannedStartMin) || undefined;
        const plannedStartMax = String(this.plannedStartMax) || undefined;
        const municipalities = String(this.municipality) || undefined;

        const sessions = (await this.store.query(
          'session',
          this.model.getQuery(
            nextPage,
            plannedStartMin,
            plannedStartMax,
            municipalities
          )
        )) as unknown as Session[];

        this.sessions = [...this.sessions, ...sessions];

        this.model.currentPage = nextPage;
        this.isLoadingMore = false;
      }
  }

  get isEmpty() {
    console.log('isEmpty', this.model.sessions.length);
    return this.model.sessions.length === 0;
  }
}
