<template>
  <div @click="startEdit" v-if="!editOnly" v-show="!editing" class="groupName">
    Group: <span class="editable">{{ name }}</span>
  </div>
  <va-select
    v-show="editing"
    :options="groups"
    text-by="name"
    track-by="id"
    label="Group"
    v-model="group"
    @update:model-value="select"
    @keypress.esc="endEdit"
    ref="editor"
    clearable
    :clear-value="undefined"
    no-options-text="No Groups Defined"
  ></va-select>
</template>

<script setup lang="ts">
import { Group } from "@/models/Group";
import { computed, nextTick, ref } from "vue";

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  required: { type: Boolean, required: false, default: false },
  modelValue: { type: Group, required: false },
  editOnly: { type: Boolean, required: false, default: false},
});
const editing = ref(props.editOnly);
const editor = ref();

const startEdit = async () => {
  editing.value = true;
  await nextTick();
  //editor.value.focus();
};
const endEdit = () => {
  if (! props.editOnly) editing.value = false;
};

const valid = computed(() => {
  return !props.required || group.value != undefined;
});
const group = computed({
  get: () => props.modelValue,
  set: (value: Group | undefined) => {
    emit("update:modelValue", value);
  },
});

const name = computed(() => {
  if (props.modelValue) return props.modelValue.name;
  else return "<No Group>";
});
const messages = props.required ? "Required" : "";
const select = (newGroup: Group) => {
  let g = undefined;
  if (newGroup) {
    g = groups.value.find((e) => e.id == newGroup.id);
  }
  group.value = g;
  if (!props.editOnly) editing.value = false;
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
  cursor: text;
}
</style>
