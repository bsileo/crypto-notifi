<template>
  <div>
    <va-data-table :items="myChannels" :columns="columns">
      <template #header(name)>Name</template>
      <template #header(provider)>Provider</template>
      <template #header(statusPlus)>Status</template>
      <template #header(id)></template>
      <template #cell(id)="{ source: id }">
        <va-button size="small" @click="remove(id)" icon="delete"></va-button>
      </template>
      <template #cell(statusPlus)="{ source: status, cells: cells }">
        {{ status }}
        <div v-show="status == 'Verification Sent'">
          <a
            style="font-size: smaller"
            href="#"
            @click.prevent="resendVerification(cells)"
            >Resend</a
          >
        </div>
      </template>
    </va-data-table>
    <div class="flex pl-2 pt-3">
      <va-button
        @click.prevent="this.showAdd = true"
        :disabled="addNotAllowed"
        size="medium"
        icon-right="add"
        class="mr-4"
        >Add</va-button
      >
    </div>
    <va-modal v-model="showAdd" hide-default-actions overlay-opacity="0.2">
      <template #header>
        <h2>Setup a Channel to Receive Alerts</h2>
      </template>
      <slot>
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
          @providerData="setProviderData"
        ></Discord>
        <Email
          v-if="newChannel == 'email'"
          @providerData="setProviderData"
        ></Email>
        <Telegram
          v-if="newChannel == 'telegram'"
          @providerData="setProviderData"
        ></Telegram>
        <va-input
          class="pt-2"
          v-model="name"
          label="Channel Name"
          :error="!validName"
        >
        </va-input>
      </slot>
      <template #footer>
        <va-button @click.prevent="add" :disabled="!addValid">Add</va-button>
        <va-button @click.prevent="showAdd = false"> Cancel </va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { userModule } from "../store/user";
import { computed, getCurrentInstance, ref } from "vue";
import { UserChannel } from "../models/Channel";
import { channelsModule } from "../store/channels";
import Twilio from "@/components/TwilioAdd.vue";
import Discord from "@/components/DiscordAdd.vue";
import Email from "@/components/EmailAdd.vue";
import Telegram from "@/components/TelegramAdd.vue";
import Moralis from "moralis";
import { ChannelModel } from "@/notifi_types";

type ProviderData = Record<string, string | boolean | undefined>;

const app = getCurrentInstance();
const vaToast = app?.appContext.config.globalProperties.$vaToast;
const showToast = ref(vaToast.init);

const columns = ref([
  { key: "id", label: "Remove", sortable: false },
  { key: "statusPlus", label: "Status", sortable: false },
  { key: "name", label: "Name", sortable: true },
  { key: "providerName", label: "Provider", sortable: true },
]);

const providerData = ref<ProviderData>({ to: undefined });
const name = ref("");
const intNewChannel = ref("");
const showAdd = ref(false);

const newChannel = computed({
  get() {
    return intNewChannel.value;
  },
  set(v: string) {
    intNewChannel.value = v;
    if (name.value == "") {
      if (v == "twilio") {
        name.value = "My SMS";
      } else name.value = "My " + v;
    }
  },
});

const channels = computed((): ChannelModel[] => {
  return channelsModule.channels;
});

const myChannels = computed((): UserChannel[] => {
  return channelsModule.myChannels;
});

const availableChannels = computed((): ChannelModel[] => {
  let base = channels.value;
  const cur = channelsModule.myChannels;
  const res = base.filter((e) => {
    return (
      e.multiple ||
      !cur.some((curElem) => e.id === curElem.attributes.providerID)
    );
  });
  return res;
});

const addNotAllowed = computed((): boolean => {
  return availableChannels.value.length == 0;
});

const validName = computed((): boolean => {
  return name.value.length > 3;
});
const addValid = computed((): boolean => {
  return (
    validName.value &&
    newChannel.value.length > 0 &&
    providerData.value != undefined
  );
});

const setProviderData = (pd: ProviderData): void => {
  providerData.value = pd;
};

const remove = async (id: string): Promise<void> => {
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
};

const resendVerification = async (data: any): Promise<boolean> => {
  // this is a hack till we can pass the records in.
  const id = data[0].source;
  const uc = myChannels.value.find((chan) => chan.id == id);
  if (uc) {
    await uc.sendVerification();
    showToast({
      message: "Verification Sent",
      duration: 2000,
      color: "success",
    });
  }
  return true;
};

const add = async (): Promise<void> => {
  if (!userModule.user) {
    throw "Login required";
  }
  const c = UserChannel.spawn(
    name.value,
    userModule.user?.id,
    newChannel.value
  );
  c.setProviderData(providerData.value);
  var acl = new Moralis.ACL();
  acl.setReadAccess(Moralis.User.current().id, true);
  acl.setWriteAccess(Moralis.User.current().id, true);
  acl.setRoleReadAccess("admins", true);
  acl.setRoleWriteAccess("admins", true);
  c.setACL(acl);
  const context = { action: "insert" };
  c.save(null, { context: context }).then(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (uc: UserChannel) => {
      // Execute any logic that should take place after the object is saved.
      showAdd.value = false;
    },
    (error: { message: string }) => {
      // Execute any logic that should take place if the save fails.
      // error is a Moralis.Error with an error code and message.
      alert("Failed to create new object, with error code: " + error.message);
    }
  );
};
</script>

<style scoped></style>
