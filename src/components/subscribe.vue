<template>
  <div class="flex">
    <va-form type="form">
      <div class="row pl-4 pt-2 pb-3 gutter--md">
        <va-card
          class="flex sm3"
          v-for="type in subTypes"
          v-bind:key="type"
          href="#"
          :color="subType == type ? 'info' : '#FFF'"
          :stripe="true"
          :stripe-color="subType == type ? 'info' : 'dark'"
          @click.prevent="this.subType = type"
        >
          <va-card-title>
            <va-icon :name="typeIcon(type)"></va-icon>
            {{ type }}
          </va-card-title>
        </va-card>
      </div>
      <va-collapse
        v-model="showSectionProtocols"
        v-show="showProtocols"
        :header="selectProtocolHeader"
        class="pb-3"
      >
        <div class="protocolCards">
          <ProtocolSelector
            :showSearch="true"
            :showUserInfo="true"
            @selection="selectProtocol"
          ></ProtocolSelector>
        </div>
      </va-collapse>
      <va-divider inset />
      <div>
        <div v-if="showSubGeneral" class="row pt-2">
          <va-select
            class="flex xs12 sm8 md6"
            label="Subscription Category"
            v-model="subGeneralTypeID"
            :options="subGeneralTypes"
            value-by="id"
            text-by="name"
            :rules="[
              (subGeneralTypeID) =>
                subGeneralTypeID != null || 'Select an alert category',
            ]"
          />
          <div
            v-if="this.selectedSubGeneralTypeDescription"
            class="row pt-2 pl-4"
          >
            <div class="flex xs12 sm8 md6">
              <va-card :bordered="false">
                <va-card-title>About these Alerts:</va-card-title>
                <va-card-content>
                  <span v-html="this.selectedSubGeneralTypeDescription"></span>
                </va-card-content>
              </va-card>
            </div>
          </div>
        </div>
        <div class="row pt-2" v-if="showContracts">
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
        <div class="row pt-2" v-if="showContracts">
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
        <div class="row pt-2" v-if="showFrom">
          <va-switch
            class="flex xs2 sm2 lg1 pr-3"
            color="primary"
            :disabled="!validFrom"
            v-model="chkFrom"
          />
          <div v-if="!fromMe" class="flex xs8 sm8 lg9">
            <ContractInput
              label="From Address"
              :chainPrompt="false"
              :showToken="false"
              :initialAddress="from_address"
              :addressOptions="myAddresses"
              @address="setFromAddress"
            >
            </ContractInput>
          </div>
          <va-select
            class="flex xs8 sm8 lg9"
            :options="myAddresses"
            v-if="fromMe"
            label="From Address"
            v-model="from_address"
          />
          <va-checkbox
            vlass="flex xs1 sm1"
            v-model="fromMe"
            checked-icon="person"
          />
        </div>
        <div class="row pt-2" v-if="showTo">
          <va-switch
            class="flex xs2 lg1 pr-3"
            color="primary"
            :disabled="!validTo"
            v-model="chkTo"
          />
          <div v-if="!toMe" class="flex xs8 lg9">
            <ContractInput
              label="To Address"
              :chainPrompt="false"
              :showToken="false"
              :initialAddress="to_address"
              :addressOptions="myAddresses"
              @address="setToAddress"
            >
            </ContractInput>
          </div>
          <va-select
            class="flex xs8 lg9"
            v-if="toMe"
            :options="myAddresses"
            label="To Address"
            v-model="to_address"
          />
          <va-checkbox class="flex xs1" v-model="toMe" checked-icon="person" />
        </div>
        <div class="row pt-2" v-if="showValue">
          <va-switch
            class="flex xs2 lg1"
            color="primary"
            :disabled="!allowValue"
            v-model="chkValue"
          />
          <va-select
            class="flex xs3 lg4"
            label="Transaction value is"
            v-model="valueOp"
            :options="valueOperators"
          />
          <va-input class="flex xs5" label="This Value" v-model="value" />
        </div>
        <div class="row pt-2" v-if="showChain">
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
      <div class="row pt-2">
        <va-divider inset />
        <va-input
          class="flex xs12 sm8 md6"
          label="Subscription Name"
          v-model="subName"
          :rules="[this.validName || 'Enter a valid name']"
        />
      </div>
      <div class="pt-4">
        <va-alert
          class="mb-4"
          color="info"
          :border-color="validSubmit ? 'success' : 'danger'"
          border="top"
        >
          <template v-slot:icon>
            <va-icon
              :name="validSubmit ? 'info' : 'error'"
              :color="validSubmit ? 'primary' : 'danger'"
            ></va-icon>
          </template>
          <template v-slot:title>Subscription Definition:</template>
          <template v-slot:default><span v-html="message"></span></template>
        </va-alert>
      </div>
      <div class="row pt-2 pb-3">
        <div class="flex xs12 sm5 md5">
          <h3>Send these alerts to:</h3>
          <va-option-list
            type="switch"
            label="Select channels for alerts"
            v-model="newChannelIDs"
            :options="myChannels"
            valueBy="id"
            textBy="name"
            class="pb-3"
          />
        </div>
        <div class="flex xs12 sm7 md5 lg4 offset-lg-3">
          <va-button
            class="flex mr-2"
            :disabled="!validSubmit"
            @click.prevent="subscribe"
            color="primary"
            icon-right="create"
            size="large"
            >Create</va-button
          >
          <va-button
            class="flex"
            @click.prevent="this.$emit('cancel')"
            color="danger"
            icon-right="close"
            size="large"
            >Cancel</va-button
          >
        </div>
      </div>
    </va-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, getCurrentInstance } from "vue";

