<template>
  <div class="flex">
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
        :success="validFrom"
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
        :success="validTo"
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
      <div class="flex xs3">
        <ChainPicker @selected="setChain" required></ChainPicker>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, getCurrentInstance } from "vue";

import { userModule } from "@/store/user";
import { Subscription } from "@/models/Subscription";

import Moralis from "moralis";
import { contractsModule } from "@/store/contracts";
import { Chain } from "@/models/Contract";
import { NotifiUser } from "@/models/NotifiUser";
import ContractInput from "./contractInput.vue";
import ChainPicker from "./ChainPicker.vue";

export default defineComponent({
  name: "SubscribeWallet",
  components: { ContractInput, ChainPicker },
  props: {
    subscriptionID: { type: String, required: false },
  },
  emits: ["changed"],
  data() {
    return {
      subName: "My Subscription",
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
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value(newVal: number, oldVal: number): void {
      if (newVal && parseFloat(newVal.toString())) {
        this.chkValue = true;
      }
    },
    subscription(newSub: Subscription, oldSub: Subscription): void {
      this.subName = newSub.attributes.name;
      this.newFrom = newSub.attributes.fromAddress;
      this.newTo = newSub.attributes.toAddress;
    },
  },
  computed: {
    // Should we enable the Value on/off slider?
    allowValue(): boolean {
      return this.value > 0 && this.valueOp != null;
    },
    // Are we allowed to enter a Value criteria for the current Subscription Type?
    showValue(): boolean {
      return true;
    },
    showChain(): boolean {
      return true;
    },
    chains(): Chain[] {
      return contractsModule.CHAINS;
    },
    showFrom(): boolean {
      return true;
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
        return "";
      },
      set(newValue: string) {
        this.newFrom = newValue;
        if (this.validFrom) this.chkFrom = true;
      },
    },
    showTo(): boolean {
      return true;
    },
    to_address: {
      get() {
        if (this.newTo) {
          return this.newTo;
        }
        return "";
      },
      set(newValue: string) {
        this.newTo = newValue;
        if (this.validTo) this.chkTo = true;
      },
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
      return this.validWalletSubmit;
    },
    validWalletSubmit(): boolean {
      let dupAddresses = false;
      if (this.chkTo && this.chkFrom) {
        dupAddresses = this.to_address == this.from_address;
      }
      return (
        !dupAddresses &&
        (!this.chkTo || this.validTo) &&
        (!this.chkFrom || this.validFrom) &&
        (!this.chkValue || (this.valueOp != null && this.value > 0)) &&
        this.chain != undefined
      );
    },
    message(): string {
      let msg = "Wallet Transactions";
      if (this.chkFrom) {
        msg = `${msg} <br/>received from <strong>${this.from_address}</strong>`;
      }
      if (this.chkTo) {
        msg = `${msg} <br/>sent to <strong>${this.to_address}</strong>`;
      }
      if (this.chkValue) {
        msg = `${msg} <br/>whose <strong>Value is ${this.valueOp} ${this.value}</strong>`;
      }
      if (this.chain != undefined && msg != "") {
        msg = `${msg} <br/>on the <strong>${this.chain} blockchain</strong>`;
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
    setFromAddress(address: string) {
      this.from_address = address;
    },
    setToAddress(address: string) {
      this.to_address = address;
    },
    setChain(c: Chain) {
      this.chain = c;
    },
    irrigate(s: Subscription): Subscription {
      if (this.chkFrom) {
        s.set("fromAddress", this.from_address);
      }
      if (this.chkTo) {
        s.set("toAddress", this.to_address);
      }
      if (this.chkValue) {
        s.set("value", this.value);
        s.set("valueOperator", this.valueOp);
      }
      if (this.chkChain) {
        s.set("chain", this.chain);
      }
      return s;
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
