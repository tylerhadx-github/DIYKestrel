<template>
  <v-container>
    <v-card>
      <v-card-title> LoRa Chat Application</v-card-title>
      <v-card-text>
        <v-row>
          <div v-if="isSupported && !device">
            <v-btn @click="requestDevice().then((_device) => {})">
              Request Bluetooth Device
            </v-btn>

            <v-btn v-if="!notificationPermission" @click="requestBackgroundSync()">
              Request Background Notifications
            </v-btn>
            <v-btn @click="testNotifcation">
            Test Notification
          </v-btn>
          </div>
          <div v-if="device">
            <p>Device Name: {{ device.name }}</p>
          </div>
        </v-row>
        <v-row>
          <v-col class="text-center">
            <v-text-field
              label="Pre-shared key"
              variant="outlined"
              v-model="sharedKey"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container>
    <!-- <ChatVue
        :sharedKey="sharedKey"
        :messages="messages"
        @messageSent="(msg) => sentMessage(msg)"
      ></ChatVue> -->
    <div v-if="showMsg && isConnected">
      <div
        v-for="m in lmessages"
        :key="m.id"
        :class="[
          'd-flex flex-row align-center my-2',
          m.yours ? 'justify-end' : null,
        ]"
      >
        <span v-if="m.yours" class="blue--text mr-3"
          ><v-chip color="green" size="x-large">{{ m.text }}</v-chip></span
        >
        <span v-else class="blue--text ml-3"
          ><v-chip color="blue" size="x-large">{{ m.text }}</v-chip></span
        >
      </div>
    </div>
  </v-container>
  <v-container>
    <v-text-field
      v-model="tempMessage"
      append-icon="mdi-send"
      :rules="[
        (v) => !v.includes(',') || 'COMMAs are BAD',
        (v) => !v.includes('+') || 'PLUS + are BAD',
      ]"
      variant="filled"
      clear-icon="mdi-close-circle"
      clearable
      label="Message"
      type="text"
      @click:append="sentMessage(tempMessage)"
      @keydown.enter="sentMessage(tempMessage)"
      maxlength="35"
      counter
    ></v-text-field>
    <br />
  </v-container>
</template>
  
  <script>
import ChatVue from "./Chat.vue";
import { nextTick } from "vue";
import { pausableWatch, useBluetooth } from "@vueuse/core";

var lmessages = [];
var msgObj = {
  id: 0,
  text: null,
  yours: false,
};
const getRecievedMessages = () => {
  return lmessages;
};
export default {
  name: "HelloWorld",
  components: { ChatVue },
  setup() {
    const { isConnected, isSupported, device, requestDevice, server } =
      useBluetooth({
        acceptAllDevices: true,
        filters: [
          { services: ["00006969-0000-1000-8000-00805f9b34fb"] },
          //,'00007070-0000-1000-8000-00805f9b34fb'
        ],
        optionalServices: ["00007070-0000-1000-8000-00805f9b34fb"],
      });

    const getOtherMessage = async () => {
      var service = await server.value.getPrimaryService(
        "00007070-0000-1000-8000-00805f9b34fb"
      );
      // eslint-disable-next-line no-unused-vars
      var stringCharacteristics = await service
        .getCharacteristic("00006789-0000-1000-8000-00805f9b34fb")
        .then((characteristic) => {
          return characteristic.startNotifications().then(() => {
            console.log("> Notifications started");
            characteristic.addEventListener(
              "characteristicvaluechanged",
              (event) => {
                let value = event.target.value;
                var enc = new TextDecoder("utf-8");
                var msg = enc.decode(value);
                console.log(msg);
                var x = Object.assign({}, msgObj);
                x.id = makeid(20);
                x.text = msg;
                x.yours = false;

                if (!msg.includes("+")) {
                  lmessages.push(x);
                }
                if(document.hidden){
                  createNotification(msg);
                }

              }
            );
          });
        });
    };
    function createNotification(msg){
  const title = "Lora Recieved New Message";
  const img = '/img/lora.png';
  const options ={
    body: msg,
    icon: img,
  };

  new Notification(title,options);
}

    function makeid(length) {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
      }
      return result;
    }

    const { stop } = pausableWatch(isConnected, (newIsConnected) => {
      if (!newIsConnected || !server.value) return;
      getOtherMessage();
      // We only want to run this on the initial connection, as we will use an event listener to handle updates:
      stop();
    });

    const sendMessage = async (msg) => {
      var service = await server.value.getPrimaryService(
        "00006969-0000-1000-8000-00805f9b34fb"
      );
      var stringCharacteristics = await service.getCharacteristic(
        "00009876-0000-1000-8000-00805f9b34fb"
      );
      var enc = new TextEncoder(); // always utf-8
      await stringCharacteristics.writeValueWithResponse(enc.encode(msg));

      var x = Object.assign({}, msgObj);
      x.id = makeid(20);
      x.text = msg;
      x.yours = true;

      lmessages.push(x);
    };
    return {
      isConnected,
      isSupported,
      device,
      requestDevice,
      server,
      sendMessage,
      getOtherMessage,
    };
  },
  data: () => ({
    sharedKey: null,
    messages: [],
    tempMessage: null,
    showMsg: false,
    notificationPermission: false,
    lastMessageRecieved: "",
  }),
  created() {
    this.lmessages = getRecievedMessages();
  },
  mounted() {
    this.intervalID = setInterval(() => {
      this.showMsg = false;
      nextTick(() => {
        this.lmessages = getRecievedMessages();
       
        this.showMsg = true;
      });
      this.$forceUpdate();
    }, 5000);
  },
  methods: {

    sentMessage(msg) {
      this.sendMessage(msg);
      this.tempMessage = null;
    },
    requestBackgroundSync() {
      Notification.requestPermission((permission) => {
        if (permission === "granted") {
          this.registerBackgroundSync();
          this.notificationPermission =true;
        } else console.error("Permission was not granted.");
      });
    },
    registerBackgroundSync() {
    if (!navigator.serviceWorker){
        return console.error("Service Worker not supported")
    }

    navigator.serviceWorker.ready
    .then(registration => registration.sync.register('syncMessages'))
    .then(() => console.log("Registered background sync"))
    .catch(err => console.error("Error registering background sync", err))
},

  },
  watch: {},
};
</script>
  
  <style scoped>
.message.right {
  float: right;
}

.messages {
  float: left;
}
</style>
  