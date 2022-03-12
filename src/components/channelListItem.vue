<template>
  <va-list-item>
    <va-list-item-section avatar>
      <va-icon :name="providerIcon" :size="25"></va-icon>
    </va-list-item-section>
    <va-list-item-section>
      <va-list-item-label>
        <InlineEdit v-model="name"></InlineEdit>
      </va-list-item-label>
      <va-list-item-label caption>
        {{ userChannel.channelDescription }}
      </va-list-item-label>
    </va-list-item-section>
    <va-list-item-section>
      <va-list-item-label>
        <div class="row">
          <va-icon
            class="flex xs3"
            :name="statusIcon"
            :color="statusIconColor"
          ></va-icon>
          <div class="flex xs8">
            {{ statusPlus }}
            <div v-show="statusPlus == 'Verification Sent'">
              <a
                style="font-size: smaller"
                href="#"
                @click.prevent="resendVerification"
                >Resend</a
              >
            </div>
          </div>
        </div>
      </va-list-item-label>
    </va-list-item-section>
    <va-list-item-section>
      <va-button size="small" @click="remove" icon="delete"></va-button>
    </va-list-item-section>
  </va-list-item>
</template>

<script setup lang="ts">
import { UserChannel } from "@/models/Channel";
import { computed, getCurrentInstance, ref, toRefs } from "vue";
import InlineEdit from "@/components/InlineEdit.vue";

/* global defineProps */
const props = defineProps({
  userChannel: { type: UserChannel, required: true },
});

const providerIcon = computed(() => props.userChannel.providerIcon);

const statusPlus = computed(() => {
  return props.userChannel.statusPlus;
});

const name = computed({
  get: () => props.userChannel.name,
  set(newName: string) {
    props.userChannel.set("name", newName);
    props.userChannel.save();
  },
});

const remove = async (): Promise<void> => {
  props.userChannel.destroy().then(
    (myObject: UserChannel): void => {
      console.log("Deleted " + myObject.id);
    },
    (error: Error) => {
      alert("Delete Failed  " + error.message);
    }
  );
};

const statusIcon = ref("done");
const statusIconColor = ref("Primary");

const fetchStatus = async () => {
  const { name: status, color: color } =
    await props.userChannel.statusIconInfo();
  statusIcon.value = status;
  statusIconColor.value = color;
};
fetchStatus();

const app = getCurrentInstance();
const vaToast = app?.appContext.config.globalProperties.$vaToast;
const showToast = vaToast;

const resendVerification = async (data: any): Promise<boolean> => {
  // this is a hack till we can pass the records in.
  await props.userChannel.sendVerification();
  showToast.init({
    message: "Verification Sent",
    duration: 2000,
    color: "success",
  });
  return true;
};
</script>
