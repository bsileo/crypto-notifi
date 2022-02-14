<template>
  <div class="pl-4">
    <div v-show="!selectedProtocol" class="row">
      <div v-show="subType == undefined" class="pb-3">
        <h1>Select a Protocol:</h1>
      </div>
      <ProtocolSelector
        :showSearch="true"
        :showUserInfo="true"
        @selection="selectProtocol"
      ></ProtocolSelector>
    </div>
    <div v-if="selectedProtocol" class="row">
      <ProtocolInfo
        :protocol="selectedProtocol"
        :selected="false"
        :showVote="false"
        :showUserInfo="true"
        :showFavorites="true"
        :allowSelect="false"
        :showSubscribe="false"
        displayMode="narrow"
      >
      </ProtocolInfo>
      <div class="flex xs1">
        <va-button
          @click="clearProtocol"
          size="small"
          color="secondary"
          icon="clear"
          class="float-right"
        ></va-button>
      </div>
    </div>
  </div>
  <va-divider inset />
  <div>
    <div class="row pt-2">
      <va-select
        class="flex sm2"
        label="Chain"
        v-model="chain"
        :options="protocolChains"
        :rules="[this.chain != undefined || 'Select a chain']"
      />
      <va-select
        class="flex sm6"
        label="Contract Name"
        v-model="contractAddress"
        :options="contracts"
        :track-by="(option) => option.id"
        value-by="id"
        text-by="description"
        searchable
        :rules="[this.validContract || 'Enter a valid contract address']"
      />
      <va-select
        class="flex sm4"
        label="Contract Activity"
        v-model="contractActivityID"
        :options="contractActivities"
        track-by="id"
        value-by="id"
        :text-by="(option) => option.nameAndLevel"
        searchable
      />
    </div>
    <div class="row pt-2">
      <div class="flex sm-3"></div>
      <div class="flex sm-9 mb-2 justify-self--end">
        <va-alert
          :border-color="activityAllowed ? 'success' : 'danger'"
          border="top"
        >
          <template v-slot:icon>
            <va-icon
              :name="activityAllowed ? 'psychology' : 'error'"
              :color="activityAllowed ? 'info' : 'danger'"
            ></va-icon>
          </template>
          <template v-slot:title>Activity:</template>
          <template v-slot:default
            ><span v-html="activityDescription"></span
          ></template>
        </va-alert>
      </div>
    </div>
    <div class="row pt-2">
      <va-switch
        class="flex xs2 lg1"
        color="primary"
        :disabled="true"
        v-model="chkChain"
      />
      <va-select
        class="flex xs8"
        label="Chain"
        v-model="chain"
        :options="protocolChains"
        :rules="[this.chain !== undefined || 'Select a chain']"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, computed, ref } from "vue";

import { userModule } from "@/store/user";
import { Subscription } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import { ContractActivity } from "@/models/ContractActivity";

import Moralis from "moralis";
import { contractsModule } from "@/store/contracts";
import { Contract, Chain } from "@/models/Contract";
import { NotifiUser } from "@/models/NotifiUser";
import ProtocolSelector from "./ProtocolSelector.vue";
import ProtocolInfo from "./ProtocolInfo.vue";

let tx: Record<string, unknown> | null = null;

interface protocolInfo {
  name: string;
  iconURL: string;
  protocol: Protocol;
}

