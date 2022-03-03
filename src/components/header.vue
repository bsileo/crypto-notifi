<template>
  <div>
    <va-navbar color="primary" shape class="mb-1">
      <template #left>
        <div class="pt-3 mr-2">
          <va-icon-menu-collapsed
            @click="minimized = !minimized"
            :class="{ 'x-flip': minimized }"
            class="va-navbar__item"
            :color="colors.dark"
          />
        </div>
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

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { appModule } from "@/store/app";
import VaIconMenuCollapsed from "@/components/icons/VaIconMenuCollapsed.vue";
import { useColors } from "vuestic-ui";

const { getColors } = useColors();
const colors = computed(() => getColors());
const minimized = computed({
  get: () => appModule.isSidebarMinimized,
  set: (value) => appModule.SidebarMinimized(value),
});

const moralis: any = inject("Moralis");
let li = false;
if (!moralis) li = false;
else {
  if (moralis.User.current()) li = true;
  else li = false;
}
const loggedIn = ref(li);
</script>

<style lang="scss" scoped>
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

.x-flip {
  transform: scaleX(-100%);
}

.menuIcon {
  position: relative;
  bottom: 3px;
}

.app-navbar__text > * {
  margin-right: 0.5rem;
  &:last-child {
    margin-right: 0;
  }
}
</style>
