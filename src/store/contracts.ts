import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  Action,
} from "vuex-module-decorators";
import { store } from ".";

import { Contract, Chain } from "@/models/Contract";
import Moralis from "@/config/moralis";
import { Protocol } from "@/models/Protocol";

@Module({ dynamic: true, store: store, namespaced: true, name: "Contracts" })
export class ContractsModule extends VuexModule {
  CONTRACTS: Array<Contract> = [];
  CHAINS: Array<Chain> = ["eth", "avalanche"];

  get allContracts(): Array<Contract> {
    return this.CONTRACTS;
  }

  public getProtocolContracts(selectedProtocol: Protocol): Contract[] {
    return this.CONTRACTS.filter(
      (c) => c.get("protocol").id == selectedProtocol.id
    );
  }

  @Mutation
  public ADD_CONTRACT(contract: Contract): void {
    this.CONTRACTS.push(contract);
  }

  @Mutation
  public SetContracts(contracts: Contract[]): void {
    this.CONTRACTS = contracts;
  }

  @Action
  public AddContract(contract: Contract): void {
    this.context.commit("ADD_CONTRACT", contract);
  }
}

export const contractsModule = getModule(ContractsModule);

const setupContractsSub = async () => {
  const query = new Moralis.Query(Contract);
  const subscription = await query.subscribe();
  const refresh = (): void => {
    query.find().then((results: Array<Contract>) => {
      console.log("Initial objects created");
      contractsModule.SetContracts(results);
    });
  };
  subscription.on("open", () => {
    query.find().then((results: Array<Contract>) => {
      contractsModule.SetContracts(results);
    });
  });
  subscription.on("create", (object: Contract) => {
    //console.log("object created");
    contractsModule.AddContract(object);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (object: Contract) => {
    // console.log("object updated");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (object: Contract) => {
    // console.log("object entered");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (object: Contract) => {
    // console.log("object left");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (object: Contract) => {
    // console.log("object deleted");
    refresh();
  });
  subscription.on("close", () => {
    console.log("subscription closed");
  });
};
setupContractsSub();
