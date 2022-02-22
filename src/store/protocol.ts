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
@Module({
  dynamic: true,
  store: store,
  namespaced: true,
  name: "Protocols",
})
export class ProtocolsModule extends VuexModule {
  PROTOCOLS: Array<Protocol> = [];
  MANAGERPROTOCOLS: Array<Protocol> = [];
  MANAGER_SUBSCRIPTION: any = undefined;

  get allProtocols(): Array<Protocol> {
    return this.PROTOCOLS;
  }

  get myManagerProtocols(): Array<Protocol> {
    return this.MANAGERPROTOCOLS;
  }

  get managerSubscription(): any {
    return this.MANAGER_SUBSCRIPTION;
  }

  @Mutation
  public AddProtocol(prot: Protocol): void {
    this.PROTOCOLS.push(prot);
  }

  @Mutation
  public SetMyProtocols(prots: Protocol[]): void {
    this.PROTOCOLS = prots;
  }

  @Action
  public async setupProtocolsSubscription(manager?: boolean): Promise<boolean> {
    const query = new Moralis.Query(Protocol);
    if (manager == true) {
      //const user = userModule._user;
      //const uQuery = new Moralis.Query("User");
      //uQuery.equalTo(user);
      //query.matchesQuery("Managers", uQuery);
    }
    const sub = await query.subscribe();
    sub.on("open", () => {
      query.find().then((results: Array<Protocol>) => {
        protocolsModule.SetManagerProtocols(results);
      });
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("create", (object: Protocol) => {
      console.log("Protocols object created");
      this.refreshManagerProtocols();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("update", (object: Protocol) => {
      console.log("Manager Protocols object updated");
      this.refreshManagerProtocols();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("enter", (object: Protocol) => {
      console.log("Manager Protocols  object entered");
      this.refreshManagerProtocols();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("leave", (object: Protocol) => {
      console.log("Manager Protocols object left");
      this.refreshManagerProtocols();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("delete", (object: Protocol) => {
      console.log("Manager Protocols  object deleted");
      this.refreshManagerProtocols();
    });
    sub.on("close", () => {
      console.log("Manager Protocol subscription closed");
    });
    this.context.commit("setManagerProtocolsSubscription", manager);
    return true;
  }

  @Mutation
  public setManagerProtocolsSubscription(sub: any): void {
    console.log(`Setting new Manager Protocol Sub - ${sub}`);
    this.MANAGER_SUBSCRIPTION = sub;
  }

  @Action
  public async refreshManagerProtocols(): Promise<void> {
    if (this.managerSubscription) {
      const res: Array<Protocol> = await this.managerSubscription.find();
      const userid = userModule.user?.id;
      console.log(`Refresh Manager Protocols got ${res.length}`);
      const mine: Protocol[] = res.filter((p: Protocol) => {
        return (
          p.get("Managers").filter((u: NotifiUser) => {
            u.id == userid;
          }).length > 0
        );
      });
      this.context.commit("SetManagerProtocols", mine);
    } else {
      console.log("No Manager Protocols subscription setup!");
    }
  }

  @Mutation
  public SetManagerProtocols(prots: Protocol[]): void {
    this.MANAGERPROTOCOLS = prots;
  }
}

export const protocolsModule = getModule(ProtocolsModule);

const setupProtocolsSub = async () => {
  const query = new Moralis.Query(Protocol);
  const protocol = await query.subscribe();

  const refresh = (): void => {
    query.find().then((results: Array<Protocol>) => {
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
setupProtocolsSub();
