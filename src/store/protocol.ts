import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  Action,
} from "vuex-module-decorators";
import { store } from ".";

import Moralis from "@/config/moralis";
import { Protocol } from "@/models/Protocol";
import { userModule } from "./user";
import { NotifiUser } from "@/models/NotifiUser";
import { Position } from "@/models/Position";
import { PositionCache } from "@/notifi_types";

@Module({
  dynamic: true,
  store: store,
  namespaced: true,
  name: "Protocols",
})
export class ProtocolsModule extends VuexModule {
  PROTOCOLS: Array<Protocol> = [];
  POSITIONS: Record<string, PositionCache> = {};

  @Mutation
  public SavePositions({
    protocol,
    positions,
  }: {
    protocol: Protocol;
    positions: Position[];
  }): void {
    console.log(`Save ${positions.length} for ${protocol.id}`);
    this.POSITIONS = {
      ...this.POSITIONS,
      [protocol.id]: { data: positions, time: new Date() },
    };
  }

  get positions(): Record<string, PositionCache> {
    return this.POSITIONS;
  }
}

export const protocolsModule = getModule(ProtocolsModule);