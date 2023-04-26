<template>
  <v-container>
    <v-card>
      <v-card-title> LoRa Chat Application</v-card-title>
      <v-card-text>
        <v-row>
          <div v-if="isSupported  && !lisDeviceConnected">
            <v-btn @click="requestDevice().then(async _device => { if(!isDeviceConnected && !firstTry){await server.value.device.gatt.connect() } isDeviceConnected = true; firstTry = false; device.addEventListener('gattserverdisconnected',onDisconnected)})">
              Request Bluetooth Device
            </v-btn>
          </div>
        </v-row>
        <v-row>
          <v-btn
            v-if="!notificationPermission"
            @click="requestBackgroundSync()"
          >
            Request Background Notifications
          </v-btn>
          <v-btn @click="toggleMap()"       :disabled="!device"
>
            <span v-if="showMap">Hide </span><span v-else>Show </span>&nbsp;Map
          </v-btn>
        </v-row>
        <v-row>
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
          ><v-chip color="green" size="x-large" class="text-wrap" v-if="!m.isLocation">{{
            m.text
          }}</v-chip></span
        >
        <span v-else class="blue--text ml-3"
          ><v-chip color="blue" size="x-large" class="text-wrap" v-if="!m.isLocation">{{
            decryptMessage(m)
          }}</v-chip></span
        >
      </div>
    </div>
  </v-container>
  <v-container>
    <v-text-field
      v-model="tempMessage"
      append-icon="mdi-send"
      :rules="[
        (v) =>  !v.includes(',') || 'COMMAs are BAD',
        (v) => !v.includes('+') || 'PLUS + are BAD',
      ]"
      :disabled="!device"
      variant="filled"
      clear-icon="mdi-close-circle"
      clearable
      label="Message"
      type="text"
      @click:append="sentMessage(tempMessage,false)"
      @keydown.enter="sentMessage(tempMessage,false)"
      maxlength="180"
      counter
    ></v-text-field>
    <br />
    <MapVue v-if="showMap"  :otherLatLong="otherLatLong"  @messageSent="(msg) => {if(!sendingMessage){sentMessage(msg,true)}}"></MapVue>
  </v-container>
</template>
  
  <script>
import { nextTick } from "vue";
import { pausableWatch, useBluetooth } from "@vueuse/core";
import MapVue from "./Map.vue";

var firstTry = true;
var lmessages = [];
var msgObj = {
  id: 0,
  text: null,
  yours: false,
  isLocation: false
};
var isDeviceConnected = true;
// eslint-disable-next-line no-unused-vars
var lsharedKey = "";
const getRecievedMessages = () => {
  return lmessages;
};


