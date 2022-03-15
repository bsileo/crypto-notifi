<template>
  <va-list>
    <va-inner-loading :loading="loading">
      <ChannelListItem
        v-for="userChannel in channels"
        :key="userChannel.id"
        :userChannel="userChannel"
      ></ChannelListItem>
    </va-inner-loading>
  </va-list>
  <div v-if="noChannels" class="flex pl-2 pt-3">
    <h3>Click Add below to create your first channel.</h3>
  </div>
  <div class="flex pl-2 pt-3">
    <va-button
      @click.prevent="showAdd = true"
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
        @providerData="setProviderData"
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
</template>

<script setup lang="ts">
import { userModule } from "../store/user";
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import { UserChannel } from "../models/Channel";
import Twilio from "@/components/TwilioAdd.vue";
import Discord from "@/components/DiscordAdd.vue";
import Email from "@/components/EmailAdd.vue";
import Telegram from "@/components/TelegramAdd.vue";
import Moralis from "moralis";
import { ChannelModel } from "@/notifi_types";
import ChannelListItem from "./channelListItem.vue";
import { useUserChannelsStore } from "@/store/pinia_userChannel";
import { storeToRefs } from "pinia";

const userChannelsStore = useUserChannelsStore();
onMounted(() => {
  userChannelsStore.setupChannels();
});

type ProviderData = Record<string, string | boolean | undefined>;

const providerData = ref<ProviderData>({ to: undefined });
const name = ref("");
const intNewChannel = ref("");
const showAdd = ref(false);

const noChannels = computed(() => channels.value.length == 0);

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

const {
  userChannels: channels,
  definedChannels: definedChannels,
  loading,
} = storeToRefs(userChannelsStore);

const availableChannels = computed((): ChannelModel[] => {
  let base = definedChannels.value;
  const cur = channels.value;
  const res: ChannelModel[] = base.filter((e) => {
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
