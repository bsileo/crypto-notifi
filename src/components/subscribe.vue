<template>
  <div class="flex">
    <va-form type="form">
      <div class="row pt-2 pb-3">
        <va-select
          class="flex sm12 pt-1"
          v-model="subType"
          label="Select Alert Type"
          :options="subTypes"
          :rules="[(subType) => subType != null || 'Select a type']"
        />
      </div>
      <va-collapse
        v-model="showSectionProtocols"
        v-if="showProtocols"
        :header="selectProtocolHeader"
        class="pb-3"
      >
        <div class="row pt-2 pb-4">
          <va-card
            class="flex sm6 md4 lg3 mr-2"
            :class="{
              active: this.selectedProtocolName == protocolInfo.name,
            }"
            :dark="this.selectedProtocolName == protocolInfo.name"
            :stripe="this.selectedProtocolName == protocolInfo.name"
            stripe-color="success"
            v-bind:key="protocolInfo.id"
            v-for="protocolInfo in protocols"
          >
            <va-card-title>{{ protocolInfo.name }}</va-card-title>
            <va-image contain :src="protocolInfo.iconURL">
              <template #error> Image not found! :( </template>
              <template #loader>
                <va-progress-circle indeterminate />
              </template>
            </va-image>
            <div>
              Token:
              <a
                :href="protocolInfo.protocol.tokenContractURL()"
                target="_frame"
              >
                {{ protocolInfo.protocol.get("tokenData")?.symbol }}</a
              >
            </div>
            <div>Balance: {{ getWalletBalance(protocolInfo.protocol) }}</div>
            <div>Level: {{ getProtocolLevel(protocolInfo.protocol) }}</div>
            <va-card-actions align="between">
              <va-button
                @click="
                  selectedProtocolName = protocolInfo.name;
                  selectedProtocol = protocolInfo.protocol;
                "
                >Select</va-button
              >
            </va-card-actions>
          </va-card>
        </div>
      </va-collapse>
      <div>
        <div v-if="showSubGeneral" class="row pt-2">
          <va-select
            class="flex sm12"
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
            class="flex sm12 pt-2 pl-4"
          >
            <va-card :bordered="false">
              <va-card-title></va-card-title>
              <va-card-content>
                <span v-html="this.selectedSubGeneralTypeDescription"></span>
              </va-card-content>
            </va-card>
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
            label="Contract Address"
            v-model="contractAddress"
            :options="contracts"
            :track-by="(option) => option.id"
            value-by="id"
            text-by="description"
            allowCreate
            @create-new="addNewContract"
            :rules="[this.validContract || 'Enter a valid contract address']"
          />
          <va-select
            class="flex sm3"
            label="Contract Activity"
            v-model="contractActivityID"
            :options="contractActivities"
            track-by="id"
            value-by="id"
            :text-by="(option) => option.name || option.get('name')"
            searchable
          />
        </div>
        <div class="row pt-2" v-if="showFrom">
          <va-switch
            class="flex sm1 pr-3"
            color="primary"
            :disabled="!validFrom"
            v-model="chkFrom"
          />
          <va-input
            class="flex sm10"
            label="From Address"
            v-model="from_address"
            :rules="[this.validFrom || 'Enter a valid contract/wallet address']"
          />
          <va-avatar v-if="fromIcon != null" class="flex sm1" :src="fromIcon" />
        </div>
        <div class="row pt-2" v-if="showTo">
          <va-switch
            class="flex sm1 pr-3"
            color="primary"
            :disabled="!validTo"
            v-model="chkTo"
          />
          <va-input
            class="flex sm10"
            label="To Address"
            v-model="to_address"
            :rules="[this.validTo || 'Enter a valid contract/wallet address']"
          />
          <va-avatar
            v-if="this.validTo && toIcon != null"
            class="flex sm1"
            :src="toIcon"
          />
        </div>
        <div class="row pt-2" v-if="showValue">
          <va-switch
            class="flex sm2"
            color="primary"
            :disabled="!allowValue"
            v-model="chkValue"
          />
          <va-select
            class="flex sm3"
            label="Transaction value is"
            v-model="valueOp"
            :options="valueOperators"
          />
          <va-input class="flex sm5" label="This Value" v-model="value" />
        </div>
      </div>
      <div class="row pt-2">
        <va-divider inset />
        <va-input
          class="flex sm11"
          label="Subscription Name"
          size="large"
          v-model="subName"
          :rules="[this.validName || 'Enter a valid name']"
        />
      </div>
      <div class="pt-4">
        <va-alert
          class="mb-4"
          icon="info"
          color="info"
          border-color="success"
          border="top"
        >
          <template v-slot:title>Subscription Definition:</template>
          <template v-slot:default><span v-html="message"></span></template>
        </va-alert>
      </div>
      <div class="row pt-2">
        <div class="flex sm9">
          <h3>Send these alerts to:</h3>
          <va-option-list
            type="switch"
            label="Select channels for alerts"
            v-model="newChannelIDs"
            :options="myChannels"
            valueBy="id"
            textBy="name"
          />
        </div>
        <div class="flex sm3">
          <va-button
            class="flex"
            :disabled="!validSubmit"
            @click.prevent="subscribe"
            color="danger"
            icon-right="create"
            size="large"
            >Create</va-button
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
import { Subscription } from "@/models/Subscription";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol, ProtocolLevel } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import { ActivityType, ContractActivity } from "@/models/ContractActivity";

