<template>
  <div
    id="viewDiv"
    :width="'100%'"
    style="align-content: center; height: 80vh"
  ></div>
</template>

<script>
import esriConfig from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Locate from "@arcgis/core/widgets/Locate";
import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";

// import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
// import Search from "@arcgis/core/widgets/Search";

export default {
  name: "MapVue",
  props: ['dataProp'],
  data: () => ({
    pointGraphic: null,
    path: new Polyline({
      paths: [[]],
      spatialReference: { wkid: 4326 },
    }),
    pathGraphic: new Graphic({
      geometry: null,
      symbol: {
        type: "simple-line",
        color: [0, 0, 255],
        width: 2,
      },
    }),
    phoneLocationRefreshInterval: 30000,
    msgObj: {
      id: 0,
      text: null,
      yours: true,
    },
    // otherLatLong: {
    //   Lat: null,
    //   Long: null,
    // },
  }),
  mounted() {
    
    // eslint-disable-next-line no-unused-vars
    var _this = this;
    this.getPhoneLocation();
    this.intervalID = setInterval(function () {
      _this.getPhoneLocation();
    }, this.phoneLocationRefreshInterval);

    this.LoadData();
  },
  methods: {
    LoadData() {
      esriConfig.apiKey =
        "AAPKfe0695aa5c18433e899f8170f7fb03d5LJ9EfdgSvRhqZaT2Ldm4cCPMrHxGha7GztsZ_hVGZ6BK5HOdGt5CxAqTWO71Qlmg";
      // Add a map to the view
      const map = new Map({
        basemap: "arcgis-imagery",
      });
      /* eslint-disable no-unused-vars */
      const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-103.780928, 44.00853],
        zoom: 9,
      });

      
        this.graphicsLayer = new GraphicsLayer();
        map.add(this.graphicsLayer);

        const locateWidget = new Locate({
          view: view,
        });

        view.ui.add(locateWidget, "top-left");
      

      //this.view.graphics.add(this.pathGraphic);

      //   var basemapGallery = new BasemapGallery({
      //     view: this.view,
      //     container: document.createElement("div"),
      //   });
      //   var bgExpand = new Expand({
      //     view: this.view,
      //     content: basemapGallery,
      //   });
      //   basemapGallery.watch("activeBasemap", function () {
      //     var mobileSize =
      //       this.view.heightBreakpoint === "xsmall" ||
      //       this.view.widthBreakpoint === "xsmall";
      //     if (mobileSize) {
      //       bgExpand.collapse();
      //     }
      //   });
      //   this.view.ui.add(bgExpand, "top-right");
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
    },
    pushLocationMessage(coords) {
      var msg = "sending location: " + coords.latitude + "," + coords.longitude;
      console.log(msg);

      //   var hsm = this.hashMessage(msg);
      //   var dsm = this.decryptMessage(hsm);
      //   console.log("unhash: " + dsm);
      this.$emit("messageSent", coords.latitude + "," + coords.longitude);
    },
    pushOtherLatLongToPath(lat, long) {
      this.path.paths[0].push([long, lat]);
      this.pathGraphic.geometry = this.path;
      //this.view.graphics.add(this.pathGraphic);
    },

  },
  computed:{
    computedProp(){
      return this.dataProp;
    }
  },
  watch: {
    computedProp(newVal, oldVal){
      const point = new Point({
          longitude: newVal.long,
          latitude: newVal.lat,
        });

        //this.pushOtherLatLongToPath(newVal.lat, newVal.long);

        const symbol = new SimpleMarkerSymbol({
          color: [226, 119, 40],
          size: 12,
          outline: {
            color: [255, 255, 255],
            width: 1,
          },
        });

        // Create a graphic and add it to the graphics layer
        const graphic = {
          geometry: point,
          symbol: symbol,
        };

        this.graphicsLayer.add(graphic);
    },
  },
};
</script>