const getConnectionStatus = () =>{
  return isDeviceConnected;
}
export default {
  name: "HelloWorld",
  components: {  MapVue },
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

    var strBuild = "";

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

                if (msg.startsWith("*|")) {
                  var x = Object.assign({}, msgObj);
                  x.id = makeid(20);
                  x.text = strBuild + msg.substring(2);
                  x.yours = false;

                  if (!msg.includes("+")) {
                    lmessages.push(x);
                  }
                  if (document.hidden) {
                    createNotification();
                  }
                  strBuild = "";
                } else {
                  strBuild = strBuild + msg.substring(2);
                }
              }
            );
          });
        });
    };

    function createNotification() {
      
      const title = "Lora Recieved New Message";
      const img = "/img/lora.png";
      const options = {
        body: "Message Recieved",
        icon: img,
      };

      new Notification(title, options);
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
      if(isDeviceConnected){
      var service = await server.value.getPrimaryService(
        "00006969-0000-1000-8000-00805f9b34fb"
      );
      var stringCharacteristics = await service.getCharacteristic(
        "00009876-0000-1000-8000-00805f9b34fb"
      );
      var enc = new TextEncoder(); // always utf-8
      await stringCharacteristics.writeValueWithResponse(enc.encode(msg));
    }
    else{
      console.log("device disconnected")
    }
    };

    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    const batchSendMessage = async (msg) => {
      if (msg.length < 30) {
        sendMessage("*|" + msg);
      } else {
        if (msg.length < 301) {
          //try to break them into ten messages 30 chars with 0| 1| and count down
          var batch = msg.match(/.{1,30}/g);
          console.log(batch);
          loopMessage(batch);
        }
      }
    };
    async function loopMessage(batch) {
      for (var i = 0; i < batch.length; i++) {
        var prefix = i;
        if (i == batch.length - 1) {
          prefix = "*";
        }
        sendMessage(prefix + "|" + batch[i]);
        await timer(2000);
      }
    }

    function onDisconnected(){
      isDeviceConnected = false;
      
    }
    return {
      isConnected,
      isSupported,
      device,
      requestDevice,
      server,
      sendMessage,
      batchSendMessage,
      getOtherMessage,
      isDeviceConnected,
      onDisconnected
    };
  },
  data: () => ({
    sendingMessage: false,
    sharedKey: null,
    messages: [],
    tempMessage: null,
    showMsg: false,
    notificationPermission: false,
    lastMessageRecieved: "",
    showMap: false,
    otherLatLong: {
      Lat: null,
      Long: null,
    },
    lisDeviceConnected: false,
  }),
  created() {
    this.lmessages = getRecievedMessages();
  },
  mounted() {
    this.intervalID = setInterval(() => {
      this.showMsg = false;
      nextTick(() => {
        this.lisDeviceConnected = getConnectionStatus();
        this.lmessages = getRecievedMessages();
        this.showMsg = true;
      });
      this.$forceUpdate();
    }, 5000);
  },
  methods: {
    toggleMap() {
      this.showMap = !this.showMap;
    },
    sentMessage(msg, isLatLong =false) {
      this.sendingMessage = true;
      var x = Object.assign({}, msgObj);
      x.id = this.makeidvue(20);
      x.text = msg;
      x.yours = true;
      x.isLocation = isLatLong;
      this.lmessages.push(x);

      var hashed = this.hashMessage(msg);
      this.batchSendMessage(hashed);
      this.tempMessage = null;
      this.sendingMessage =false;
    },
    requestBackgroundSync() {
      Notification.requestPermission((permission) => {
        if (permission === "granted") {
          this.registerBackgroundSync();
          this.notificationPermission = true;
        } else console.error("Permission was not granted.");
      });
    },
    registerBackgroundSync() {
      if (!navigator.serviceWorker) {
        return console.error("Service Worker not supported");
      }

      navigator.serviceWorker.ready
        .then((registration) => registration.sync.register("syncMessages"))
        .then(() => console.log("Registered background sync"))
        .catch((err) =>
          console.error("Error registering background sync", err)
        );
    },
    hashMessage(str) {
      const encryptedText = this.$CryptoJS.AES.encrypt(
        str,
        this.sharedKey ? this.sharedKey.toLowerCase().trim() : ""
      ).toString();
      return encryptedText;
    },
    decryptMessage(message) {
      try {
        const decryptedText = this.$CryptoJS.AES.decrypt(
          message.text,
          this.sharedKey.toLowerCase().trim()
        ).toString(this.$CryptoJS.enc.Utf8);

        if(this.detectLatLong(decryptedText)){
          message.isLocation = true;
        }
        
        return decryptedText;
      } catch (ex) {
        lmessages = lmessages.filter((x) => x.Id !== message.Id);
        console.log("message not decrypted");
        return null;
      }
    },
    makeidvue(length) {
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
    },
    detectLatLong(message) {
      const regex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      const match = message.match(regex);

      if (match) {
        const lat = parseFloat(match[1]);
        const long = parseFloat(match[4]);
        this.otherLatLong.Lat = lat;
        this.otherLatLong.long = long;
        console.log(`Latitude: ${lat}, Longitude: ${long}`);
      } else {
        console.log("No latitude and longitude found in string.");
      }
      return match;
    }
  },
  watch: {
    sharedKey() {
      lmessages = [];
      lsharedKey = this.sharedKey.toLowerCase().trim();
    },
  },
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
  