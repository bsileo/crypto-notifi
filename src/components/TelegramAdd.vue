<template>
  <div class="flex sm12">
    <div class="row">
      <p class="flex sm12 pb-2">
        To subscribe to Telegram, you must start the process from your Telegram
        account:
      </p>
    </div>
    <div class="row pb-2">
      <div class="flex sm12">
        1. Start a new conversation with
        <a href="https://t.me/bsileo_bot" target="_blank">@Notifi_bot</a>
      </div>
    </div>
    <div class="row">
      <div class="flex sm12">2. Send this message to the bot: <br /></div>
    </div>
    <div class="row pb-2">
      <div class="copy ml-4 pr-6">
        {{ userTag }}
        <va-icon
          @click="copyCode"
          class="copyIcon"
          name="content_copy"
        ></va-icon>
      </div>
    </div>
    <div class="row">
      <div class="flex sm12">
        3.<va-button @click="runPoll">Click Here </va-button>to
        detect this message and configure the details in Notifi.
      </div>
    </div>
    <div class="row pt-2">
      <va-input
        class="mb-4"
        v-model="userID"
        label="Telegram UserID"
        :disabled="!this.userID"
        readonly
        placeholder="@telegram"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis";
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";

export default defineComponent({
  name: "Telegram",
  components: {},
  emits: ["providerData"],
  props: {},
  setup(props, { emit }) {
    const userID = ref("");
    const chatID = ref("");
    const userTag = computed(() => {
      const code = getRandomCode();
      return "Notifi-" + code;
    });

    const getRandomCode = () => {
      var chars =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var passwordLength = 8;
      var password = "";
      for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }
      return password;
    };

    const providerData = computed((): Record<string, string | undefined> => {
      return {
        to: userID.value,
        chatID: chatID.value,
        status: "Active",
      };
    });

    const valid = computed(() => {
      return userID.value && chatID.value;
    });

    const updateProviderData = (): void => {
      if (valid.value) {
        emit("providerData", providerData.value);
      } else {
        emit("providerData", null);
      }
    };

    const copyCode = async () => {
      // copy text to clipboard
      if (navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(userTag.value);
      }
    };

    let polling = ref(true);
    const runPoll = async () => {
      const params = { userTag: userTag.value };
      const telegramRes = await Moralis.Cloud.run("telegramMonitor", params);
      if (telegramRes.success && telegramRes.userid && telegramRes.chatID) {
        userID.value = `@${telegramRes.userid}`;
        chatID.value = telegramRes.chatID;
        updateProviderData();
        return true;
      } else {
        return false;
      }
    };

    const startPolling = () => {
      runPoll();
      if (polling.value) {
        setInterval(startPolling, 3000);
      }
    };

    onMounted(() => {
      //startPolling();
    });

    onUnmounted(() => {
      polling.value = false;
    });

    return {
      valid,
      userID,
      userTag,
      providerData,
      polling,
      runPoll,
      startPolling,
      copyCode,
    };
  },
});
</script>

<style scoped>
.copy {
  background: #f1f3f4;
  color: #3c4043;
  display: block;
  padding: 8px;
  padding-right: 10px;
  margin-top: 10px;
  white-space: normal;
  word-break: break-all;
  text-align: center;
  margin-left: 10px;
  width: fit-content;
}

.copyIcon {
  background: #f1f3f4;
  color: #5f6368;
  text-align: right;
  display: absolute;
  padding-left: 10px;
  right: 8px;
}
</style>
