<template>
  <v-container>
    <v-row>
      <v-col> Welcome to the chatroom {{ sharedKey }} </v-col>
      <v-col>
        <v-btn>Map</v-btn>
        <v-btn @click="leaveChat()">Exit</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div v-for="m in messages" :key="m.id">
          {{ decryptMessage(m.text) }}
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-text-field
            v-model="message"
            append-icon="mdi-send"
            
            variant="filled"
            clear-icon="mdi-close-circle"
            clearable
            label="Message"
            type="text"
            @click:append="sendMessage"
            @click:prepend="changeIcon"
            @click:clear="clearMessage"
            maxlength="150"
            counter
          ></v-text-field>
    </v-row>
  </v-container>
</template>
  
  <script>

export default {
  name: "ChatVue",
  props: ["sharedKey", "messages"],
  components: {},

  data: () => ({
    intervalID: null,
    arduinoDeviceConnected: false,
    phoneLocationRefreshInterval: 30000, 

    msg: {
      id: 0,
      text: null,
    },
    message: null,
    marker:true,
  }),
  methods: {
    toggleMarker () {
        this.marker = !this.marker
      },
      sendMessage () {
        var hashed= this.hashMessage(this.message);
        //var tmp = Object.create(this.msg);
        //tmp.text = hashed;
        //this.$emit("messageSent", JSON.stringify(tmp));
        this.$emit("messageSent", hashed);
        this.clearMessage()
      },
      clearMessage () {
        this.message = ''
      },
    leaveChat() {
      console.log("leaving chat: " + this.sharedKey);
      clearInterval(this.intervalID);
      this.$router.push("/");
    },
    
    hashMessage(str) {
      const encryptedText = this.$CryptoJS.AES.encrypt(
        str,
        this.sharedKey
      ).toString();
      return encryptedText;
    },
    decryptMessage(encryptedText) {
      const decryptedText = this.$CryptoJS.AES.decrypt(
        encryptedText,
        this.sharedKey
      ).toString(this.$CryptoJS.enc.Utf8);
      return decryptedText;
    },
    pushLocationMessage(coords) {
      var msg = "sending location: " + coords.latitude + "," + coords.longitude;
      var hsm = this.hashMessage(msg);
      var dsm = this.decryptMessage(hsm);
      console.log("unhash: " + dsm);
    },
    getPhoneLocation() {
      var _this = this;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          _this.pushLocationMessage(position.coords);
          return position.coords;
        },
        (error) => {
          console.log(error.message);
        }
      );
    }
  },
  mounted() {
    var _this = this;
    if (!this.sharedKey) {
      this.$router.push("/");
    }
    this.getPhoneLocation();
    this.intervalID = setInterval(function () {
      _this.getPhoneLocation();
    }, this.phoneLocationRefreshInterval);
  },
};
</script>
  