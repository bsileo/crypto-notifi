<template>
  <div class="flex">
    <va-form type="form">
      <div class="row pt-3 pb-1">
        <h2>Select a protocol:</h2>
      </div>
      <div class="row pt-2 pb-4">
        <va-card
          class="flex sm6 md4 lg3 mr-2"
          :class="{ active: this.selectedProtocol == protocolInfo.name }"
          :dark="this.selectedProtocol == protocolInfo.name"
          :stripe="this.selectedProtocol == protocolInfo.name"
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
              > {{ protocolInfo.protocol.get("tokenData").symbol }}</a
            >
          </div>
          <div>Balance: {{ getWalletBalance(protocolInfo.protocol) }}</div>
          <div>Level: {{ getProtocolLevel(protocolInfo.protocol) }}</div>
          <va-card-actions align="between">
            <va-button @click="selectProtocol(protocolInfo.name)"
              >Select</va-button
            >
          </va-card-actions>
        </va-card>
      </div>
      <div class="row pt-2">
        <va-input
          class="flex sm11"
          label="Name"
          v-model="subName"
          :rules="[this.validName || 'Enter a valid name']"
        />
      </div>
      <div class="row pt-2">
        <va-select
          class="flex sm12"
          label="Subscription Type"
          v-model="subType"
          :options="subTypes"
          value-by="id"
          :text-by="(option) => option.name"
          :rules="[(subType) => subType != null || 'Select a type']"
        />
      </div>
      <div class="row pt-2" v-if="subType == 'General'">
        <va-select
          class="flex sm12"
          label="Type of Updates"
          v-model="subGeneralType"
          :options="subGeneralTypes"
          value-by="type"
          text-by="name"
          :rules="[
            (subGeneralType) => subGeneralType != null || 'Select a type',
          ]"
        />
      </div>
      <div class="row pt-2" v-if="subType == 'Smart Contracts'">
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
      <div class="row pt-2" v-if="subType == 'Smart Contracts'">
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
      <div class="row pt-2" v-if="valueAllowed">
        <va-switch
          class="flex sm2"
          color="primary"
          :disabled="!allowValue"
          v-model="chkValue"
        />
        <va-select
          class="flex sm3"
          label="Transaction is"
          v-model="valueOp"
          :options="valueOperators"
        />
        <va-input class="flex sm5" label="This Value" v-model="value" />
      </div>
      <div class="row pt-2">
        <va-select
          class="flex sm3"
          label="Chain"
          v-model="chain"
          :options="chains"
          textBy="name"
          :rules="[this.chain || 'Select a chain']"
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
import { defineComponent } from "vue";
import { channelsModule, providerFor } from "../store/channels";
import { userModule } from "@/store/user";
import { Subscription, SubscriptionType, Chain } from "@/models/Subscription";
import { Protocol, ProtocolLevel } from "@/models/Protocol";
import { protocolsModule } from "@/store/protocol";

import { inject } from "vue";

import Moralis from "moralis";
import { UserChannel } from "@/models/Channel";
import { subscriptionsModule } from "@/store/subscription";
import { UserModel } from "@/models/User";
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

interface subGeneralTypeInfo {
  type: string;
  name: string;
}
let sgti: subGeneralTypeInfo[] = [];

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
let chain: Chain | undefined = { name: "Avalanche" };

export default defineComponent({
  name: "Subscribe",
  components: {},
  props: {
    transaction: tx,
    subscription: Subscription,
  },
  data() {
    return {
      selectedProtocol: "",
      subName: "My Subscription",
      subType: "",
      subTypes: ["General", "My Wallet(s)", "Smart Contracts"],
      subGeneralType: "",
      subGeneralTypes: sgti,
      newChannelIDs: channelIDs,
      chain: chain,
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
      console.log("WATCHER");
      this.subName = newSub.attributes.name;
      this.subType = newSub.attributes.name;
      this.newFrom = newSub.attributes.fromAddress;
      this.newTo = newSub.attributes.toAddress;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedProtocol(newProtocol: string, oldProtocol: string) {
      this.fetchSubGeneralTypes();
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
    valueAllowed(): boolean {
      return (
        this.subType == "Smart Contracts" || this.subType == "My Wallet(s)"
      );
    },
    cardColor(aProtocol: string) {
      if (aProtocol == this.selectedProtocol) {
        return "primary";
      } else {
        return "dark";
      }
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
      return subscriptionsModule.CHAINS;
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
      if (this.selectedProtocol) {
        msg = `Create an alert for the <strong>${this.selectedProtocol} Protocol</strong> called <strong>${this.subName}</strong>`;
      }
      if (this.subType === "Smart Contract") {
        msg = `${msg} which triggers on transactions<br/>`;
      } else if (this.subType === "General") {
        msg = `${msg} for Community alerts about <strong>${
          this.selectedSubGeneralTypeName || "[Select a Type above]"
        }</strong>`;
      } else if (this.subType === "My Wallet(s)") {
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
        msg = `${msg} on the <strong>${this.chain.name} blockchain</strong>`;
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
      if (this.subType == "General") {
        return this.validGeneralSubmit;
      } else {
        return (
          (!this.chkTo || this.validTo) &&
          (!this.chkFrom || this.validFrom) &&
          (!this.chkValue || (this.valueOp != null && this.value > 0)) &&
          this.validName &&
          this.subType != "" &&
          this.newChannels?.length > 0
        );
      }
    },
    validGeneralSubmit(): boolean {
      return (
        this.selectedProtocol != "" &&
        this.validName &&
        this.subGeneralType != "" &&
        this.newChannels?.length > 0
      );
    },
  },
  methods: {
    selectProtocol(name: string) {
      this.selectedProtocol = name;
    },
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
      q.equalTo("protocol", this.selectedProtocol);
      console.log("Fetch Genaral Subtypes");
      const res = await q.find();
      this.subGeneralTypes = res.map((e: SubscriptionType) => {
        return {
          type: e.get("type"),
          name: e.get("name"),
        };
      });
    },
    async subscribe(): Promise<void> {
      console.log("Create/Update subscription");
      const c = Subscription.spawn(
        this.selectedProtocol,
        this.subName,
        this.userID(),
        this.newChannels,
        this.subType
      );
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
      c.save().then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (uc: Subscription) => {
          // Execute any logic that should take place after the object is saved.
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
      const token = this.myTokens.find(
        (e) => e?.symbol == p.get("tokenData").symbol
      );
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