import { channelsModule } from "../store/channels";
import { userModule } from "@/store/user";
import { Subscription, SubscriptionTypes } from "@/models/Subscription";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import { ActivityType, ContractActivity } from "@/models/ContractActivity";

import Moralis from "moralis";
import { UserChannel } from "@/models/Channel";
import { contractsModule } from "@/store/contracts";
import { Contract, Chain } from "@/models/Contract";
import { NotifiUser } from "@/models/NotifiUser";
import ProtocolSelector from "./ProtocolSelector.vue";
import ContractInput from "./contractInput.vue";

//import Moralis from "moralis/types";
// let tx: Moralis.TransactionResult | null = null;
let tx: Record<string, unknown> | null = null;

interface channelInfo {
  name: string;
  id: string;
  channel: UserChannel;
}

interface protocolInfo {
  name: string;
  iconURL: string;
  protocol: Protocol;
}

interface TokenBalance {
  balance: number;
  decimals: number;
  logo: string;
  name: string;
  symbol: string;
  thumbnail: string;
  token_address: string;
}

let allSubTypes: SubscriptionTypes[] = [
  SubscriptionTypes.protocol,
  SubscriptionTypes.wallet,
  SubscriptionTypes.contract,
];

export default defineComponent({
  name: "Subscribe",
  components: { ProtocolSelector, ContractInput },
  props: {
    transaction: { type: tx, required: false },
    subscription: { type: Subscription, required: false },
    protocol: { type: Protocol, required: false },
  },
  data() {
    const app = getCurrentInstance();
    return {
      showSectionProtocolsVal: true,
      intSelectedProtocol: this.protocol,
      subName: "My Subscription",
      subType: SubscriptionTypes.protocol as SubscriptionTypes,
      subTypes: allSubTypes,
      subGeneralTypeID: "",
      subGeneralTypes: [] as SubscriptionType[],
      newChannelIDs: [] as string[],
      chain: "avalanche" as Chain,
      validation: null,
      chkFrom: false,
      allowFrom: true,
      newFrom: "",
      myFromAddress: "",
      fromMe: true,
      chkTo: false,
      allowTo: true,
      newTo: "",
      toMe: false,
      myToAddress: "",
      chkValue: false,
      value: 0,
      valueOp: "",
      valueOperators: ["=", ">", "<"],
      chkChain: true,
      myTokens: [] as TokenBalance[],
      contractAddress: "",
      contractIcon: "" as string | undefined,
      chkContract: false,
      contractActivities: [] as Array<ContractActivity>,
      contractActivityID: undefined as string | undefined,
    };
  },
  setup(props) {
    const user: NotifiUser | undefined = inject("user");
    const app = getCurrentInstance();
    const vaToast = app?.appContext.config.globalProperties.$vaToast;
    const showToast = vaToast.init;

    return {
      user,
      showToast,
    };
  },
  emits: ["saved", "cancel"],
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    subscription(newSub: Subscription, oldSub: Subscription): void {
      this.subName = newSub.attributes.name;
      this.subType = newSub.attributes.name;
      this.newFrom = newSub.attributes.fromAddress;
      this.newTo = newSub.attributes.toAddress;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedProtocol(newProtocol: string, oldProtocol: string) {
      this.contractAddress = "";
      this.contractActivityID = "";
      this.chain = this.protocolChains[0];
      this.fetchSubGeneralTypes();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contractAddress(newAddress: string, oldAddress: string) {
      this.fetchContractActivities();
    },
  },
  computed: {
    showSectionProtocols: {
      get() {
        return this.showSectionProtocolsVal;
      },
      set(newValue: boolean) {
        this.showSectionProtocolsVal = newValue;
      },
    },
    selectProtocolHeader(): string {
      if (this.selectedProtocol) {
        return `Protocol: ${this.selectedProtocolName}`;
      } else {
        return "Select a Protocol";
      }
    },
    selectedProtocolName(): string {
      const p = this.intSelectedProtocol;
      if (!p) {
        return "";
      } else {
        return p.name;
      }
    },
    selectedProtocol: {
      get(): Protocol | undefined {
        return this.intSelectedProtocol;
      },
      set(val: Protocol) {
        this.intSelectedProtocol = val;
        this.showSectionProtocols = false;
      },
    },
    // Should we enable the Value on/off slider?
    allowValue(): boolean {
      return this.value > 0 && this.valueOp != null;
    },
    // Are we allowed to enter a Value criteria for the current Subscription Type?
    showValue(): boolean {
      return (
        this.subType == SubscriptionTypes.wallet ||
        (this.subType == SubscriptionTypes.contract &&
          this.selectedContractActivity?.type == "Transaction")
      );
    },
    showChain(): boolean {
      return this.subType == SubscriptionTypes.wallet;
    },
    showContracts(): boolean {
      return this.subType == SubscriptionTypes.contract;
    },
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
    showProtocols(): boolean {
      return (
        this.subType == SubscriptionTypes.protocol ||
        this.subType == SubscriptionTypes.contract
      );
    },
    protocols(): protocolInfo[] {
      return protocolsModule.allProtocols.map((e: Protocol) => {
        return {
          name: e.get("name"),
          iconURL: e.get("iconURL"),
          id: e.id,
          protocol: e,
        };
      });
    },
    protocolChains(): Chain[] {
      const res = [] as Chain[];
      if (this.selectedProtocol) {
        const chainNames: string[] = this.selectedProtocol.get("chains");
        chainNames.forEach((cn) => {
          const aChain = this.chains.find((c) => c == cn);
          if (aChain) {
            res.push(aChain);
          }
        });
      }
      return res;
    },
    chains(): Chain[] {
      return contractsModule.CHAINS;
    },
    showSubGeneral(): boolean {
      return this.subType == SubscriptionTypes.protocol;
    },
    selectedSubGeneralTypeName(): string | undefined {
      const t = this.selectedSubGeneralType;
      return t?.name;
    },
    selectedSubGeneralTypeDescription(): string | undefined {
      const t = this.selectedSubGeneralType;
      return t?.description;
    },
    selectedSubGeneralType(): SubscriptionType | undefined {
      const t = this.subGeneralTypes.find(
        (e) => e.id === this.subGeneralTypeID
      );
      return t;
    },
    myChannels(): channelInfo[] {
      return channelsModule.myChannels.map((v) => {
        const p = v.providerName;
        return {
          name: `${v.attributes.name} - (${p})`,
          channel: v,
          id: v.id,
        };
      });
    },
    newChannels(): UserChannel[] {
      const res: UserChannel[] = this.newChannelIDs.map((id): UserChannel => {
        const rec = this.myChannels.find((e) => e.id === id);
        if (rec) {
          return rec.channel;
        }
        throw "Missing ID to Channel Group Mapping";
      });
      return res;
    },
    showFrom(): boolean {
      return this.subType == SubscriptionTypes.wallet;
    },
    myAddresses(): string[] {
      if (this.user) {
        return this.user.get("accounts");
      }
      return [];
    },
    from_address: {
      get() {
        if (this.newFrom) {
          return this.newFrom;
        }
        return this.transaction?.from_address;
      },
      set(newValue: string) {
        this.newFrom = newValue;
        if (this.validFrom) this.chkFrom = true;
      },
    },
    showTo(): boolean {
      return this.subType == SubscriptionTypes.wallet;
    },
    to_address: {
      get() {
        if (this.newTo) {
          return this.newTo;
        }
        return this.transaction?.to_address;
      },
      set(newValue: string) {
        this.newTo = newValue;
        if (this.validTo) this.chkTo = true;
      },
    },
    // *********************************
    // MESSAGE - returns the Subscription Definition message for the current selections
    // *********************************
    message(): string {
      let msg = "";
      if (this.selectedProtocolName) {
        msg = `Send alerts for the <strong>${this.selectedProtocolName} Protocol</strong>`;
      } else {
        msg = `Send alerts `;
      }
      if (this.subType === SubscriptionTypes.contract) {
        msg = `${msg} which trigger on`;
        if (this.selectedContractActivity?.type == "Transaction") {
          msg = `${msg} <strong>Transactions</strong>`;
        } else if (this.selectedContractActivity?.type == ActivityType.event) {
          msg = `${msg} the event <strong>${this.selectedContractActivity.name}</strong>`;
        } else {
          msg = `${msg} <strong>[Select an Activity]</strong>`;
        }
        if (this.selectedContract) {
          msg = `${msg} for the contract <strong>${this.selectedContract.description}</strong>`;
        }
      } else if (this.subType === SubscriptionTypes.protocol) {
        msg = `${msg} for Protocol Alerts about <strong>${
          this.selectedSubGeneralTypeName || "[Select a Type above]"
        }</strong>`;
      } else if (this.subType === SubscriptionTypes.wallet) {
        msg = `${msg} for transactions in my wallet`;
      }
      if (this.chkFrom) {
        msg = `${msg} <br/>received from <strong>${this.from_address}</strong>`;
      }
      if (this.chkTo) {
        msg = `${msg} <br/>sent to <strong>${this.to_address}</strong>`;
      }
      if (this.chkValue) {
        msg = `${msg} <br/>whose <strong>Value is ${this.valueOp} ${this.value}</strong>`;
      }
      if (
        this.subType != SubscriptionTypes.protocol &&
        this.chain != undefined &&
        msg != ""
      ) {
        msg = `${msg} on the <strong>${this.chain} blockchain</strong>`;
      }
      msg = `${msg}<br/>Name this subscription <strong>${this.subName}</strong>`;

      return msg;
    },
    validName(): boolean {
      return this.subName.length > 3;
    },
    validTo(): boolean {
      return (
        this.to_address?.length == 42 && this.from_address !== this.to_address
      );
    },
    validFrom(): boolean {
      return (
        this.from_address?.length == 42 && this.from_address !== this.to_address
      );
    },
    validSubmit(): boolean {
      if (this.subType == SubscriptionTypes.protocol) {
        return this.validGeneralSubmit;
      } else if (this.subType == SubscriptionTypes.contract) {
        return this.validContractSubmit;
      } else if (this.subType == SubscriptionTypes.wallet) {
        return this.validWalletSubmit;
      }
      return false;
    },
    validWalletSubmit(): boolean {
      let dupAddresses = false;
      if (this.chkTo && this.chkFrom) {
        dupAddresses = this.to_address == this.from_address;
      }
      return (
        this.validName &&
        !dupAddresses &&
        (!this.chkTo || this.validTo) &&
        (!this.chkFrom || this.validFrom) &&
        (!this.chkValue || (this.valueOp != null && this.value > 0)) &&
        this.chain &&
        this.newChannels?.length > 0
      );
    },
    validContractSubmit(): boolean {
      return (
        this.selectedProtocolName != "" &&
        this.validName &&
        this.selectedContract != undefined &&
        this.selectedContractActivity != undefined &&
        this.activityAllowed &&
        this.newChannels?.length > 0
      );
    },
    validGeneralSubmit(): boolean {
      return (
        this.selectedProtocolName != "" &&
        this.validName &&
        this.subGeneralTypeID != "" &&
        this.newChannels?.length > 0
      );
    },
  },
  methods: {
    // returns the current user or raises an error if none
    typeIcon(t: SubscriptionTypes): string {
      if (t == SubscriptionTypes.wallet) {
        return "account_balance_wallet";
      } else if (t == SubscriptionTypes.protocol) {
        return "announcement";
      } else if (t == SubscriptionTypes.contract) {
        return "gavel";
      }
      return "";
    },
    typeContent(t: SubscriptionTypes): string {
      if (t == SubscriptionTypes.wallet) {
        return "Alerts for your wallets.";
      } else if (t == SubscriptionTypes.protocol) {
        return "Ad Hoc from Protocols";
      } else if (t == SubscriptionTypes.contract) {
        return "Smart contract alerts for events on the chain";
      }
      return "";
    },
    userID(): string {
      if (userModule.user?.id) {
        return userModule.user.id;
      } else {
        console.error("UserID is unset");
        throw "UserID is unset";
      }
    },
    setFromAddress(address: string) {
      this.from_address = address;
    },
    setToAddress(address: string) {
      this.to_address = address;
    },
    async fetchSubGeneralTypes(): Promise<void> {
      const q = new Moralis.Query(SubscriptionType);
      q.equalTo("protocol", this.selectedProtocol);
      q.equalTo("status", SubscriptionTypeStatus.active);
      const res = await q.find();
      this.subGeneralTypeID = "";
      this.subGeneralTypes = res;
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
    isValidContractAddress(address: string) {
      const web3 = new Moralis.Web3();
      return web3.utils.isAddress(address);
    },
    async subscribe(): Promise<void> {
      const c = await Subscription.spawn(
        this.subName,
        this.userID(),
        this.subType,
        this.selectedProtocol
      );
      c.set("description", this.message);
      if (this.chkFrom) {
        c.set("fromAddress", this.from_address);
      }
      if (this.chkTo) {
        c.set("toAddress", this.to_address);
      }
      if (this.chkValue) {
        c.set("value", this.value);
        c.set("valueOperator", this.valueOp);
      }
      if (this.chkChain) {
        c.set("chain", this.chain);
      }
      if (this.selectedSubGeneralType) {
        c.set("GeneralSubType", this.selectedSubGeneralType);
      }
      if (this.selectedContract) {
        c.set("contract", this.selectedContract);
        c.set("contractAddress", this.selectedContract.address);
        c.set("contractChain", this.selectedContract.get("chain"));
      }
      if (this.selectedContractActivity) {
        if (this.selectedContractActivity.type == "Event")
          c.set("contractActivity", this.selectedContractActivity);
      }
      var acl = Subscription.getACL(Moralis.User.current());
      c.setACL(acl);
      const myChans = c.relation("UserChannel");
      myChans.add(this.newChannels);
      const context = { insert: true };
      try {
        const uc = await c.save(null, { context: context });
        this.showToast({
          message: "Subscription added successfully!",
          color: "success",
        });
        this.$router.push({ name: "Home" });
      } catch (error: any) {
        console.log("ERROR-" + error.message);
        this.showToast({
          message: "Subscription failed - " + error.message,
          color: "danger",
          icon: "error",
        });
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