import Moralis from "moralis";
import { UserChannel } from "@/models/Channel";
import { contractsModule } from "@/store/contracts";
import { Contract, Chain } from "@/models/Contract";
import { UserModel } from "@/models/User";
import { AlertTypes } from "@/models/Alert";

//import Moralis from "moralis/types";
// let tx: Moralis.TransactionResult | null = null;
let tx: Record<string, unknown> | null = null;
let channelIDs: string[] = [];
// let channels: UserChannel[] = [];
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

interface ContractTXActivity {
  name: string;
  type: "Transaction";
  id: "tx";
}

type ContractActivitiesSet = ContractTXActivity | ContractActivity;

interface TokenBalance {
  balance: number;
  decimals: number;
  logo: string;
  name: string;
  symbol: string;
  thumbnail: string;
  token_address: string;
}
const tokenBal: TokenBalance[] = [];

let iconPath: string | undefined = undefined;
let allSubTypes: AlertTypes[] = [
  AlertTypes.protocol,
  AlertTypes.wallet,
  AlertTypes.contract,
];
let subType: AlertTypes = AlertTypes.protocol;

export default defineComponent({
  name: "Subscribe",
  components: {},
  props: {
    transaction: tx,
    subscription: Subscription,
  },
  data() {
    const app = getCurrentInstance();
    const vaToast = app?.appContext.config.globalProperties.$vaToast;
    return {
      showSectionProtocolsVal: false,
      showToast: vaToast?.init,
      selectedProtocolName: "",
      intSelectedProtocol: undefined as Protocol | undefined,
      subName: "My Subscription",
      subType: subType,
      subTypes: allSubTypes,
      subGeneralTypeID: "",
      subGeneralTypes: [] as SubscriptionType[],
      newChannelIDs: channelIDs,
      chain: "avalanche" as Chain,
      validation: null,
      chkFrom: false,
      allowFrom: true,
      newFrom: "",
      chkTo: false,
      allowTo: true,
      newTo: "",
      chkValue: false,
      value: 0,
      valueOp: "",
      valueOperators: ["=", ">", "<"],
      fromIcon: iconPath,
      toIcon: iconPath,
      myTokens: tokenBal,
      contractAddress: "",
      contractIcon: "" as string | undefined,
      chkContract: false,
      contractActivities: [] as Array<ContractActivitiesSet>,
      contractActivityID: undefined as string | undefined,
    };
  },
  setup() {
    const user: UserModel | undefined = inject("user");
    return {
      user,
    };
  },
  emits: ["saved"],
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
  mounted() {
    this.getMyTokens();
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
    selectedProtocol: {
      get() {
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
        this.subType == AlertTypes.wallet ||
        (this.subType == AlertTypes.contract &&
          this.selectedContractActivity?.type == "Transaction")
      );
    },
    showContracts(): boolean {
      return this.subType == AlertTypes.contract;
    },
    selectedContract(): Contract | undefined {
      return this.contracts.find((e) => e.id == this.contractAddress);
    },
    selectedContractActivity(): ContractActivitiesSet | undefined {
      return this.contractActivities.find(
        (e) => e.id == this.contractActivityID
      );
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
        this.subType == AlertTypes.protocol ||
        this.subType == AlertTypes.contract
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
      return this.subType == AlertTypes.protocol;
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
      return this.subType == AlertTypes.wallet;
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
      },
    },
    showTo(): boolean {
      return this.subType == AlertTypes.wallet;
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
      },
    },
    // *********************************
    // MESSAGE - returns the Subscription Definition message for the current selections
    // *********************************
    message(): string {
      let msg = "";
      if (this.selectedProtocolName) {
        msg = `Send an alert for the <strong>${this.selectedProtocolName} Protocol</strong> called <strong>${this.subName}</strong>`;
      }
      if (this.subType === AlertTypes.contract) {
        msg = `${msg} which triggers on`;
        if (this.selectedContractActivity?.type == "Transaction") {
          msg = `${msg} transactions`;
        } else if (this.selectedContractActivity?.type == ActivityType.event) {
          msg = `${msg} the event <strong>${this.selectedContractActivity.name}</strong>`;
        } else {
          msg = `${msg} <strong>[Select an Activity]</strong>`;
        }
        if (this.selectedContract) {
          msg = `${msg} for the contract <strong>${this.selectedContract.description}</strong>`;
        }
      } else if (this.subType === AlertTypes.protocol) {
        msg = `${msg} for Protocol Alerts about <strong>${
          this.selectedSubGeneralTypeName || "[Select a Type above]"
        }</strong>`;
      } else if (this.subType === AlertTypes.wallet) {
        msg = `${msg} for my wallet transactions`;
      }
      if (this.chkFrom) {
        msg = `${msg} received from ${this.from_address}`;
      }
      if (this.chkTo) {
        msg = `${msg} sent to ${this.to_address}`;
      }
      if (this.chkValue) {
        msg = `${msg} whose value is ${this.valueOp} ${this.value}`;
      }
      if (this.chain != undefined && msg != "") {
        msg = `${msg} on the <strong>${this.chain} blockchain</strong>`;
      }

      return msg;
    },
    validName(): boolean {
      return this.subName.length > 3;
    },
    validTo(): boolean {
      return this.to_address?.length == 42;
    },
    validFrom(): boolean {
      return this.from_address?.length == 42;
    },
    validSubmit(): boolean {
      if (this.subType == AlertTypes.protocol) {
        return this.validGeneralSubmit;
      } else {
        return (
          (!this.chkTo || this.validTo) &&
          (!this.chkFrom || this.validFrom) &&
          (!this.chkValue || (this.valueOp != null && this.value > 0)) &&
          this.validName &&
          this.newChannels?.length > 0
        );
      }
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
    userID(): string {
      if (userModule.user.id) {
        return userModule.user.id;
      } else {
        console.error("UserID is unset");
        throw "UserID is unset";
      }
    },
    async fetchSubGeneralTypes(): Promise<void> {
      const q = new Moralis.Query(SubscriptionType);
      q.equalTo("protocol", this.selectedProtocol);
      q.equalTo("status", SubscriptionTypeStatus.active);
      console.log("Fetch Genaral Subtypes");
      const res = await q.find();
      console.log(res);
      this.subGeneralTypeID = "";
      this.subGeneralTypes = res;
    },
    async fetchContractActivities(): Promise<void> {
      const tx: ContractTXActivity = {
        name: "Transaction",
        type: "Transaction",
        id: "tx",
      };
      const res: ContractActivitiesSet[] = [tx];
      const ci = this.selectedContract;
      console.log("Get Acts for ", ci);
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
    addNewContract(address: string): boolean {
      console.log(address);
      if (this.isValidContractAddress(address)) {
        const c = Contract.spawn(this.chain, address);
        c.set("protocol", this.selectedProtocol);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        c.save().then((c: Contract) => {
          this.showToast({
            message:
              "This Contract was added in 'Requested Status'. Complete your Subscription to be alerted when it is enabled for alerts.",
            color: "warning",
          });
        });
      } else {
        console.log("INVALID Contract Address");
        this.showToast({
          message: "Enter a valid contract address.",
          color: "danger",
        });
        return false;
      }
      return true;
    },
    isValidContractAddress(address: string) {
      const web3 = new Moralis.Web3();
      return web3.utils.isAddress(address);
    },
    async subscribe(): Promise<void> {
      console.log("Create/Update subscription");
      const c = await Subscription.spawn(
        this.selectedProtocolName,
        this.subName,
        this.userID(),
        this.subType
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
      if (this.selectedSubGeneralType) {
        c.set("generalType", this.selectedSubGeneralType.type);
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
      c.save().then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (uc: Subscription) => {
          // Execute any logic that should take place after the object is saved.
          uc.setUserChannels(this.newChannels);
          getCurrentInstance()?.appContext.config.globalProperties.$vaToast.init(
            {
              message: "Subscription added successfully!",
              color: "success",
            }
          );
          this.$emit("saved");
        },
        (error: { message: string }) => {
          // Execute any logic that should take place if the save fails.
          // error is a Moralis.Error with an error code and message.
          alert("Failed to save object, with error code: " + error.message);
        }
      );
    },
    async getFromIcon(): Promise<string | undefined> {
      const addr = this.from_address;
      if (addr) {
        this.fromIcon = await this.getIcon(addr);
        return this.fromIcon;
      }
    },
    async getToIcon(): Promise<string | undefined> {
      const addr = this.to_address;
      if (addr) {
        this.toIcon = await this.getIcon(addr);
        return this.toIcon;
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
    getProtocolLevel(p: Protocol): ProtocolLevel {
      const bal = this.getWalletBalance(p);
      if (bal > p.get("tokenData").goldQuantity) {
        return ProtocolLevel.Gold;
      } else if (bal > p.get("tokenData").basicQuantity) {
        return ProtocolLevel.Basic;
      } else {
        return ProtocolLevel.Free;
      }
    },
    getWalletBalance(p: Protocol): number | string {
      let token = undefined;
      if (p.get("tokenData")) {
        token = this.myTokens.find(
          (e) => e?.symbol == p.get("tokenData").symbol
        );
      }
      if (token) {
        return (token.balance / 10 ** token.decimals).toFixed(2);
      }
      return 0;
    },
    async getMyTokens(): Promise<void> {
      // eslint-disable-next-line prettier/prettier
      console.log(userModule.user);
      const options = {
        chain: "avalanche",
        address: this.user?.get("accounts")[0],
      };
      const balances = await Moralis.Web3API.account.getTokenBalances(options);
      this.myTokens = balances;
    },
  },
});
</script>
div.active { background-color: rgb(197 47 47); }
<style scoped></style>
