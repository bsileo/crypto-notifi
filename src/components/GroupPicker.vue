<template>
  <div @click="editing = true" v-show="!editing" class="groupName">
    Group: <span class="editable">{{ name }}</span>
  </div>
  <va-select
    v-show="editing"
    :options="groups"
    text-by="name"
    label="Group"
    @update:model-value="select"
    :multiple="false"
    :messages="messages"
    :success="valid"
  ></va-select>
</template>

<script setup lang="ts">
import { Group } from "@/models/Group";
import { computed, ref } from "vue";

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  multiple: Boolean,
  required: Boolean,
  modelValue: Group,
});
const editing = ref(false);
const valid = computed(() => {
  return !props.required || group.value != undefined;
});
const group = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});

const name = computed(() => {
  if (props.modelValue) return props.modelValue.name;
  else return "<No Group>";
});
const messages = props.required ? "Required" : "";
const select = (group: Group) => {
  console.log("Set GroupPicker");
  const g = groups.value.find((e) => e.id == group.id);
  group.value = g;
  emit("update:modelValue", g);
  editing.value = false;
};

const groups = ref<Group[]>([]);
const fetchGroups = async () => {
  groups.value.length = 0;
  groups.value.push(...(await Group.MyGroups()));
};
fetchGroups();
</script>

<style scoped>
.editable {
  cursor: pointer;
}
</style>
