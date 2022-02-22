<template>
  <div id="test">Hello World!</div>
</template>

<script lang="js">
import {
    ref,
    onMounted
} from "vue";

export default {
    setup(props) {
        onMounted(() => {
            // NULL
            console.log(document.getElementById("test"));
        });
    }
}
</script>
