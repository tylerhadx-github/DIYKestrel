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
// import Locate from "@arcgis/core/widgets/Locate";
// import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
// import Search from "@arcgis/core/widgets/Search";
// import Point from "@arcgis/core/geometry/Point";

export default {
  name: "MapVue",
  props:['otherLatLong'],
  data: () => ({
    view: null,
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
      this.view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-103.780928, 44.00853],
        zoom: 9,
      });
      /* eslint-enable no-unused-vars */

   

      // var locateBtn = new Locate({
      //   view: this.view,
        
      // });
    //   var searchWidget = new Search({
    //     view: this.view,
    //     popupOpenOnSelect: false,
    //   });
      // this.view.ui.add(locateBtn, {
      //   position: "top-right",
      // });
    //   this.view.ui.add(searchWidget, {
    //     position: "top-right",
    //   });
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
    this.$emit("messageSent",  coords.latitude + "," + coords.longitude);

    
    },
  },
};
</script>
