import React, { Component } from 'react';

import './App.css';
import {MapContainer, TileLayer, GeoJSON, LayersControl, FeatureGroup, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import uuid from 'react-uuid'

import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table'
import Pagination from 'react-bootstrap/Pagination'
import 'bootstrap/dist/css/bootstrap.min.css';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import {
  F_TYPES, 
  AREA_NAMES,
  ZONES
} from './filters.js';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
      sql: "",
      properties: [],
      loading: false,
      page: 1,
      limit: 100,
      fullscreen: false,
      ftypes: [],
      neighbourhoods: [],
      zones: [],
      centroid: [43.7432, -79.3832],
      mapuuid: uuid(),
      zoom: 10,
      street: "",
      results_filters: {},
      buffer: {
        search_type: "",
        distance: "",
        field: "",
        filter: ""
      }
    }
  }

  share(e){
    alert();
  }

  getBufferFilter(){
    let bufferString = "";
    for (const [key, val] of Object.entries(this.state.buffer)){
      if (val === "") return "";
      bufferString = `${bufferString}&buffer_${key}=${val}`
    }
    return bufferString
  }

  getStringsFilterQuery(s, field, cond){
    let queryString = [];
    s.trim().split(',').forEach(str => {
      if (str.trim().length > 0) queryString.push(`${field} ilike '%25${str.trim()}%25'`);
    })
    if (queryString.length === 0) return ""
    const condition = ` ${cond} `
    return `(${queryString.join(condition)})`
  }

  search = async (q, p = 1) => {
    const bufferFilter = this.getBufferFilter();
    const streetsFilter = this.getStringsFilterQuery(this.state.street, 'lfnames::text', "or")

    if (this.state.ftypes.length > 0) q.push(`f_type in ('${this.state.ftypes.join("', '")}')`);
    if (this.state.neighbourhoods.length > 0) q.push(`area_name in ('${this.state.neighbourhoods.join("', '")}')`);
    if (this.state.zones.length > 0) q.push(`zn_zone in ('${this.state.zones.join("', '")}')`);
    if (streetsFilter !== "") q.push(streetsFilter)
    
    const url = `http://localhost:5000/properties?filter=${q.join(' AND ')}&limit=${this.state.limit}&page=${p}${bufferFilter}`;
    console.log(url)
    const response = await fetch(url)
    console.log(response)
    const data = await response.json()
    console.log(data)
    if (this.state.properties !== data && data.length){
          //this.setState({properties: data, loading: false, page: p, centroid: JSON.parse(data[0].centroid).coordinates.reverse(), mapuuid: uuid(), zoom: 12})
          this.setState({properties: data, loading: false, page: p})
    }
    else{
      this.setState({loading: false, zoom: 10})
    }
  }

  run(){
    this.setState({loading: true, results_filters: {}})
    this.search([])
  }

  updateSql(e){
    this.setState({sql: e.target.value});
  }

  getGeoJson(column){
    const data = this.state.properties.map((p) => p[column])
    return data;
  }

  nextPage(){
    this.setState({loading: true, results_filters: {}})
    this.search([], this.state.page + 1)
  }

  prevPage(){
    if (this.state.page > 1){
      this.setState({loading: true, results_filters: {}})
      this.search([], this.state.page - 1)
    }
  }

  changeLimit(e){
    this.setState({limit: e.target.value});
  }

  toggleScreen(){
    this.setState({fullscreen: !this.state.fullscreen})
  }

  toggleFtypes = (e, values) => {
    this.setState({ftypes: values})
  }

  toggleNeighbourhoods = (e, values) => {
    this.setState({neighbourhoods: values})
  }

  toggleZones = (e, values) => {
    this.setState({zones: values})
  }

  selectRow(e){
    window.scrollTo(0, 0)
    console.log(e.centroid)
    this.setState({centroid: [e.centroid.y, e.centroid.x], mapuuid: uuid(), zoom: 18});
  }

  updateStreetSearch(e){
    this.setState({street: e.target.value})
  }

  updateResultsFilter(e, k){
    let currentFilters = this.state.results_filters;
    currentFilters[e] = k.target.value
    this.setState({results_filters: currentFilters});
  }

  getFilteredResults(){
    const filteredResults = this.state.properties.filter(p => {
      for (const [key, val] of Object.entries(this.state.results_filters)){
        if (!String(p[key]).includes(val)) return false;
      }
      return true;
    });
    return filteredResults;
  }

  updateBuffer(e){
    let currentBuffer = this.state.buffer;
    currentBuffer[e.target.name] = String(e.target.value).trim();
    this.setState({buffer: currentBuffer})
  }

  handlePropertyClick(feature, layer){
    console.log(feature, layer);
  }

  render(){
    const currentResults = this.getFilteredResults();
    return(
      <div className='app'>
        <div className="top-side">
          <div className={`left-side ${this.state.fullscreen ? "toggledOff" : ""}`}>
          	<div className='filters'>
              <div className="filters-row">
                <div className="areas-filter street-filter">
                    <TextField
                      label="Street filter (comma delimit for multiple streets)"
                      type="search"
                      onChange={this.updateStreetSearch.bind(this)}
                    />
                </div>
              </div>
              <div className="filters-row">
                <div className="areas-filter">
                  <Autocomplete
                    multiple
                    id="tags-outlined"
                    options={F_TYPES}
                    getOptionLabel={(option) => option}
                    defaultValue={[]}
                    onChange={this.toggleFtypes.bind(this)}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="F_Types"
                        placeholder="Filter f_types"
                      />
                    )}
                  />
               </div>
              </div>
              <div className="filters-row">
                <div className="areas-filter">
                  <Autocomplete
                    multiple
                    id="tags-outlined"
                    limitTags={2}
                    options={AREA_NAMES}
                    getOptionLabel={(option) => option}
                    defaultValue={[]}
                    onChange={this.toggleNeighbourhoods.bind(this)}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Neighbourhoods"
                        placeholder="Filter neighbourhoods"
                      />
                    )}
                  />
               </div>
              </div>
              <div className="filters-row">
                <div className="areas-filter">
                  <Autocomplete
                    multiple
                    id="tags-outlined"
                    limitTags={2}
                    options={ZONES}
                    getOptionLabel={(option) => option}
                    defaultValue={[]}
                    onChange={this.toggleZones.bind(this)}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Zones"
                        placeholder="Filter zones"
                      />
                    )}
                  />
               </div>
              </div>
              <div className="filters-row buffer-row">
                <div className="buffer-filter">
                  <InputLabel id="buffer-search-label">Search</InputLabel>
                  <Select
                    labelId="buffer-search-label"
                    id="buffer-search-select"
                    label="Search"
                    name="search_type"
                    onChange={this.updateBuffer.bind(this)}
                  >
                    <MenuItem value="Within">Within</MenuItem>
                    <MenuItem value="Outside">Outside</MenuItem>
                    <MenuItem value="Borders">Borders</MenuItem>
                  </Select>
               </div>
               <div className="buffer-filter">
                  <InputLabel id="buffer-dist-label">KM</InputLabel>
                  <Select
                    labelId="buffer-dist-label"
                    id="buffer-dist-select"
                    name="distance"
                    onChange={this.updateBuffer.bind(this)}
                    label="KM"
                  >
                    {[1,2,3,4,5,10,25,50,100].map(dist => <MenuItem value={dist}>{dist}</MenuItem>)}
                  </Select>
               </div>
               <div className="buffer-filter">
                  <InputLabel id="buffer-field-label">Field</InputLabel>
                  <Select
                    labelId="buffer-field-label"
                    id="buffer-field-select"
                    name="field"
                    onChange={this.updateBuffer.bind(this)}
                    label="Field"
                  >
                    <MenuItem value="f_type">F_Type</MenuItem>
                    <MenuItem value="area_name">Neighbourhood</MenuItem>
                    <MenuItem value="zn_zone">Zone</MenuItem>
                  </Select>
               </div>
               <div className="buffer-filter">
                  <InputLabel id="buffer-filter-label">Filter</InputLabel>
                  <TextField className="buffer-filter-search"
                      label="Filter"
                      type="search"
                      name="filter"
                      onChange={this.updateBuffer.bind(this)}
                    />
               </div>
              </div>
              <div className="limit-filter">
                <span>Limit: {this.state.limit}</span>
                <input id='slider' type='range' min='1' max='5001' step='10' onChange={this.changeLimit.bind(this)}/>
              </div>
          		<textarea id="sql-editor" onKeyUp={this.updateSql.bind(this)}/>
          		<div className="search-buttons-group">
                <button className="filter-button search-button" onClick={this.run.bind(this)}>search</button>
          		  <button className="filter-button share-button" onClick={this.share}>share</button>
          	  </div>
            </div>
          </div>
          <div className={`right-side ${this.state.fullscreen ? "toggledFull" : ""}`}>
            <button onClick={this.toggleScreen.bind(this)} type="button" className="fullscreen btn btn-light"><span className="bi bi-fullscreen"></span></button>
          	<MapContainer key={this.state.mapuuid} center={this.state.centroid} zoom={this.state.zoom} scrollWheelZoom={false}>
            	<LayersControl>
                <LayersControl.Overlay checked name="OpenStreetMap">
                  <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Simplified">
                  <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                    />
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Properties">
                  <FeatureGroup>
                    <GeoJSON key={uuid()} className="first-gis" data={this.getGeoJson('geom')} onEachFeature={this.handlePropertyClick}/>
                    <Popup>
                      <p></p>
                      <button
                        id="button"
                        className="btn btn-primary"
                        onClick={(e) => {
                          console.log(e);
                        }}
                      >
                        More Info
                      </button>
                    </Popup>
                  </FeatureGroup>
                </LayersControl.Overlay>
                {false && this.state.properties.length && this.state.properties[0].buffer_geom.coordinates ?
                  <LayersControl.Overlay checked name="Buffer">
                    <GeoJSON key={uuid()} className="buffer-gis" data={[this.state.properties[0].buffer_geom]}/>
                  </LayersControl.Overlay> : null
                }
              </LayersControl>

            </MapContainer>
            </div>
        </div>
        <div className={`bottom-side ${this.state.fullscreen ? "toggledOff" : ""}`}>
        {(this.state.properties.length && !this.state.loading) ? 
            <div className="results-table">
              <div className="pagination-nav">
                <Pagination>
                      <Pagination.Prev onClick={this.prevPage.bind(this)} disabled={this.state.page < 2}/>
                      <Pagination.Next onClick={this.nextPage.bind(this)}/>
                </Pagination>
              </div>
              <Table striped bordered hover>
                <tbody>
                  <tr className="header-row">
                  {Object.keys(this.state.properties[0]).filter(x => !x.includes('geom') && !x.includes('centroid')).map(k => (
                    <th>{k}<TextField
                      label="Filter"
                      type="search"
                      onChange={this.updateResultsFilter.bind(this, k)}
                    /></th>
                  ))}
                  </tr>
                  {currentResults.map(p => (
                    <tr onClick={this.selectRow.bind(this, p)}>
                    {Object.keys(p).filter(x => !x.includes('geom') && !x.includes('centroid')).map((k, i) => (
                      <td>{String(p[k])}</td>
                    ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div> : 
            <div className="empty-table">
              {this.state.loading ? <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner> : 
              <span>No results found yet.</span>}
            </div>
          }
        </div>
      </div>
    )
  }
}

export default App
