<template>
  <v-btn @click="scanKey = !scanKey">Scan Key</v-btn>

  <qr-stream v-if="scanKey" @decode="onDecode" class="mb">
    <div style="color: red" class="frame"></div>
  </qr-stream>
</template>

<script>
import { QrStream } from "vue3-qr-reader";

export default {
  components: { QrStream },
  methods: {
    onDecode(decodedString) {
      console.log("scanned qr code");
      this.$emit("sharedKeyRecieved", decodedString);
    },
  },
  setup() {
    // var _this = this;
    // function onDecode(data) {
    //   console.log("scanned qr code");
    //   _this.$emit("sharedKeyRecieved", data);
    // }
    // return {
    //   onDecode,
    // };
  },
  data: () => ({
    scanKey: false,
  }),
};
</script>

<style>
</style>