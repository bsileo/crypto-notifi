<template>
  <div class="flex">
    <va-form type="form">
      <div class="row pt-2">
        <va-select
          class="flex sm12"
          label="Subscription Type"
          v-model="subType"
          :options="subTypes"
          :rules="[(subType) => subType != null || 'Select a type']"
        />
      </div>
      <div v-if="showProtocols" class="row pt-3 pb-1">
        <h2>Select a protocol:</h2>
      </div>
      <div v-if="showProtocols" class="row pt-2 pb-4">
        <va-card
          class="flex sm6 md4 lg3 mr-2"
          :class="{ active: this.selectedProtocolName == protocolInfo.name }"
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
            <a :href="protocolInfo.protocol.tokenContractURL()" target="_frame">
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
      <div class="row pt-2" v-if="showSubGeneral">
        <va-select
          class="flex sm12"
          label="Update Category"
          v-model="subGeneralType"
          :options="subGeneralTypes"
          value-by="type"
          text-by="name"
          :rules="[
            (subGeneralType) => subGeneralType != null || 'Select a type',
          ]"
        />
      </div>
      <div class="row pt-2" v-if="showContracts">
        <va-select
          class="flex sm2"
          label="Chain"
          v-model="chain"
          :options="chains"
          :rules="[this.chain != undefined || 'Select a chain']"
        />
        <va-select
          class="flex sm5"
          label="Contract Address"
          v-model="contractAddress"
          :options="contracts"
          :track-by="(option) => option.id"
          value-by="id"
          text-by="short_address"
          allowCreate
          @create-new="addNewContract"
          :rules="[this.validContract || 'Enter a valid contract address']"
        />
        <va-select
          class="flex sm3"
          label="Contract Actvity"
          v-model="contractActivityInfoID"
          :options="contractActivities"
          track-by="id"
          value-by="id"
          text-by="name"
          searchable
        />
        <va-avatar
          v-if="contractIcon != null"
          class="flex sm1"
          :src="contractIcon"
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
      <div class="row pt-2">
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
    <VAToast></VAToast>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, getCurrentInstance } from "vue";

import { channelsModule, providerFor } from "../store/channels";
import { userModule } from "@/store/user";
import { Subscription, SubscriptionType } from "@/models/Subscription";
import { Protocol, ProtocolLevel } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";
import { ContractActivity } from "@/models/ContractActivity";

import Moralis from "moralis";
import { UserChannel } from "@/models/Channel";
import { contractsModule } from "@/store/contracts";
import { Contract, Chain, ContractStatus } from "@/models/Contract";
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

interface ContractActivityInfo {
  id: string;
  name: string;
  type: "Event" |"Transaction";
  activity: ContractActivity | undefined;
}

interface subGeneralTypeInfo {
  type: string;
  name: string;
}
let sgti: subGeneralTypeInfo[] = [];

