<template>
  <div class="p-3 gutter--md">
    <ProtocolSelector
      :showSearch="true"
      :showVote="true"
      :showSubscribe="true"
      :showUserInfo="false"
      :allowSelect="false"
      :showStatus="true"
      :showAdd="true"
      @add="showAdd = true"
      @subscribe="protocolSubscribe"
    >
    </ProtocolSelector>
  </div>
  <va-modal v-model="showAdd" hide-default-actions>
    <div class="layout gutter--md">
      <div class="flex pb-3">
        <p class="flex xs12">
          Complete this form to suggest a new Protocol / Project to include in
          Notifi. <br />New requests are reviewed and enabled once verified.
        </p>
      </div>
      <va-input
        class="flex xs12"
        v-model="newName"
        label="Protocol Name"
        messages="Required"
        :success="nameValid"
      ></va-input>
      <va-input
        class="flex xs12"
        v-model="newWebsite"
        label="Protocol Website"
        placeholder="http://www.myProtocol.xyz"
        messages="Required"
        :error="websiteError"
        :success="websiteValid"
      ></va-input>
      <div class="flex xs12">
        <ChainsPicker @selected="setNewChains" required></ChainsPicker>
      </div>
      <va-input
        class="flex xs12"
        v-model="newIcon"
        label="Icon URL"
        placeholder="http://www.myProtocol.xyz/coolProtocolIcon.svg"
        messages="Optional"
        :error="iconError"
      ></va-input>
      <va-input
        class="flex xs12"
        v-model="newDescription"
        label="Description"
        type="textarea"
        messages="Optional"
        placeholder="Enter a description of the protocol / project"
      ></va-input>
      <va-checkbox
        v-model="owner"
        label="Protocol Manager / Owner"
      ></va-checkbox>
      <div v-show="owner">
        <va-input
          v-model="ownerName"
          label="Your Name"
          placeholder="Joe Protocol"
          messages="Optional"
        ></va-input>
        <va-divider inset></va-divider>
        <va-input
          v-model="ownerEmail"
          label="Your Email"
          placeholder="dev@myprotocol.xyz"
        ></va-input>
        <strong>OR</strong>
        <va-input
          class="flex sm7"
          label="Protocol Discord Server Invite"
          v-model="discordServer"
          placeholder="https://discord.gg/8ryhkfkfk"
        ></va-input>
        <va-input
          class="flex sm4"
          label="Manager's Discord User Name"
          v-model="discordUser"
          placeholder="@protocolMaster"
        ></va-input>
      </div>
      <div class="pt-2">
        <va-button @click="showAdd = false">Cancel</va-button>
        <va-button @click="addProtocol" :disabled="!valid">Add</va-button>
      </div>
    </div>
  </va-modal>
</template>

<script setup lang="ts">
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import ChainsPicker from "@/components/ChainsPicker.vue";
import { Chain } from "@/models/Contract";
import { Protocol, SiteStatus } from "@/models/Protocol";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const newName = ref("");
const newWebsite = ref("");
const newIcon = ref("");
const newDescription = ref("");
const newChains = ref<Chain[]>([]);
const owner = ref(false);
const ownerName = ref("");
const ownerEmail = ref("");
const discordServer = ref("");
const discordUser = ref("");

const urlRegex =
  /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;
const websiteError = computed(() => {
  return newWebsite.value.length > 5 && !urlRegex.test(newWebsite.value);
});
const websiteValid = computed(() => {
  return urlRegex.test(newWebsite.value);
});
const iconError = computed(() => {
  return newIcon.value.length > 5 && !urlRegex.test(newIcon.value);
});

const iconValid = computed(() => {
  return newIcon.value.length == 0 || urlRegex.test(newIcon.value);
});

const showAdd = ref(false);

const setNewChains = (chains: Chain[]) => {
  newChains.value.splice(0, newChains.value.length, ...chains);
};

const nameValid = computed(() => {
  return newName.value.length > 3;
});

const ownerEmailValid = computed(() => {
  return ownerEmail.value.length > 3;
});

const discordInviteValid = computed(() => {
  const test = /https:\/\/discord\.gg\/[0-9A-z]{8}/is;
  return test.test(discordServer.value);
});

const discordUserValid = computed(() => {
  return !/@.+/.test(discordUser.value);
});

const ownerDiscordValid = computed(() => {
  return discordInviteValid.value && discordUserValid.value;
});

const ownerValid = computed(() => {
  return owner.value == false || ownerEmailValid.value || ownerDiscordValid.value;
});

const valid = computed(() => {
  return (
    nameValid.value &&
    websiteValid.value &&
    newChains.value.length > 0 &&
    iconValid.value &&
    ownerValid.value
  );
});

const addProtocol = async (): Promise<void> => {
  if (!valid.value) {
    throw "Please Complete all fields";
  }
  let p = Protocol.spawn(newName.value, newWebsite.value);
  try {
    p.chains = newChains.value;
    p.protocolSiteStatus = SiteStatus.requested;
    if (newIcon.value) p.iconURL = newIcon.value;
    if (newDescription.value) p.description = newDescription.value;
    p = await p.save();
    const ps = await p.makeProtocolStatus();
    if (owner.value) {
      if (ownerName.value) ps.claimName = ownerName.value;
      if (ownerEmail.value) ps.claimEmail = ownerEmail.value;
      if (discordServer.value) ps.discordServer = discordServer.value;
      if (discordUser.value) ps.discordUser = discordUser.value;
      ps.claimStarted = true;
    } else {
      ps.claimStarted = false;
    }
    await ps.save();
    showAdd.value = false;
  } catch (err: any) {
    alert(err.message);
  }
};

const router = useRouter();
const protocolSubscribe = (aProtocol: Protocol) => {
  router.push(`/protocol/${aProtocol.id}/subscribe`);
};
</script>

<style scoped></style>
