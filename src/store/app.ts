import { SidebarDescriptor } from './../notifi_types';
import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import { store } from ".";
import { Chain } from '@/models/Contract';

@Module({ dynamic: true, store: store, namespaced: true, name: "App" })
export class AppModule extends VuexModule {
  _isSidebarMinimized = true;
  private _protocolSearchFavorites = false;
  private _chains: Array<Chain> = ["eth", "avalanche"];

  public get chains(): Array<Chain> {
    return this._chains;
  }

  get protocolSearchFavorites(): boolean {
    return this._protocolSearchFavorites;
  }

  @Mutation
  UpdateProtocolSearchFavorites(value : boolean): void {
    this._protocolSearchFavorites = value;
  }

  get isSidebarMinimized(): boolean {
    return this._isSidebarMinimized;
  }

  @Mutation
  SidebarMinimized(state: boolean): void {
    this._isSidebarMinimized = state;
  }


}

export const appModule = getModule(AppModule);