interface ContractInfo {
  id: string;
  address: string;
  short_address?: string;
  contract: Contract;
  status?: ContractStatus;
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
const tokenBal: TokenBalance[] = [];

let iconPath: string | undefined = undefined;
let allSubTypes: AlertTypes[] = [
  AlertTypes.protocol,
  AlertTypes.wallet,
  AlertTypes.contract,
];
let subType: AlertTypes = AlertTypes.protocol;
let prot: Protocol | undefined = undefined;

export default defineComponent({
  name: "Subscribe",
  components: {},
  props: {
    transaction: tx,
    subscription: Subscription,
  },
  data() {
    return {
      selectedProtocolName: "",
      selectedProtocol: prot,
      subName: "My Subscription",
      subType: subType,
      subTypes: allSubTypes,
      subGeneralType: "",
      subGeneralTypes: sgti,
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
      contractActivities: [] as Array<ContractActivityInfo>,
      contractActivityInfoID: undefined as string | undefined,
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
      this.contractActivityInfoID = "";
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
    // Should we enable the Value on/off slider?
    allowValue(): boolean {
      return this.value > 0 && this.valueOp != null;
    },
    // Are we allowed to enter a Value criteria for the current Subscription Type?
    showValue(): boolean {
      return (
        this.subType == AlertTypes.wallet ||
        (this.subType == AlertTypes.contract &&
          this.selectedContractActivityInfo?.type == "Transaction")
      );
    },
    cardColor(aProtocolName: string): string {
      if (aProtocolName == this.selectedProtocolName) {
        return "primary";
      } else {
        return "dark";
      }
    },
    showContracts(): boolean {
      return this.subType == AlertTypes.contract;
    },
    selectedContractInfo(): ContractInfo | undefined {
      return this.contracts.find((e) => e.id == this.contractAddress);
    },
    selectedContractActivityInfo(): ContractActivityInfo | undefined {
      return this.contractActivities.find(
        (e) => e.id == this.contractActivityInfoID
      );
    },
    validContract(): boolean {
      return true;
    },
    contracts(): ContractInfo[] {
      if (this.selectedProtocol) {
        return contractsModule.allContracts
          .filter((c) => c.get("protocol").id == this.selectedProtocol?.id)
          .map((elem) => {
            const addr = elem.get("address");
            const sh_address =
              addr.slice(1, 6) + "..." + addr.substring(addr.length - 4);
            return {
              id: elem.id,
              address: addr,
              short_address: sh_address,
              contract: elem,
              status: elem.status,
            };
          });
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
    chains(): Chain[] {
      return contractsModule.CHAINS;
    },
    showSubGeneral(): boolean {
      return this.subType == AlertTypes.protocol;
    },
    selectedSubGeneralTypeName(): string | undefined {
      const t = this.subGeneralTypes.find(
        (e) => e.type === this.subGeneralType
      );
      return t?.name;
    },
    myChannels(): channelInfo[] {
      return channelsModule.myChannels.map((v) => {
        const p = providerFor(v.attributes.providerID);
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
        msg = `Create an alert for the <strong>${this.selectedProtocolName} Protocol</strong> called <strong>${this.subName}</strong>`;
      }
      if (this.subType === AlertTypes.contract) {
        msg = `${msg} which triggers on`;
        if (this.selectedContractActivityInfo?.type == "Transaction") {
          msg = `${msg} transactions`;
        } else if (this.selectedContractActivityInfo?.type == "Event") {
          msg = `${msg} the event <strong>${this.selectedContractActivityInfo.name}</strong>`;
        } else {
          msg = `${msg} <strong>[Select an Activity]</strong>`;
        }
        if (this.selectedContractInfo) {
          msg = `${msg} for the contract ${this.selectedContractInfo.address}`;
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
        this.subGeneralType != "" &&
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
      const q = new Moralis.Query("GeneralSubscriptionTypes");
      q.equalTo("protocol", this.selectedProtocolName);
      console.log("Fetch Genaral Subtypes");
      const res = await q.find();
      this.selectedSubGeneralTypeName = "";
      this.subGeneralTypes = res.map((e: SubscriptionType) => {
        return {
          type: e.get("type"),
          name: e.get("name"),
        };
      });
    },
    async fetchContractActivities(): Promise<void> {
      const tx: ContractActivityInfo = {
        name: "Transaction",
        activity: undefined,
        type: "Transaction",
        id: "tx",
      };
      const res = [tx];
      const ci = this.selectedContractInfo;
      if (ci) {
        const actsRel = ci.contract.relation("ContractActivities");
        const acts = await actsRel.query().find();
        for (let i = 0; i < acts.length; i = i + 1) {
          res.push({
            name: acts[i].get("name"),
            activity: acts[i],
            type: "Event",
            id: acts[i].id,
          });
        }
      }
      this.selectedContractActivityInfo = undefined;
      this.contractActivities = res;
    },
    addNewContract(address: string): boolean {
      console.log(address);
      if (this.isValidContractAddress(address)) {
        const c = Contract.spawn(this.chain, address);
        c.set("protocol", this.selectedProtocol);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        c.save().then((c: Contract) => {
          getCurrentInstance()?.appContext.config.globalProperties.$vaToast.init(
            {
              message:
                "This Contract was added in 'Requested Status'. Complete your Subscription to be alerted when it is enabled for alerts.",
              color: "warning",
            }
          );
        });
      } else {
        console.log("INVALID");
        getCurrentInstance()?.appContext.config.globalProperties.$vaToast.init({
          message: "Enter a valid contract address.",
          color: "error",
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
      const c = Subscription.spawn(
        this.selectedProtocolName,
        this.subName,
        this.userID(),
        this.newChannels,
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
      if (this.subGeneralType) {
        c.set("generalType", this.subGeneralType);
      }
      if (this.selectedContractInfo) {
        c.set("contract", this.selectedContractInfo.contract);
        c.set(
          "contractAddress",
          this.selectedContractInfo.contract.get("address")
        );
        c.set("contractChain", this.selectedContractInfo.contract.get("chain"));
        console.log(c);
      }
      if (this.selectedContractActivityInfo) {
        if (this.selectedContractActivityInfo.type == "Event")
          c.set("contractActivity", this.selectedContractActivityInfo.activity);
      }
      c.save().then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (uc: Subscription) => {
          // Execute any logic that should take place after the object is saved.
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
