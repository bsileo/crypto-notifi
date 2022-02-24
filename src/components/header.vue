<template>
  <div>
    <va-navbar color="primary" shape class="mb-2">
      <template #left>
        <va-navbar-item>
          <va-image class="logo" alt="logo" src="/logo.png">
            <template #error> Logo </template>
          </va-image>
        </va-navbar-item>
        <va-navbar-item>
          <div class="title">Notifi</div>
        </va-navbar-item>
      </template>
      <template #center>
        <h2 style="font-size: large; color: red">
          ALPHA Version<br /><a
            style="font-size: small; font-color: red"
            target="_blank"
            href="mailto:info@cryptonotifi.xyz"
            >info@cryptonotifi.xyz</a
          >
        </h2>
      </template>
      <template #right v-if="loggedIn">
        <slot name="right"></slot>
      </template>
    </va-navbar>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  ref,
  watch,
  watchEffect,
} from "vue";
import { DisplayMode, UserMode } from "@/notifi_types";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "Header",
  inject: ["Moralis"],
  setup(props, context) {
    const router = useRouter();
    const route = useRoute();

    //console.log(`Setup loggedIn - ` + moralis);
    const moralis: any = inject("Moralis");
    let li = false;
    if (!moralis) li = false;
    else {
      if (moralis.User.current()) li = true;
      else li = false;
    }
    const loggedIn = ref(li);
    const userIsManager = computed((): boolean => {
      const moralis: any = inject("Moralis");
      const u = moralis.User.current();
      return u && u.get("ProtocolManager");
    });

    let initialUserMode: UserMode = UserMode.user;
    if (route.meta.manager) initialUserMode = UserMode.manager;
    const intUserMode = ref<UserMode>(initialUserMode);
    const userMode = computed({
      get: () => {
        return intUserMode.value;
      },
      set: (mode) => {
        intUserMode.value = mode;
        if (mode == UserMode.manager) {
          router.push({ name: "ManageSelectProtocol" });
        } else {
          router.push({ name: intMode.value });
        }
      },
    });

    let initialMode = DisplayMode.protocols;
    switch (route.name) {
      case DisplayMode.protocols:
        initialMode = DisplayMode.protocols;
        break;
      case DisplayMode.subscriptions:
        initialMode = DisplayMode.subscriptions;
        break;
      case DisplayMode.positions:
        initialMode = DisplayMode.positions;
        break;
      default:
        initialMode = DisplayMode.protocols;
    }

    const intMode = ref<DisplayMode>(initialMode);
    const mode = computed({
      get: (): any => {
        return intMode.value;
      },
      set: (val): void => {
        intMode.value = val;
        router.push(val);
      },
    });
    const modeOptions = ref([
      { value: DisplayMode.protocols, label: "Protocols" },
      { value: DisplayMode.positions, label: "Positions" },
      { value: DisplayMode.subscriptions, label: "Subscriptions" },
    ]);

    const showChannels = ref(false);
    const showAccount = ref(false);

    return {
      showChannels,
      showAccount,
      loggedIn,
      mode,
      userMode,
      userIsManager,
      modeOptions,
    };
  },
  methods: {
    async logout() {
      this.$moralis.User.logOut();
      this.$router.push({ name: "Login" });
    },
  },
});
</script>

<style scoped>
.logo {
  height: 50px;
  width: 80px;
}
.title {
  font-size: 2em;
  font-weight: bold;
  align-self: center;
  font-family: "Material Icons";
}
</style>
