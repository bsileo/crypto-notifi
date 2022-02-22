<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h1>
        Claim <strong>{{ protocol.name }} Protocol</strong> on Notifi.
      </h1>
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
        label="Manager's Name"
        v-model="name"
        placeholder="Joe Protocol"
      ></va-input>
    </div>
    <div class="row">
      <va-input
        class="flex sm7"
        label="Protocol Discord Server Invite"
        v-model="discordServer"
        placeholder="https://discord.gg/8ryhkfkfk"
      ></va-input>
      <va-input
        class="flex sm5"
        label="Manager's Discord User Name"
        v-model="discordUser"
        placeholder="@protocolMaster"
      ></va-input>
    </div>
  </div>
  <div class="row pt-3">
    <va-button @click="save" :disabled="!saveValid">Submit</va-button>
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
  emits: ["saved"],
  setup(props, { emit }) {
    const user: NotifiUser | undefined = inject("user");
    const app = getCurrentInstance();
    const vaToast = app?.appContext.config.globalProperties.$vaToast;
    const showToast = vaToast.init;

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
    const save = async (): Promise<void> => {
      const ps = new Moralis.Query("ProtocolStatus");
      ps.equalTo("Protocol", props.protocol);
      let newPS = await ps.first();
      if (!newPS) {
        throw "Missing Protocol Info";
      }
      if (!user) {
        throw "User must be set";
      }
      newPS.set("claimStarted", true);
      newPS.set("ClaimUser", Moralis.User.current());
      newPS.set("claimName", name.value);
      newPS.set("discordUser", discordUser.value);
      newPS.set("discordServer", discordServer.value);
      try {
        newPS = await newPS.save();
        /*showToast({
          message: "Subscription added successfully!",
          color: "success",
        });*/
        emit("saved", newPS);
      } catch (error: any) {
        console.log("Claim failed -- " + error.message);
        showToast({
          message: "Claim Failed",
          color: "danger",
        });
      }
    };

    return {
      user,
      showToast,
      discordUser,
      discordServer,
      name,
      saveValid,
      save,
    };
  },
});
</script>

<style scoped></style>
