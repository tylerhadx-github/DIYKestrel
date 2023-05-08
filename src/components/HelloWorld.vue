<!-- eslint-disable no-unused-vars -->
<template>
  <v-container>
    <v-card>
      <v-card-title> LoRa Chat Application</v-card-title>
      <v-card-text>
        <v-snackbar v-model="snackbar" :timeout="3000">
          Device connection Lost
        </v-snackbar>
        <v-row>
          <div>
            <v-btn v-if="!isDeviceConnected" @click="newBLEConnection()">
              New Request Bluetooth Device
            </v-btn>
            <v-btn v-else @click="disconnect"> Disconnect </v-btn>
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
          <v-btn @click="shareLocation = !shareLocation" :disabled="!device">
            Share Location
          </v-btn>

          <v-btn
            @click="
              sendingTimestamps = !sendingTimestamps;
              timeStampMessageSender(sendingTimestamps);
            "
            :disabled="!device"
          >
            <span v-if="sendingTimestamps">Stop </span
            ><span v-else>Start </span>&nbsp;Sending Timestamps
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
          <v-col>
            <v-btn @click="generateKey()" v-if="!sharedKey">Generate Key</v-btn>

            <QRCreator v-if="sharedKey" :sharedKey="sharedKey"></QRCreator>
            <qrreader
              v-if="!sharedKey"
              @sharedKeyRecieved="
                (msg) => {
                  sharedKey = msg;
                  scanKey = false;
                }
              "
            ></qrreader>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container>
    <div v-if="!affirmRefresh">
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
            v-if="!m.isLocation && !m.isPin"
          >
            <span>{{ decryptMessage(m, m.sharedKey) }}</span>
            <v-icon v-if="m.recieved" right>mdi-check</v-icon>
          </v-chip>
          <v-progress-linear
            v-if="!m.recieved && !shouldRetry(m.sentDate) && !m.isLocation"
            color="primary"
            height="4"
            indeterminate
          ></v-progress-linear>
          <div  v-else-if="
              !m.recieved &&
              shouldRetry(m.sentDate) &&
              !m.isLocation &&
              !m.isPin
            ">
          <v-icon
            @click="addToQueue(m)"
            >mdi-replay</v-icon
          >
          <v-icon

            @click="removeFromQueue(m)"
            >mdi-delete</v-icon
          >
        </div>
        </span>
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
      @click:append="prepareMessage(tempMessage, false, false)"
      @keydown.enter="prepareMessage(tempMessage, false, false)"
      maxlength="180"
      counter
    ></v-text-field>
    <br />
    <MapVue
      v-if="showMap"
      :shareLocationUpdates="shareLocation"
      :dataProp="parentData"
      :otherPin="otherPinSent"
      @messageSent="
        (msg) => {
          prepareMessage(msg, true, false);
        }
      "
      @pinSent="
        (msg) => {
          prepareMessage(msg, false, true);
        }
      "
    ></MapVue>
  </v-container>
</template>
  
  <script>
import MapVue from "./Map.vue";
import messageStore from "@/utils/messages";
import qrreader from "./QRReader.vue";
import QRCreator from "./QRCreator.vue";

