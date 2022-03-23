import { Protocol } from "@/models/Protocol";
import { defineStore } from "pinia";
import { Chain, Contract } from "@/models/Contract";
import Moralis from "moralis";

export const useContractsStore = defineStore("contracts", {
  state: () => {
    return {
      contracts: {} as Array<Contract>,
      chains: ["eth", "avalanche"] as Array<Chain>,
    };
  },
  getters: {},
  actions: {
    getProtocolContracts: async (aProtocol: Protocol): Promise<Contract[]> => {
      const query = Moralis.Query("Contract");
      query.equalTo("Protocol", aProtocol);
      return query.find();
    },
  },
});
