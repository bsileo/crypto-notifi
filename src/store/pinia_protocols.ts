import { useUserStore } from '@/store/pinia_user';
import { Protocol } from "@/models/Protocol";
import { Position } from "@/models/Position";
import { PositionCache } from "@/notifi_types";
import { defineStore } from "pinia";

export const useProtocolsStore = defineStore("protocols", {
  state: () => {
    return {
      positions: {} as Record<string, PositionCache>,
      favorites: [] as Protocol[],
    };
  },
  getters: {
    positionsForProtocol: (state) => {
      return (protocol: Protocol): Position[] | undefined => {
        const pc = state.positions[protocol.id];
        if (pc) {
          const now = Date.now()
          const cache = pc.time.getTime();
          const deltaMins = (now - cache) / 1000 / 60;
          if (deltaMins < 10) {
            console.log(`Cache Hit for ${protocol.id}`);
            return pc.data as Position[];
          }
        }
        return undefined;
      };
    },
  },
  actions: {
    async toggleFavorite(aProtocol: Protocol) {
      const fav = await aProtocol.toggleFavorite();
      if (fav) {
        this.favorites.push(aProtocol);
      } else {
        const idx = this.favorites.findIndex((f) => f.id == aProtocol.id);
        if (idx) this.favorites.splice(idx, 1);
      }
    },
    async getFavorites(): Promise<Protocol[]> {
      const userStore = useUserStore();
      const user = userStore.user;
      if (!user) return [];
      const rel = user.relation("FavoriteProtocols");
      const favs = await rel.query().find();
      this.favorites = favs;
      return favs;
    },
    savePositions({
      protocol,
      positions,
    }: {
      protocol: Protocol;
      positions: Position[];
    }): void {
      console.log(`Save ${positions.length} for ${protocol.id}`);
      this.positions = {
        ...this.positions,
        [protocol.id]: { data: positions, time: new Date() } as PositionCache,
      };
    },
  },
});
