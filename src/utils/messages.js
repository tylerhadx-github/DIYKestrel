/* eslint-disable no-unused-vars */
import { ref } from 'vue';
import CryptoJS from 'crypto-js';

let messages = ref([]);
let message = ref({
    id: 0,
    text: null,
    yours: false,
    isLocation: false,
    sharedKey: null,
    isProccessed: false,
    retry: 3,
    recieved: false,
    sentDate: null,
    isPin: false,
});


 function setMessages(newMessages) {
  messages.value = newMessages;
}
 function pushMessage(message){
    messages.value.push(message);
}
function removeMessage(message) {
  const index = messages.value.indexOf(message);
  if (index !== -1) {
    messages.value.splice(index, 1);
  }
}

 function getMessages() {
  return messages.value;
}

 function getNewMessage(yours, text,isLocation,sharedKey,isProccessed, isPin){
  const date = new Date();
  const options = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  const formattedDate = date.toLocaleDateString('en-US', options);

    var x = Object.assign({}, message);
    x.id = makeid(20);
    x.yours = yours;
    x.text = text;
    x.sharedKey =sharedKey;
    x.isLocation= isLocation;
    x.isProccessed = isProccessed;
    x.sentDate = date;
    x.prettyDateTime = formattedDate;
    x.isPin = isPin;
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



  export default { messages,  getNewMessage, getMessages, setMessages, pushMessage, makeid, removeMessage};