export default defineComponent({
  name: "SubscribeContract",
  components: { ProtocolSelector, ProtocolInfo },
  props: {
    transaction: { type: tx, required: false },
    subscription: { type: Subscription, required: false },
    protocol: { type: Protocol, required: false },
  },
  data() {
    return {
      chain: "avalanche" as Chain,
      validation: null,
      chkChain: true,
      contractAddress: "",
      contractIcon: "" as string | undefined,
      chkContract: false,
      contractActivities: [] as Array<ContractActivity>,
      contractActivityID: undefined as string | undefined,
    };
  },
  setup(props) {
    const user: NotifiUser | undefined = inject("user");
    const intSelectedProtocol = ref<Protocol | undefined>(props.protocol);

    const selectedProtocol = computed({
      get(): Protocol | undefined {
        return intSelectedProtocol.value;
      },
      set(val: Protocol | undefined) {
        intSelectedProtocol.value = val;
      },
    });

    const protocols = computed((): protocolInfo[] => {
      return protocolsModule.allProtocols.map((e: Protocol) => {
        return {
          name: e.get("name"),
          iconURL: e.get("iconURL"),
          id: e.id,
          protocol: e,
        };
      });
    });

    const chains = computed((): Chain[] => {
      return contractsModule.CHAINS;
    });
    const protocolChains = computed((): Chain[] => {
      const res = [] as Chain[];
      if (selectedProtocol.value) {
        const chainNames: string[] = selectedProtocol.value.get("chains");
        chainNames.forEach((cn) => {
          const aChain = chains.value.find((c) => c == cn);
          if (aChain) {
            res.push(aChain);
          }
        });
      }
      return res;
    });

    return {
      user,
      selectedProtocol,
      protocols,
      protocolChains,
      chains,
    };
  },
  emits: ["saved", "cancel"],
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedProtocol(newProtocol: string, oldProtocol: string) {
      this.contractAddress = "";
      this.contractActivityID = "";
      //this.chain = this.protocolChains[0];
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contractAddress(newAddress: string, oldAddress: string) {
      this.fetchContractActivities();
    },
  },
  computed: {
    selectedContract(): Contract | undefined {
      return this.contracts.find((e) => e.id == this.contractAddress);
    },
    selectedContractActivity(): ContractActivity | undefined {
      return this.contractActivities.find(
        (e) => e.id == this.contractActivityID
      );
    },
    activityDescription(): string {
      const act = this.selectedContractActivity;
      if (!act) return "";
      let res = act.description;
      if (!this.activityAllowed) {
        const prot = this.selectedProtocol;
        const actTokens = prot?.goldQuantity;
        const symbol = prot?.symbol;
        const bal = prot?.getWalletBalance();
        res =
          res +
          `<br/><br/>Warning: Requires protocol level <strong>${act.level}</strong>.  Stake at least ${actTokens} tokens in ${symbol} to subscribe to this activity. Your wallet holds ${bal}`;
      }
      return res;
    },
    // True if the current user is allowed to subscribe to the selected ContractActivity
    activityAllowed(): boolean {
      const act = this.selectedContractActivity;
      const prot = this.selectedProtocol;
      if (!prot || !act) {
        return false;
      }
      return prot.userSubscriptionAllowed(act);
    },
    validContract(): boolean {
      return true;
    },
    contracts(): Contract[] {
      if (this.selectedProtocol) {
        return contractsModule.allContracts.filter(
          (c) => c.get("protocol").id == this.selectedProtocol?.id
        );
      }
      return [];
    },
    validSubmit(): boolean {
      return this.validContractSubmit;
    },
    validContractSubmit(): boolean {
      return (
        this.selectedContract != undefined &&
        this.selectedContractActivity != undefined &&
        this.activityAllowed
      );
    },
    message(): string {
      let msg = "";
      if (this.selectedProtocol) {
        msg = `the <strong>${this.selectedProtocol.name} Protocol</strong>`;
      }
      msg = `${msg} which trigger on`;
      if (this.selectedContractActivity?.type == "Transaction") {
        msg = `${msg} <strong>Transactions</strong>`;
        if (this.selectedContract) {
          msg = `${msg} for the contract <strong>${this.selectedContract.description}</strong>`;
        }
        msg = `${msg} on the <strong>${this.chain} blockchain</strong>`;
      }
      return msg;
    },
  },
  methods: {
    userID(): string {
      if (userModule.user?.id) {
        return userModule.user.id;
      } else {
        console.error("UserID is unset");
        throw "UserID is unset";
      }
    },
    async fetchContractActivities(): Promise<void> {
      const res: ContractActivity[] = [];
      const ci = this.selectedContract;
      if (ci) {
        const actsRel = ci.relation("ContractActivities");
        const acts: ContractActivity[] = await actsRel.query().find();
        for (let i = 0; i < acts.length; i = i + 1) {
          res.push(acts[i]);
        }
      }
      this.contractActivityID = undefined;
      this.contractActivities = res;
    },

    async irrigate(s: Subscription): Promise<void> {
      if (this.selectedProtocol != undefined) {
        s.protocol = this.selectedProtocol;
      }
      if (this.chkChain) {
        s.set("chain", this.chain);
      }
      if (this.selectedContract) {
        s.set("contract", this.selectedContract);
        s.set("contractAddress", this.selectedContract.address);
        s.set("contractChain", this.selectedContract.get("chain"));
      }
      if (this.selectedContractActivity) {
        s.set("contractActivity", this.selectedContractActivity);
      }
    },
    async getContractIcon(): Promise<string | undefined> {
      const addr = this.contractAddress;
      if (addr) {
        this.contractIcon = await this.getIcon(addr);
        return this.contractIcon;
      }
    },
    async getIcon(addr: string): Promise<string | undefined> {
      // const chain = "0xa86a";
      const options = { addresses: [addr] };
      const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(
        options
      );
      return tokenMetadata[0]?.thumbnail;
    },
    selectProtocol(prot: Protocol) {
      this.selectedProtocol = prot;
    },
  },
});
</script>

<style scoped>
div.active {
  background-color: rgb(197 47 47);
}
.protocolCards {
  max-height: 30em;
  overflow-y: scroll;
  overflow-x: clip;
}
</style>
