<template>
  <div>
    <v-btn @click="shareKey = !shareKey">Share Key</v-btn>
    <vue-qrcode v-if="shareKey" :value="sharedKey" :options="{ width: 200 }"></vue-qrcode>
  </div>
</template>

<script>
export default {
  props: ["sharedKey"],
  data: () => ({
    shareKey: false,
  })
};
</script>

<style>
</style>