export default {
  name: "HelloWorld",
  components: { MapVue, qrreader, QRCreator },
  setup() {},
  data: () => ({
    sendingTimestamps: false,
    scanKey: false,
    device: null,
    sharedKey: null,
    tempMessage: null,
    showMsg: false,
    notificationPermission: false,
    lastMessageRecieved: "",
    showMap: false,
    parentData: { lat: null, long: null },
    otherPinSent: { lat: null, long: null },
    isDeviceConnected: false,
    intervalTimestamp: 15000,
    testing: false,
    snackbar: false,
    server: null,
    strBuild: null,
    messageQueue: [],
    isSending: false,
    recievingMessage: false,
    haveStart: false,
    tempID: null,
    affirmRefresh: false,
    progress: 0,
    startTime: null,
    messageType: 0, //0=msg, 1= pin , 2 = location
    shareLocation: false,
  }),
  created() {},
  mounted() {
    const storedObject = localStorage.getItem("messages");
    if (storedObject) {
      messageStore.setMessages(JSON.parse(storedObject));
    }

    this.intervalID = setInterval(() => {
      this.affirmRefresh = true;
      this.saveMessagesToStorage();
      this.affirmRefresh = false;
    }, 20000);
  },
  methods: {
    generateKey() {
      this.sharedKey = messageStore.makeid(200);
    },
    async newBLEConnection() {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ["00006969-0000-1000-8000-00805f9b34fb"] },
          //,'00007070-0000-1000-8000-00805f9b34fb'
        ],
        optionalServices: ["00007070-0000-1000-8000-00805f9b34fb"],
      });

      this.server = await this.device.gatt.connect();

      const service = await this.server.getPrimaryService(
        "00007070-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00006789-0000-1000-8000-00805f9b34fb"
      );
      await characteristic.startNotifications();
      characteristic.addEventListener(
        "characteristicvaluechanged",
        this.getMessageFromBluetoothService
      );

      this.isDeviceConnected = true;

      this.device.addEventListener(
        "gattserverdisconnected",
        this.onDisconnected
      );
    },
    async disconnect() {
      try {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener(
          "characteristicvaluechanged",
          this.onDataReceived
        );
        this.connected = false;
      } catch (error) {
        console.error(error);
      }
    },
    async timer(ms) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    },
    onDisconnected() {
      this.isDeviceConnected = false;
      this.snackbar = true;
    },
    async getMessageFromBluetoothService(event) {
      try {
        this.recievingMessage = true;

        let value = event.target.value;
        var enc = new TextDecoder("utf-8");
        var msg = enc.decode(value);
        console.log(msg);

        if (msg.startsWith("A|")) {
          //ack msg recieved
          if (msg.length > 2) {
            var ID = msg.substring(2);
            var localMessages = messageStore.getMessages().filter((x) => x.id == ID);
            if(localMessages.length>0){
              localMessages[0].recieved = true;
            }
            else{
              console.log("recived a affirm but cannot find id?");
            }
            this.recievingMessage = false;
            this.affirmRefresh = true;
            this.$forceUpdate();
            this.affirmRefresh = false;
          }
        } else if (msg.startsWith("LID|")) {
          this.messageType = 2;
          this.strBuild = "";
          this.tempID = msg.substring(4);
        } else if (msg.startsWith("PID|")) {
          this.messageType = 1;
          this.strBuild = "";
          this.tempID = msg.substring(4);
        } else if (msg.startsWith("MID|")) {
          this.messageType = 0;
          this.strBuild = "";
          this.tempID = msg.substring(4);
        } else if (msg.startsWith("0|")) {
          this.haveStart == true;
          this.strBuild = this.strBuild + msg.substring(2);
        } else if (msg.startsWith("*|")) {
          var x = messageStore.getNewMessage(
            false,
            this.strBuild + msg.substring(2),
            false,
            this.sharedKey,
            false
          );
          if (this.tempID != null) {
            x.id = this.tempID;
          }
          //look for only + at the start
          if (!msg.substring(0, 2).includes("+")) {
            //send ack
            if (this.messageType == 0) {
              messageStore.pushMessage(x);
              await this.sendMessage("A|" + x.id);
              await this.timer(1500);
            } else if (this.messageType == 1) {
              x.isPin = true;
              this.decryptMessage(x, x.sharedKey); //detect lat long but not flash messages anymore
            } else {
              x.isLocation = true;
              this.decryptMessage(x, x.sharedKey); //detect lat long but not flash messages anymore
            }
            this.recievingMessage = false;
            this.tempID = null;
          }
          if (document.hidden) {
            this.createNotification();
          }
          this.strBuild = "";
        } else {
          this.strBuild = this.strBuild + msg.substring(2);
        }
      } catch (ex) {
        console.log(ex);
      }
    },
    async sendMessage(msg) {
      var service = await this.server.getPrimaryService(
        "00006969-0000-1000-8000-00805f9b34fb"
      );
      var stringCharacteristics = await service.getCharacteristic(
        "00009876-0000-1000-8000-00805f9b34fb"
      );
      var enc = new TextEncoder(); // always utf-8
      await stringCharacteristics.writeValueWithResponse(enc.encode(msg));
    },
    async batchSendMessage() {
      this.isSending = true;
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue[0];
        //try to not talk over each other
        if (!this.recievingMessage) {
          try {
            // MID= message id
            // LID= Location ID
            // PID = Pin ID       all message id's just no need to render
            if (!message.isLocation && !message.isPin) {
              await this.sendMessage("MID|" + message.id);
            } else if (message.isPin) {
              await this.sendMessage("PID|" + message.id);
            } else {
              await this.sendMessage("LID|" + message.id);
            }

            await this.timer(1200);

            var msg = message.text;
            if (msg.length < 30) {
              await this.sendMessage("*|" + msg);
              this.messageQueue.shift();
            } else {
              if (msg.length < 301) {
                //try to break them into ten messages 30 chars with 0| 1| and count down
                var batch = msg.match(/.{1,30}/g);
                console.log(batch);
                await this.loopMessage(batch);
                this.messageQueue.shift();
              }
            }
          } catch (error) {
            console.error(error);
            if (message.retries > 0) {
              // Decrement retries and add message to end of queue
              message.retries--;
              this.messageQueue.push(message);
            } else {
              // Remove message from queue if retries are exhausted
              this.messageQueue.shift();
            }
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
          this.recievingMessage = false;
        }
      }
      this.isSending = false;
    },
    async loopMessage(batch) {
      for (var i = 0; i < batch.length; i++) {
        var prefix = i;
        if (i == batch.length - 1) {
          prefix = "*";
        }
        await this.sendMessage(prefix + "|" + batch[i]);
        await this.timer(1200);
      }
    },
    createNotification() {
      const title = "Lora Recieved New Message";
      const img = "/img/lora.png";
      const options = {
        body: "Message Recieved",
        icon: img,
      };

      new Notification(title, options);
    },
    timeStampMessageSender(sending) {
      var _this = this;
      this.testing = true;

      if (!sending) {
        clearInterval(this.intervalID);
        this.sendingTimestamps = false;
      } else {
        this.sendingTimestamps = true;
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
          false,
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
            false,
            false
          );
        }, this.intervalTimestamp);
      }
    },
    toggleMap() {
      this.showMap = !this.showMap;
    },
    prepareMessage(msg, isLatLong = false, isPin = false) {
      var x = messageStore.getNewMessage(
        true,
        this.hashMessage(msg),
        isLatLong,
        this.sharedKey,
        false,
        isPin
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
    removeFromQueue(x){
     messageStore.removeMessage(x);
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
      var iv = this.$CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
      const encryptedText = this.$CryptoJS.AES.encrypt(
        str,
        this.sharedKey,
        {iv: iv}
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
          if (this.detectLatLong(decryptedText, message.isPin)) {
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
    detectLatLong(message, isPin) {
      const regex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      const match = message.match(regex);

      if (match) {
        const lat = parseFloat(match[1]);
        let long = match[4];

        if (match[0].includes(",-")) {
          long = "-" + long;
        }

        if (isPin) {
          this.otherPinSent.lat = null;
          this.otherPinSent.long = null;
          var tempPin = { lat: lat, long: long };
          this.otherPinSent = tempPin;
        } else {
          this.parentData.lat = null;
          this.parentData.long = null;
          var temp = { lat: lat, long: long };
          this.parentData = temp;
        }

        console.log(`Latitude: ${lat}, Longitude: ${long}`);
      } else {
        //console.log("No latitude and longitude found in string.");
      }
      return match;
    },
    saveMessagesToStorage() {
      if (!this.recievingMessage) {
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
      if (window.confirm("Are you sure you want to delete this chat thread?")) {
      localStorage.removeItem("messages");
      this.messages = [];
      window.location.reload();
      }
    },
    shouldRetry(dt) {
      let oldDate = new Date();
      if (Date.parse(dt)) {
        oldDate = new Date(dt);
      }
      const now = new Date();
      const past = new Date(now.getTime() - 20000);
      if (oldDate.getTime() < past.getTime()) {
        return true;
      } else {
        return false;
      }
    },
  },
  watch: {
    messages: {
      handler(newVal) {
        console.log("messages has changed:", newVal);
      },
      deep: true, // watch for nested changes
    },
  },
  computed: {
    messages() {
      return messageStore.getMessages();
    },
    stillSending() {
      return this.isSending;
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
  