import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import { store } from ".";

import Moralis from "@/config/moralis";
import { Protocol } from "@/models/Protocol";


@Module({
  dynamic: true,
  store: store,
  namespaced: true,
  name: "Protocols",
})
export class ProtocolsModule extends VuexModule {
  PROTOCOLS: Array<Protocol> = [];

  get allProtocols(): Array<Protocol> {
    return this.PROTOCOLS;
  }

  @Mutation
  public AddProtocol(prot: Protocol): void {
    this.PROTOCOLS.push(prot);
  }

  @Mutation
  public SetMyProtocols(prots: Protocol[]): void {
    this.PROTOCOLS = prots;
  }
}

export const protocolsModule = getModule(ProtocolsModule);

const setupMyProtocolsSub = async () => {
  const query = new Moralis.Query(Protocol);
  const protocol = await query.subscribe();

  const refresh = (): void => {
    query.find().then((results: Array<Protocol>) => {
      console.log("Initial Prototype created");
      protocolsModule.SetMyProtocols(results);
    });
  };
  protocol.on("open", () => {
    query.find().then((results: Array<Protocol>) => {
      protocolsModule.SetMyProtocols(results);
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("create", (object: Protocol) => {
    //console.log("object created");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("update", (object: Protocol) => {
    // console.log("object updated");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("enter", (object: Protocol) => {
    // console.log("object entered");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("leave", (object: Protocol) => {
    // console.log("object left");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("delete", (object: Protocol) => {
    // console.log("object deleted");
    refresh();
  });
  protocol.on("close", () => {
    console.log("protocol closed");
  });
};
setupMyProtocolsSub();
