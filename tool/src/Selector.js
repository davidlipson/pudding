import React, { Component } from 'react';
import './App.css';
import {MapContainer, TileLayer, GeoJSON, LayersControl, FeatureGroup, Popup, Marker, Circle } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw"

import 'bootstrap/dist/css/bootstrap.min.css';

class Selector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dc: null
        }
    }

    _onEdited = e => {
      let numEdited = 0;
      e.layers.eachLayer(layer => {
        this.props.notifyBoundary(layer);
        numEdited += 1;
      });
  
      // this._onChange();
    };
  
    _onCreated = e => {

      let type = e.layerType;
      let layer = e.layer;

      this.props.notifyBoundary(layer);
    };
  
    _onDeleted = e => {
      let numDeleted = 0;
      e.layers.eachLayer(layer => {
        numDeleted += 1;
      });
      this.props.notifyBoundary(null);
  
      // this._onChange();
    };
  
    _onEditStart = e => {
      console.log("_onEditStart", e);
    };
  
    _onEditStop = e => {
      console.log("_onEditStop", e);
    };
  
    _onDeleteStart = e => {
      console.log("_onDeleteStart", e);
    };
  
    _onDeleteStop = e => {
      console.log("_onDeleteStop", e);
    };
  
    _onDrawStart = e => {
       Object.keys(e.target._layers).forEach(la => {
            if (e.target._layers[la]._latlngs){
                e.target.removeLayer(e.target._layers[la])
            }
        })
    };

    render(){
        return(<div className="selector-group">
                        <EditControl
                          onEdited={this._onEdited}
                          onCreated={this._onCreated}
                          onDeleted={this._onDeleted}
                          onDrawStart={this._onDrawStart}
                          draw={{
                            /*polyline: {
                              icon: new L.DivIcon({
                                iconSize: new L.Point(8, 8),
                                className: "leaflet-div-icon leaflet-editing-icon"
                              }),
                              shapeOptions: {
                                guidelineDistance: 10,
                                color: "navy",
                                weight: 3
                              }
                            },*/
                            rectangle: true,
                            polyline: false,
                            circlemarker: false,
                            circle: false,
                            polygon: {
                              icon: new L.DivIcon({
                                iconSize: new L.Point(2, 2),
                                className: "leaflet-div-icon leaflet-editing-icon"
                              }),
                              shapeOptions: {
                                guidelineDistance: 10,
                                color: "red",
                                weight: 3
                              }
                            },
                            marker: false
                          }}
                        />
                </div>
        )
      }
    }
    
    export default Selector