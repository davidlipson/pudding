import React, { Component } from 'react';
import './App.css';
import {MapContainer, TileLayer, GeoJSON, LayersControl, FeatureGroup, Popup, Marker, Circle } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import uuid from 'react-uuid'
import { EditControl } from "react-leaflet-draw"
import * as ReactDOMServer from 'react-dom/server';
import 'bootstrap/dist/css/bootstrap.min.css';
import Boundary from './Boundary';
import Selector from './Selector';
import PropTip from './PropTip';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
          map: null,
        }
    }

    getGeoJson(source, field){
      try{
        const data = source.map((p) => {
          return {
            geometry: p[field],
            properties: p,
            type: "Feature"
          }
        })
        return data;
      }
      catch(e){
        console.log('error', e)
      }
        
    }

    updateMap = (map) => {
      this.setState({map})
    }

    getBufferGeoms(){
      let data = [];
      this.props.properties.forEach(p => { 
        data = data.concat(p.buffer_geoms);
      })
      console.log('buffgeom', data)
      return data
    }

    propClicked = (e) => {
      console.log(e)
    }

    handlePropertyClick(feature, layer){
        layer.on('click', function (e) {
          console.log(feature, layer, e)
          let address = feature.properties.fields.addresses.length > 0 ? feature.properties.fields.addresses[0] : "Unknown Address"
          L.popup()
            .setLatLng(e.latlng)
            .setContent(
              `<div className="tooltip-body">
                  <div className="tooltip-header">
                      ${address}
                  </div>
              </div>`)
            .openOn(this._map)
        })
    }

    /*{Object.keys(this.props.buffers).map(b => 
                        <FeatureGroup>
                          <GeoJSON key={uuid()} className={`buffer-gis-${Object.keys(this.props.buffers).indexOf(b) < 4 ? Object.keys(this.props.buffers).indexOf(b) : 4}`} data={this.getGeoJson(this.props.buffers[b].data, 'buffer_geom')} onEachFeature={this.handlePropertyClick}/>
                        </FeatureGroup>
                      )}*/
/*    updateLayers = () => {
      if(this.state.map){
        console.log('layers')
        this.props.layers.forEach(layer => {
          layer.data.forEach(d => {
            console.log(d)
            L.polyline(d.geom.coordinates, {color: 'red'}).addTo(this.state.map);
          })
        })
      }
    }*/

    render(){
      let gps = this.state.map ? this.state.map.locate() : null;
        return(
            <div className="right-side">
                  <MapContainer whenCreated={this.updateMap} className="map-view" key={this.props.mapuuid} center={this.props.centroid} zoom={this.props.zoom} scrollWheelZoom={false}>
                    <LayersControl>
                    <LayersControl.Overlay name="OpenStreetMap">
                      <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="Simplified">
                      <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                        />
                    </LayersControl.Overlay>

                      {this.props.layers.map(layer => {
                        return (<LayersControl.Overlay name={layer.name}>
                            <FeatureGroup>
                              <GeoJSON key={uuid()} className={layer.name.replace(" ", "-")} data={this.getGeoJson(layer.data, 'geom')}/>
                            </FeatureGroup>)
                          </LayersControl.Overlay>)
                      })}
                      
                      <LayersControl.Overlay checked name="Properties">
                      
                      <FeatureGroup>
                        <GeoJSON key={uuid()} className="second-gis" data={this.getBufferGeoms()}/>
                      </FeatureGroup>
                      <FeatureGroup>
                        <GeoJSON key={uuid()} className="first-gis" data={this.getGeoJson(this.props.properties, 'geom')} onEachFeature={this.handlePropertyClick}/>
                      </FeatureGroup>
                      
                      <FeatureGroup>
                        <GeoJSON key={uuid()} className="address-gis" data={this.getGeoJson(this.props.addresses, 'geom')} onEachFeature={this.handlePropertyClick}/>
                      </FeatureGroup>
                      <FeatureGroup>
                        <Boundary notifyBoundary={this.props.notifyBoundary} map={this.state.map}/>
                      </FeatureGroup>
                    </LayersControl.Overlay>
                  </LayersControl>
                </MapContainer>
            </div>
        )
      }
    }
    
    export default Map