<template>
  <div id="app">
    <h1>Arduino BLE Sensor Data</h1>
    <button @click="connect">Connect to Device</button>
    <div v-if="connected">
      <p>Temperature: {{ temperature }} °C / {{ temperatureFahrenheit }} °F</p>
      <p>Pressure: {{ pressure }} kPa / {{ pressureInHg }} inHg</p>
      <p>Humidity: {{ humidity }} %</p>
      <p>Altitude: {{ altitude }} meters / {{ altitudeFeet }} feet</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      device: null,
      server: null,
      temperature: null,
      temperatureFahrenheit: null,
      pressure: null,
      pressureInHg: null,
      humidity: null,
      altitude: null,
      altitudeFeet: null,
      connected: false,
    };
  },
  methods: {
    async connect() {
      try {
        const serviceUuid = "000002902-0000-1000-8000-00805f9b34fb";
        const characteristicUuids = {
          temperature: "2A6E",
          pressure: "2A6D",
          humidity: "2A6F",
          altitude: "2A6C",
        };

        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [serviceUuid] }],
        });

        this.server = await this.device.gatt.connect();
        const service = await this.server.getPrimaryService(serviceUuid);

        this.readCharacteristic(service, characteristicUuids.temperature, 'temperature', 'temperatureFahrenheit', (value) => {
          return { celsius: value.getFloat32(0, true), fahrenheit: (value.getFloat32(0, true) * 9.0 / 5.0) + 32.0 };
        });
        this.readCharacteristic(service, characteristicUuids.pressure, 'pressure', 'pressureInHg', (value) => {
          const pressure = value.getUint32(0, true) / 10000;
          return { kPa: pressure, inHg: pressure * 0.2953 };
        });
        this.readCharacteristic(service, characteristicUuids.humidity, 'humidity', null, (value) => {
          return { humidity: value.getInt16(0, true) / 100 };
        });
        this.readCharacteristic(service, characteristicUuids.altitude, 'altitude', 'altitudeFeet', (value) => {
          const altitude = value.getInt16(0, true);
          return { meters: altitude, feet: altitude * 3.28084 };
        });

        this.connected = true;
      } catch (error) {
        console.error("There was an error:", error);
      }
    },
    async readCharacteristic(service, characteristicUuid, dataField, secondaryField, parser) {
      const characteristic = await service.getCharacteristic(characteristicUuid);
      characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const parsedValue = parser(value);
        this[dataField] = parsedValue[Object.keys(parsedValue)[0]];
        if (secondaryField) {
          this[secondaryField] = parsedValue[Object.keys(parsedValue)[1]];
        }
      });
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
</style>
