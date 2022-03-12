<template>
  <div @click="startEdit" v-show="!editing" class="groupName">
    {{ title }} <span class="editable">{{ value }}</span>
    <va-icon class="editable" name="edit" :size="12"></va-icon>
  </div>
  <va-input
    v-show="editing"
    :label="label"
    v-model="value"
    @blur="endEdit"
    @keyup.enter="endEdit"
    :messages="messages"
    :success="valid"
    ref="editor"
  ></va-input>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  required: { type: Boolean, required: false, default: true },
  modelValue: { type: String, required: false, default: "" },
  title: { type: String, required: false, default: "" },
  label: { type: String, required: false, default: "" },
});
const editing = ref(false);
const valid = computed(() => {
  return !props.required || value.value != undefined;
});
const editor = ref();

const startEdit = async () => {
  editing.value = true;
  await nextTick();
  editor.value.focus();
};
const endEdit = () => {
  emit("update:modelValue", intValue.value);
  editing.value = false;
};

const intValue = ref(props.modelValue);
const value = computed({
  get: () => intValue.value,
  set: (value) => {
    intValue.value = value;
  },
});

const messages = props.required ? "Required" : "";
</script>

<style scoped>
.editable {
  cursor: text;
}
</style>
