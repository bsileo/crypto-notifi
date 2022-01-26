export interface State {
  state: Record<string, unknown>;
  mutations: Record<string, unknown>;
  actions: Record<string, unknown>;
  modules: Record<string, unknown>;
}

import { createStore, Store } from "vuex";
import { InjectionKey } from "vue";

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({});
