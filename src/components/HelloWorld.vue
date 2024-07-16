<template>
  <div id="app">
    <h1>Arduino BLE Sensor Data</h1>
    <v-btn @click="connectToDevice">Connect to Device</v-btn>
    <div v-if="error" class="error">{{ error }}</div>
    <v-container v-if="isConnected" fluid>
      <v-simple-table style="text-align: left">
        <thead>
        </thead>
        <tbody>
          <tr>
            <td class="measurement">Altitude</td>
            <td class="value">{{ altitudeF }} feet</td>
          </tr>
          <tr>
            <td class="measurement">Pressure</td>
            <td class="value">{{ pressureH }} inHg</td>
          </tr>
          <tr>
            <td class="measurement">Temperature</td>
            <td class="value">{{ temperatureF }} °F</td>
          </tr>
          <tr>
            <td class="measurement">Humidity</td>
            <td class="value">{{ humidity }} %</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isConnected: false,
      temperatureC: null,
      temperatureF: null,
      pressureK: null,
      pressureH: null,
      humidity: null,
      altitudeM: null,
      altitudeF: null,
      error: null,
    };
  },
  methods: {
    async connectToDevice() {
      try {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ name: 'haddix diy kestrel' }],
          optionalServices: ['00007171-0000-1000-8000-00805f9b34fb'],
        });

        this.server = await this.device.gatt.connect();

        const service = await this.server.getPrimaryService(
          '00007171-0000-1000-8000-00805f9b34fb'
        );

        await this.readAllCharacteristics(service);
        this.isConnected = true;
      } catch (error) {
        console.error('Failed to connect or read from the device:', error);
        this.error = 'Failed to connect or read from the device.';
      }
    },
    async readAllCharacteristics(service) {
      try {
        await this.readCharacteristic(service, '10009876-0000-1000-8000-00805f9b34fb', 'temperatureC');
        await this.readCharacteristic(service, '20009876-0000-1000-8000-00805f9b34fb', 'temperatureF');
        await this.readCharacteristic(service, '30009876-0000-1000-8000-00805f9b34fb', 'pressureK');
        await this.readCharacteristic(service, '40009876-0000-1000-8000-00805f9b34fb', 'pressureH');
        await this.readCharacteristic(service, '50009876-0000-1000-8000-00805f9b34fb', 'humidity');
        await this.readCharacteristic(service, '60009876-0000-1000-8000-00805f9b34fb', 'altitudeF');
        await this.readCharacteristic(service, '70009876-0000-1000-8000-00805f9b34fb', 'altitudeM');
      } catch (error) {
        console.error('Error reading characteristics:', error);
        this.error = 'Error reading characteristics.';
      }
    },
    async readCharacteristic(service, uuid, property) {
      try {
        const characteristic = await service.getCharacteristic(uuid);
        const value = await characteristic.readValue();
        this[property] = this.parseValue(value, property);

        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          this[property] = this.parseValue(event.target.value, property);
        });
      } catch (error) {
        console.error(`Failed to read ${property}:`, error);
        // Optionally handle the error, retry, or perform recovery actions
        setTimeout(() => {
          this.readCharacteristic(service, uuid, property);
        }, 1000); // Retry after 5 seconds
      }
    },
    parseValue(value, property) {
      let parsedValue;
      switch (property) {
        case 'temperatureC':
        case 'temperatureF':
        case 'pressureK':
        case 'pressureH':
          parsedValue = value.getFloat32(0, true).toFixed(2);
          break;
        case 'humidity':
          parsedValue = value.getFloat32(0, true).toFixed(2);
          break;
        case 'altitudeM':
        case 'altitudeF':
          parsedValue = value.getFloat32(0, true).toFixed(2);
          break;
        default:
          parsedValue = 'N/A';
      }
      return parsedValue;
    },
  },
  computed: {
    pressureInHg() {
      return (this.pressureK * 0.2953).toFixed(2);
    },
    altitudeFeet() {
      return (this.altitudeM * 3.28084).toFixed(2);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.measurement {
  padding-right: 20px;
}

.value {
  padding-left: 20px;
}
</style>
