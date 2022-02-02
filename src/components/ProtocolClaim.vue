<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h1>Claim {{ protocol.name }} Protocol on Notifi</h1>
    </div>
    <div class="row pt-2">
      <p>
        Complete this form to start the process of claiming a protocol on
        Notifi. Once claimed, you will be able to send alerts on behalf of the
        Protocol, manage Protocol Staking Settings and user levels, and
        configure smart contract alerts.
      </p>
    </div>
    <div class="row pt-2">
      <p>
        The following wallet will be associated with this Manager account. After
        the claim is complete, additional Manager wallets can be added for this
        protocol.
      </p>
      <UserWallets :primary="true"></UserWallets>
    </div>
    <div class="row pt-3">
      <va-input
        label="name"
        v-model="name"
        placeholder="Joe Protocol"
      ></va-input>
      <va-input
        label="Discord Server Invite"
        v-model="discordServer"
        placeholder="https://discord.gg/8ryhkfkfk"
      ></va-input>
      <va-input
        label="Discord User Name"
        v-model="discordUser"
        placeholder="@protocolMaster"
      ></va-input>
    </div>
    <div class="row pt-3">
      <va-button @click="save" :disabled="!saveValid">Submit</va-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  ref,
} from "vue";
import Moralis from "moralis";
import { NotifiUser } from "@/models/NotifiUser";
import UserWallets from "@/components/UserWallets.vue";
import { Protocol } from "@/models/Protocol";

export default defineComponent({
  name: "ProtocolClaim",
  components: { UserWallets },
  props: {
    protocol: { type: Protocol, required: true },
  },
  setup(props) {
    const user: NotifiUser | undefined = inject("user");

    const discordUser = ref("");
    const discordServer = ref("");
    const name = ref("");

    const saveValid = computed((): boolean => {
      return (
        discordUser.value != undefined &&
        discordUser.value.length > 3 &&
        discordServer.value != undefined &&
        discordServer.value.length > 3 &&
        name.value != undefined &&
        name.value.length > 3
      );
    });

    return { user, discordUser, discordServer, name, saveValid };
  },
  data() {
    return {};
  },
  methods: {
    async save(): Promise<void> {
      const pi = new Moralis.Query("ProtocolStatus");
      pi.equalTo("Protocol", this.protocol);
      const newPI = await pi.first();
      if (!newPI) {
        throw "Missing Protocol Info";
      }
      newPI.set("ClaimUser", this.user);
      newPI.set("claimName", this.name);
      newPI.set("discordUser", this.discordUser);
      newPI.set("discordServer", this.discordServer);
      try {
        await newPI.save();
        getCurrentInstance()?.appContext.config.globalProperties.$vaToast.init({
          message: "Subscription added successfully!",
          color: "success",
        });
      } catch (error: any) {
        console.log("Claim failed " + error.message);
        getCurrentInstance()?.appContext.config.globalProperties.$vaToast.init({
          message: "Claim Failed",
          color: "danger",
        });
      }
    },
  },
});
</script>

<style scoped></style>
