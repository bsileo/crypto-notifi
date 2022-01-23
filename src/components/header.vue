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
      <template #center> </template>
      <template #right>
        <slot name="right"></slot>
      </template>
    </va-navbar>
  </div>
</template>

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
