<template>
  <div>
    <va-data-table :items="myChannels" :columns="columns">
      <template #header(name)>Name</template>
      <template #header(provider)>Provider</template>
      <template #header(subscriptionCount)>Subscriptions</template>
      <template #header(id)></template>
      <template #cell(id)="{ source: id }">
        <va-button size="small" @click="remove(id)" icon="delete"></va-button>
      </template>
    </va-data-table>
    <div class="flex pl-2 pt-3">
      <va-button
        @click.prevent="this.showAdd = true"
        :disabled="addNotAllowed"
        size="small"
        icon-right="add"
        class="mr-4"
      ></va-button>
    </div>
    <va-modal v-model="showAdd" hide-default-actions overlay-opacity="0.2">
      <template #header>
        <h2>Setup a Channel to Receive Alerts</h2>
      </template>
      <slot>
        <va-input class="pt-2" v-model="name" label="Name"> </va-input>
        <va-select
          class="pt-2"
          v-model="newChannel"
          label="Provider"
          :options="availableChannels"
          track-by="id"
          value-by="id"
          text-by="name"
        />
        <Twilio
          v-if="newChannel == 'twilio'"
          @providerData="this.setProviderData"
        ></Twilio>
        <Discord
          v-if="newChannel == 'discord'"
          @providerData="this.setProviderData"
        ></Discord>
        <Email
          v-if="newChannel == 'email'"
          @providerData="this.setProviderData"
        ></Email>
      </slot>
      <template #footer>
        <va-button @click.prevent="add" :disabled="!this.addValid"
          >Add</va-button
        >
        <va-button @click.prevent="this.showAdd = false"> Cancel </va-button>
      </template>
    </va-modal>
  </div>
</template>

<script lang="ts">
import { userModule } from "../store/user";
import { defineComponent } from "vue";
import { ChannelModel, UserChannel, UserChannelStatus } from "../models/Channel";
import { channelsModule } from "../store/channels";
import Twilio from "@/components/TwilioAdd.vue";
import Discord from "@/components/DiscordAdd.vue";
import Email from "@/components/EmailAdd.vue";
import Moralis from "moralis";

type ProviderData = Record<string, string | undefined>;

export default defineComponent({
  name: "Channels",
  components: { Twilio, Discord, Email },
  data() {
    const columns = [
      { key: "id", label: "Remove", sortable: false },
      { key: "name", label: "Name", sortable: true },
      { key: "providerName", label: "Provider", sortable: true },
      { key: "status", label: "Status", sortable: false },
    ];
    const pd: ProviderData | undefined = { to: undefined };
    return {
      newChannel: "",
      name: "",
      showAdd: false,
      columns: columns,
      providerData: pd,
    };
  },
  computed: {
    channels(): ChannelModel[] {
      return channelsModule.channels;
    },
    myChannels(): UserChannel[] {
      return channelsModule.myChannels;
    },
    availableChannels(): ChannelModel[] {
      let base = this.channels;
      const cur = channelsModule.myChannels;
      const res = base.filter((e) => {
        return (
          e.multiple ||
          !cur.some((curElem) => e.id === curElem.attributes.providerID)
        );
      });
      return res;
    },
    addNotAllowed(): boolean {
      return this.availableChannels.length == 0;
    },
    addValid(): boolean {
      return (
        this.name.length > 1 &&
        this.newChannel.length > 0 &&
        this.providerData != undefined
      );
    },
  },
  methods: {
    setProviderData(pd: ProviderData): void {
      this.providerData = pd;
    },
    async remove(id: string): Promise<void> {
      console.log(id);
      const res: UserChannel | undefined = channelsModule.myChannels.find(
        (e) => e.id === id
      );
      if (res) {
        res.destroy().then(
          (myObject: UserChannel): void => {
            console.log("Deleted " + myObject.id);
          },
          (error: Error) => {
            alert("Delete Failed  " + error.message);
          }
        );
      }
    },
    async add(): Promise<void> {
      if (!userModule.user) {
        throw "Login required";
      }
      const c = UserChannel.spawn(
        this.name,
        userModule.user?.id,
        this.newChannel
      );
      c.setProviderData(this.providerData);
      var acl = new Moralis.ACL();
      acl.setReadAccess(Moralis.User.current().id, true);
      acl.setWriteAccess(Moralis.User.current().id, true);
      acl.setRoleReadAccess("admins", true);
      acl.setRoleWriteAccess("admins", true);
      c.setACL(acl);
      const context = { action: "insert"}
      c.save(null, { context: context}).then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (uc: UserChannel) => {
          // Execute any logic that should take place after the object is saved.
          this.showAdd = false;
        },
        (error: { message: string }) => {
          // Execute any logic that should take place if the save fails.
          // error is a Moralis.Error with an error code and message.
          alert(
            "Failed to create new object, with error code: " + error.message
          );
        }
      );
    },
  },
});
</script>

<style scoped></style>
