import { Chain } from "@/models/Contract";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => {
    return {
      isSidebarMinimized: true,
      protocolSearchFavorites: false,
      chains: ["eth", "avalanche"] as Array<Chain>,
    };
  },
  getters: {},
  actions: {
    SidebarMinimized(state: boolean): void {
      this.isSidebarMinimized = state;
    },
    UpdateProtocolSearchFavorites(value: boolean): void {
      this.protocolSearchFavorites = value;
    },
  },
});
