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
</template>

<script lang="ts">
import { defineComponent, inject, getCurrentInstance } from "vue";

import { channelsModule } from "../store/channels";
import { userModule } from "@/store/user";
import { Subscription, SubscriptionTypes } from "@/models/Subscription";

import Moralis from "moralis";
import { UserChannel } from "@/models/Channel";
import { contractsModule } from "@/store/contracts";
import { Chain } from "@/models/Contract";
import { NotifiUser } from "@/models/NotifiUser";
import ContractInput from "./contractInput.vue";

interface channelInfo {
  name: string;
  id: string;
  channel: UserChannel;
}

export default defineComponent({
  name: "SubscribeWallet",
  components: { ContractInput },
  props: {
    subscriptionID: { type: String, required: false },
  },
  data() {
    const app = getCurrentInstance();
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
  emits: ["saved", "cancel"],
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // *********************************
    // MESSAGE - returns the Subscription Definition message for the current selections
    // *********************************
    message(): string {
      let msg = "";
      msg = `Send alerts for transactions in my wallet`;
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
     return this.validWalletSubmit;
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
    async subscribe(): Promise<void> {
      const c = await Subscription.spawn(
        this.subName,
        this.userID(),
        SubscriptionTypes.wallet
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
