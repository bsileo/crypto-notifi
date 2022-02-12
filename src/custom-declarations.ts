/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Moralis from "moralis/types";
import Vue from "vue";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $moralis: Moralis;
  }
}
