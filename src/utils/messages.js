/* eslint-disable no-unused-vars */
import { ref } from 'vue';
import CryptoJS from 'crypto-js';

let messages = ref([]);
let message = ref({
    id: 0,
    text: null,
    yours: false,
    isLocation: false,
    isProccessed: false,
    retry: 1,
    recieved: false,
});


 function setMessages(newMessages) {
  messages.value = newMessages;
}
 function pushMessage(message){
    messages.value.push(message);
}

 function getMessages() {
  return messages.value;
}

 function getNewMessage(yours, text,isLocation,sharedKey,isProccessed){
    var x = Object.assign({}, message);
    x.id = makeid(20);
    x.yours = yours;
    x.text = text;
    x.sharedKey;
    x.isLocation= isLocation;
    x.isProccessed = isProccessed;
    return x;
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



  export default { messages,  getNewMessage, getMessages, setMessages, pushMessage};