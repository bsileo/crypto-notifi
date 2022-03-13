import { Protocol } from "@/models/Protocol";
import { Position } from "@/models/Position";
import { PositionCache } from "@/notifi_types";
import { defineStore } from "pinia";

export const useProtocolsStore = defineStore("protocols", {
  state: () => {
    return {
      positions: {} as Record<string, PositionCache>,
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
