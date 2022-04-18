import React, { Component } from 'react';
import './App.css';
import {MapContainer, TileLayer, GeoJSON, LayersControl, FeatureGroup, Popup, Marker, Circle } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import uuid from 'react-uuid'
import { EditControl } from "react-leaflet-draw"

import 'bootstrap/dist/css/bootstrap.min.css';
import Boundary from './Boundary';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
          map: null,
        }
    }

    getGeoJson(source, field){
        const data = source.map((p) => p['geom'])
        console.log('geom', data)
        return data;
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

    handlePropertyClick(feature, layer){
      //console.log(feature, layer);
    }

    /*{Object.keys(this.props.buffers).map(b => 
                        <FeatureGroup>
                          <GeoJSON key={uuid()} className={`buffer-gis-${Object.keys(this.props.buffers).indexOf(b) < 4 ? Object.keys(this.props.buffers).indexOf(b) : 4}`} data={this.getGeoJson(this.props.buffers[b].data, 'buffer_geom')} onEachFeature={this.handlePropertyClick}/>
                        </FeatureGroup>
                      )}*/

    render(){
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