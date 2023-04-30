<!-- eslint-disable no-unused-vars -->
<template>
  <v-container>
    <v-card>
      <v-card-title> LoRa Chat Application</v-card-title>
      <v-card-text>
        <v-row>
          <div v-if="isSupported && !lisDeviceConnected">
            <v-btn
              @click="
                requestDevice().then(async (_device) => {
                  // if (firstTry) {
                  //   await server.value.device.gatt.connect();
                  // }
                  isDeviceConnected = true;
                  device.addEventListener(
                    'gattserverdisconnected',
                    onDisconnected
                  );
                })
              "
            >
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
          <v-btn @click="toggleMap()" :disabled="!device">
            <span v-if="showMap">Hide </span><span v-else>Show </span>&nbsp;Map
          </v-btn>

          <v-btn
            @click="startSendingTimestampMesssages()"
            :disabled="!device"
            v-if="!testing"
          >
            Send Timestamps
          </v-btn>
          <v-btn @click="clearStorage()">Clear Storage</v-btn>
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
    <div>
      <div
        v-for="m in messages"
        :key="m.id"
        :class="[
          'd-flex flex-row align-center my-2',
          m.yours ? 'justify-end' : null,
        ]"
      >
        <span v-if="m.yours" class="blue--text mr-3"
          ><v-chip
            color="green"
            size="x-large"
            class="text-wrap"
            v-if="!m.isLocation"
          >
            {{ decryptMessage(m, m.sharedKey) }}
            <v-icon v-if="m.recieved" right>mdi-check</v-icon>
          </v-chip>
          </span
        >
        <span v-else class="blue--text ml-3"
          ><v-chip
            color="blue"
            size="x-large"
            class="text-wrap"
            v-if="!m.isLocation"
          >
            {{ decryptMessage(m, m.sharedKey) }}
          </v-chip></span
        >
      </div>
    </div>
  </v-container>
  <v-container>
    <!-- :rules="[
        (v) => !v.includes(',') || 'COMMAs are BAD',
        (v) => !v.includes('+') || 'PLUS + are BAD',
      ]" -->
    <v-text-field
      v-model="tempMessage"
      append-icon="mdi-send"
      
      :disabled="!device && stillSending"
      variant="filled"
      clear-icon="mdi-close-circle"
      clearable
      label="Message"
      type="text"
      @click:append="prepareMessage(tempMessage, false)"
      @keydown.enter="prepareMessage(tempMessage, false)"
      maxlength="180"
      counter
    ></v-text-field>
    <br />
    <!-- :OtherLatLong="OtherLatLong" -->
    <MapVue
      v-if="showMap"
      :dataProp="parentData"
      @messageSent="
        (msg) => {
          prepareMessage(msg, true);
        }
      "
    ></MapVue>
  </v-container>
</template>
  
  <script>
import { pausableWatch, useBluetooth } from "@vueuse/core";
import MapVue from "./Map.vue";
import messageStore from "@/utils/messages";

var isDeviceConnected = false;
var lsharedKey = "";
let isSending = false;
let recievingMessage = false;
let haveStart = false;
let tempID = null;
function isMessageSending() {
  return isSending;
}
function isMessageReceiving(){
  return recievingMessage;

}

//a function that watch's recievingMessage when it is true, and sets it to false after ten seconds

