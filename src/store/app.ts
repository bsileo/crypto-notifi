import { SidebarDescriptor } from './../notifi_types';
import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import { store } from ".";

@Module({ dynamic: true, store: store, namespaced: true, name: "App" })
export class AppModule extends VuexModule {
  _isSidebarMinimized = true;

  get isSidebarMinimized(): boolean {
    return this._isSidebarMinimized;
  }

  @Mutation
  SidebarMinimized(state: boolean): void {
    this._isSidebarMinimized = state;
  }
}

export const appModule = getModule(AppModule);
