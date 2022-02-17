<template>
  <div class="pl-4">
    <div v-show="!selectedProtocol" class="row">
      <div class="pb-3">
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
  <div v-if="protocolNoContracts" class="flex row pt-2">
    <div class="flex xs12 sm8 md6">
      <va-card :bordered="false">
        <va-card-title>Vote for this Protocol!</va-card-title>
        <va-card-content>
          This protocol has not joined up with Notifi yet. Click to Vote and
          help encourage them to enroll their Contract Events!
        </va-card-content>
        <va-card-actions>
          <va-popover
            color="primary"
            message="Request support for this Protocol on Notifi"
          >
            <va-button size="large" @click="voteFor(protocol)">Vote</va-button>
          </va-popover>
        </va-card-actions>
      </va-card>
    </div>
  </div>
  <div v-show="showCompletion">
    <div class="row pt-2">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";

import { Subscription } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { ContractActivity } from "@/models/ContractActivity";

import Moralis from "moralis";
import { contractsModule } from "@/store/contracts";
import { Contract } from "@/models/Contract";
import ProtocolSelector from "./ProtocolSelector.vue";
import ProtocolInfo from "./ProtocolInfo.vue";

export default defineComponent({
  name: "SubscribeContract",
  components: { ProtocolSelector, ProtocolInfo },
  props: {
    subscription: { type: Subscription, required: false },
    protocol: { type: Protocol, required: false },
  },
  data() {
    return {
      contractAddress: "",
      contractIcon: "" as string | undefined,
      contractActivities: [] as Array<ContractActivity>,
      contractActivityID: undefined as string | undefined,
    };
  },
  setup(props) {
    const intSelectedProtocol = ref<Protocol | undefined>(props.protocol);

    const clearProtocol = () => {
      selectedProtocol.value = undefined;
    };
    const selectProtocol = (prot: Protocol) => {
      selectedProtocol.value = prot;
    };
    const selectedProtocol = computed({
      get(): Protocol | undefined {
        return intSelectedProtocol.value;
      },
      set(val: Protocol | undefined) {
        intSelectedProtocol.value = val;
      },
    });
    const voteFor = async (): Promise<void> => {
      if (!selectedProtocol.value) return undefined;
      await selectedProtocol.value.siteVote();
      //this.$forceUpdate();
    };
    return {
      selectedProtocol,
      selectProtocol,
      clearProtocol,
      voteFor,
    };
  },
  emits: ["changed"],
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
    protocolNoContracts(): boolean {
      if (this.selectedProtocol) return this.contracts.length == 0;
      return false;
    },
    showCompletion(): boolean {
      return this.selectedProtocol != undefined && this.contracts.length > 0;
    },
    canComplete(): boolean {
      return this.selectedProtocol != undefined && this.contracts.length > 0;
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
          msg = `${msg} on the <strong>${this.selectedContract.chain} blockchain</strong>`;
        }
      }
      return msg;
    },
  },
  methods: {
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