export default {
  name: "HelloWorld",
  components: { MapVue },
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
    let messageQueue = [];

    const getMessageFromBluetoothService = async () => {
      try {
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
                async (event) => {
                  recievingMessage = true;
                 
                  let value = event.target.value;
                  var enc = new TextDecoder("utf-8");
                  var msg = enc.decode(value);
                  console.log(msg);

                  if(msg.startsWith("A|")){
                    //ack msg recieved
                    messageStore.getMessages().filter(x=>x.id ==msg.substring(2))[0].recieved = true;
                    recievingMessage = false;
                  }

                 else if(msg.startsWith("ID|")){
                  strBuild = "";//remove old message that failed to send
                    tempID =  msg.substring(3);
                  }

                  else if(msg.startsWith("0|")){
                    haveStart == true;
                    strBuild = strBuild + msg.substring(2);
                  }

                  else if (msg.startsWith("*|")) {
                    var x = messageStore.getNewMessage(
                      false,
                      strBuild + msg.substring(2),
                      false,
                      lsharedKey,
                      false
                    );
                    if(tempID !=null){
                      x.id = tempID;
                    }
                    if (!msg.includes("+")) {
                      messageStore.pushMessage(x);
                      //send ack
                      await sendMessage("A|" + x.id);
                      await timer(1500);
                      recievingMessage = false;
                      tempID = null;
                    }
                    if (document.hidden) {
                      createNotification();
                    }
                    strBuild = "";
                  } 
                  else {
                    strBuild = strBuild + msg.substring(2);
                  }
                }
              );
            });
          });
      } catch (ex) {
        console.log(ex);
      }
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

    const { stop } = pausableWatch(isConnected, (newIsConnected) => {
      if (!newIsConnected || !server.value) return;
      getMessageFromBluetoothService();
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
    };

    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    const batchSendMessage = async () => {
      isSending = true;
      while (messageQueue.length > 0) {
        const message = messageQueue[0];
        //try to not talk over each other
        if (!recievingMessage) {
          try {
            await sendMessage("ID|" + message.id);
            await timer(1200);

            var msg = message.text;
            if (msg.length < 30) {
              await sendMessage("*|" + msg);
              messageQueue.shift();
            } else {
              if (msg.length < 301) {
                //try to break them into ten messages 30 chars with 0| 1| and count down
                var batch = msg.match(/.{1,30}/g);
                console.log(batch);
                await loopMessage(batch);
                messageQueue.shift();
              }
            }
          } catch (error) {
            console.error(error);
            if (message.retries > 0) {
              // Decrement retries and add message to end of queue
              message.retries--;
              messageQueue.push(message);
            } else {
              // Remove message from queue if retries are exhausted
              messageQueue.shift();
            }
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
          recievingMessage = false;
        }
      }
      isSending = false;
    };
    async function loopMessage(batch) {
      for (var i = 0; i < batch.length; i++) {
        var prefix = i;
        if (i == batch.length - 1) {
          prefix = "*";
        }
        await sendMessage(prefix + "|" + batch[i]);
        await timer(1200);
      }
    }
    function onDisconnected() {
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
      getMessageFromBluetoothService,
      isDeviceConnected,
      onDisconnected,
      messageQueue,
    };
  },
  data: () => ({
    sharedKey: null,
    tempMessage: null,
    showMsg: false,
    notificationPermission: false,
    lastMessageRecieved: "",
    showMap: false,
    parentData: { lat: null, long: null },
    lisDeviceConnected: false,
    intervalTimestamp: 15000,
    testing: false,
  }),
  created() {},
  mounted() {
    const storedObject = localStorage.getItem("messages");
    if (storedObject) {
      messageStore.setMessages(JSON.parse(storedObject));
    }

 this.intervalID = setInterval(() => {
       this.saveMessagesToStorage();
     }, 20000);
  },
  methods: {
    startSendingTimestampMesssages() {
      var _this = this;
      this.testing = true;
      // send one right away
      this.prepareMessage(
        "Timestamp Test Message " +
          new Date().toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          }),
        false
      );

      this.intervalID = setInterval(function () {
        _this.prepareMessage(
          "Timestamp Test Message " +
            new Date().toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            }),
          false
        );
      }, this.intervalTimestamp);
    },
    toggleMap() {
      this.showMap = !this.showMap;
    },
    prepareMessage(msg, isLatLong = false) {
      var x = messageStore.getNewMessage(
        true,
        this.hashMessage(msg),
        isLatLong,
        this.sharedKey,
        false
      );
      messageStore.pushMessage(x);
      this.saveMessagesToStorage();

      this.addToQueue(x);
      if (!isLatLong && !this.testing) {
        //location updates wont remove your message
        //and so timestamp message gen doesnt remove your message
        this.tempMessage = null;
      }
    },
    addToQueue(x) {
      this.messageQueue.push(x);
      this.batchSendMessage(x);
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
    decryptMessage(message, savedSharedKey) {
      try {
        const decryptedText = this.$CryptoJS.AES.decrypt(
          message.text,
          savedSharedKey
        ).toString(this.$CryptoJS.enc.Utf8);

        if (!message.isProccessed) {
          message.isProccessed = true;
          if (this.detectLatLong(decryptedText)) {
            message.isLocation = true;
          }
        }

        return decryptedText;
      } catch (ex) {
        //messages = messages.filter((x) => x.Id !== message.Id);
        console.log("message not decrypted: " + ex);
        return null;
      }
    },

    detectLatLong(message) {
      const regex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      const match = message.match(regex);

      if (match) {
        const lat = parseFloat(match[1]);
        let long = match[4];

        if (match[0].includes(",-")) {
          long = "-" + long;
        }

        this.parentData.lat = null;
        this.parentData.long = null;
        var temp = { lat: lat, long: long };
        this.parentData = temp;
        console.log(`Latitude: ${lat}, Longitude: ${long}`);
      } else {
        //console.log("No latitude and longitude found in string.");
      }
      return match;
    },
    saveMessagesToStorage() {
      if(!isMessageReceiving()){
      var savedM = messageStore.getMessages();
      savedM.forEach((x) => {
        if (x.sharedKey == null) {
          x.sharedKey = this.sharedKey;
        }
      });
      //writing shared key to local storage
      if (savedM.length > 0) {
        localStorage.setItem("messages", JSON.stringify(savedM));
        console.log("saved messages to local storage");
      }
    }
    },
    clearStorage() {
      localStorage.removeItem("messages");
      this.messages = [];
      window.location.reload();
    },
  },
  watch: {
    sharedKey() {
      lsharedKey = this.sharedKey.toLowerCase().trim();
    },
  },
  computed: {
    messages() {
      return messageStore.getMessages();
    },
    stillSending() {
      return isMessageSending();
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
  