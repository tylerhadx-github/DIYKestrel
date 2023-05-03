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
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Expand from "@arcgis/core/widgets/Expand";
// import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
export default {
  name: "MapVue",
  props: ["dataProp", "otherPin", "shareLocationUpdates"],
  data: () => ({
    pointGraphic: null,
    path: [],
    pathGraphic: new Graphic({
      geometry: null,
      symbol: {
        type: "simple-line",
        color: [0, 0, 255],
        width: 2,
      },
    }),
    phoneLocationRefreshInterval: 15000,
    msgObj: {
      id: 0,
      text: null,
      yours: true,
    },
    otherLat: null,
    otherLong: null,
  }),
  mounted() {
    //var _this = this;
    //this.getPhoneLocation();
    this.intervalID = setInterval(function () {
      //_this.getPhoneLocation();
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

      view.on('click', (event) => {
        this.addPoint(event.mapPoint);
      });

      this.graphicsLayer = new GraphicsLayer();
      map.add(this.graphicsLayer);

      this.pointGraphicLayer = new GraphicsLayer();
      map.add(this.pointGraphicLayer);
      
      this.pinGraphicLayer = new GraphicsLayer();
      map.add(this.pinGraphicLayer);

      const locateWidget = new Locate({
        view: view,
      });

      view.ui.add(locateWidget, "top-left");

      var basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div"),
      });
      var bgExpand = new Expand({
        view: view,
        content: basemapGallery,
      });
      basemapGallery.watch("activeBasemap", function () {
        var mobileSize =
          view.heightBreakpoint === "xsmall" ||
          view.widthBreakpoint === "xsmall";
        if (mobileSize) {
          bgExpand.collapse();
        }
      });
      view.ui.add(bgExpand, "top-right");
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
      this.$emit("messageSent", coords.latitude + "," + coords.longitude);
    },
    addPointToPath(longitude, latitude) {
      // Add the new point to the path array
      this.path.push([longitude, latitude]);

      // Force the computed property to recompute and trigger the watcher
      this.polyline;
    },
    async addPoint(mapPoint) {
      const point = new Point({
        x: mapPoint.longitude,
        y: mapPoint.latitude,
        spatialReference:  { wkid: 4326 } // assuming the points are in WGS84
      });


        const pointGraphic = new Graphic({
          geometry: point,
          symbol: {
            type: 'simple-marker',
            color: [255, 0, 0],
            size: 12,
            outline: {
              color: [255, 255, 255],
              width: 2
            }
          }
        });
        this.pinGraphicLayer.removeAll();
        this.pinGraphicLayer.add(pointGraphic);

        var msg = "sending ping: " +mapPoint.latitude + "," + mapPoint.longitude;
      console.log(msg);
      this.$emit("pinSent", mapPoint.latitude + "," + mapPoint.longitude);
      },
      
  },
  computed: {
    computedProp() {
      return this.dataProp;
    },
    otherPinSent(){
      return this.otherPin;
    },
    polyline() {
      if (this.path.length > 0) {
        return new Polyline({
          paths: [this.path],
          spatialReference: { wkid: 4326 } // assuming the points are in WGS84
        });
      } else {
        return null;
      }
    },
  },
  watch: {
    computedProp(newVal, oldVal) {
      const point = new Point({
        longitude: newVal.long,
        latitude: newVal.lat,
      });

      this.otherLat = newVal.lat;
       this.otherLong = newVal.long;

       
      const symbol = new SimpleMarkerSymbol({
        color: [226, 119, 40],
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      });

      const graphic = {
        geometry: point,
        symbol: symbol,
      };
      this.pointGraphicLayer.removeAll();//remove previous ones and only show current
      this.pointGraphicLayer.add(graphic);

      this.addPointToPath(this.otherLong, this.otherLat);
    },
    otherPinSent(newVal, oldVal) {
      const point = new Point({
        longitude: newVal.long,
        latitude: newVal.lat,
      });
      const symbol = new SimpleMarkerSymbol({
        color: [128, 0, 128],
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      });

      const graphic = {
        geometry: point,
        symbol: symbol,
      };
      this.pinGraphicLayer.removeAll();//remove previous ones and only show current
      this.pinGraphicLayer.add(graphic);
    },
    polyline(newPolyline) {
      // Remove the old polyline graphic from the graphics layer
      this.graphicsLayer.removeAll();

      // Create a new polyline graphic using the new polyline geometry and add it to the graphics layer
      const polylineGraphic = {
        geometry: newPolyline,
        symbol: {
          type: "simple-line",
          color: [226, 119, 40],
          width: 4,
        },
      };
      this.graphicsLayer.add(polylineGraphic);
    },
    shareLocationUpdates(newVal,oldVal){
      if(newVal){
         var _this = this;
        this.getPhoneLocation();
        this.intervalID = setInterval(function () {
          _this.getPhoneLocation();
        }, this.phoneLocationRefreshInterval);
      }
    }
  },
};
</script>