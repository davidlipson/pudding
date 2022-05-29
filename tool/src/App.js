import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

import Spinner from 'react-bootstrap/Spinner';
import Pagination from 'react-bootstrap/Pagination'
import 'bootstrap/dist/css/bootstrap.min.css';
import Highlighter from "react-highlight-words";
import uuid from 'react-uuid'

import Map from './Map';
import PropTable from './Table';
import Filter from './Filter';
import Buffer from './Buffer'
import Address from './Address';

import {useLocation} from "react-router-dom";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      properties: [],
      buffers: {},
      buffer_rules: {},
      base_tables: [],
      addresses: [],
      base_table: "property_merged",
      options: {},
      fields: {buffers: [], fields: []},
      centroid: [43.7432, -79.3832],
      query: "",
      loading: false,
      page: 1,
      limit: 100,
      mapuuid: uuid(),
      zoom: 11,
      query_id: this.props.query_id,
      saving_query: false,
      saving_layer: false,
      boundary: null,
      layers: []
    }
    this.updateFilter = this.updateFilter.bind(this)
    this.updateBuffers = this.updateBuffers.bind(this)
    this.clearBuffers = this.clearBuffers.bind(this)
  }

  componentDidMount(){
    this.getFields();
    this.getBufferFields();
    this.getOptions();
    this.getBaseTables();
    this.getLayers()
    if (this.props.query_id != null) this.runExistingQuery()
  }

  runExistingQuery = async () => {
    this.setState({loading: true})
    const url = `http://localhost:5000/query?id=${this.props.query_id}`;
    const response = await fetch(url)
    const data = await response.json()
    this.setState({properties: data.data, loading: false})
  }

  getFields = async () => {
    const url = `http://localhost:5000/fields?table=property_merged`;
    const response = await fetch(url)
    const data = await response.json()
    const currentFields = this.state.fields;
    currentFields.fields = data;
    this.setState({fields: currentFields})
  }

  getLayers = async () => {
    const url = `http://localhost:5000/layers`;
    const response = await fetch(url)
    const data = await response.json()
    console.log('data', data)
    this.setState({layers: data, mapuuid: uuid()})
  }

  getBaseTables = async () => {
    const url = `http://localhost:5000/tables`;
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)

    this.setState({base_tables: data.concat([{table_name: 'property_merged'}])})
  }

  getOptions = async() => {
    const url = `http://localhost:5000/options`;
    const response = await fetch(url)
    const data = await response.json()
    this.setState({options: data})
  }

  getBufferFields = async () => {
    const url = `http://localhost:5000/fields/buffer`;
    const response = await fetch(url)
    const data = await response.json()
    const currentFields = this.state.fields;
    currentFields.buffers = data;
    this.setState({fields: currentFields})
  }

  updateFilter(query){
    this.setState({query: query, query_id: null})
  }

  updateBuffers(buffers){
    this.clearBuffers();
    this.setState({buffer_rules: buffers})
    Object.keys(buffers).forEach(b => {
      if((typeof buffers[b].table != 'undefined') && (typeof buffers[b].distance != 'undefined')){
        this.getBuffer(buffers[b])
      }
    })
  }
 
  clearBuffers(){
    this.setState({buffer_rules: {}, buffers: {}, /*mapuuid: uuid(),*/ query_id: null})
  }

  getUsedBuffers = () => {
    let usedBuffers = {}
    Object.keys(this.state.buffer_rules).forEach(br => {
      if (this.state.query.includes(`${this.state.buffer_rules[br].alias}.buffer_geom`)){
        usedBuffers[this.state.buffer_rules[br].alias] = this.state.buffer_rules[br];
      }
    })
    return usedBuffers;
  }

  search = async () => {
      this.setState({loading: true})
      try{
        let usedBuffers = this.getUsedBuffers()
        const url = `http://localhost:5000/properties?base=${this.state.base_table}&filter=${encodeURIComponent(this.state.query)}&buffers=${encodeURIComponent(JSON.stringify(usedBuffers))}`;
        const response = await fetch(url)
        const data = await response.json()
        this.setState({properties: data, loading: false, query_id: null})
      }
      catch(e){
        console.log(e)
        this.setState({properties: [], loading: false})
      }
  }

  share = async () => {
    this.setState({saving_query: true})
    if (this.state.query_id == null){
      let usedBuffers = this.getUsedBuffers()
      const url = `http://localhost:5000/share?base=${this.state.base_table}&filter=${encodeURIComponent(this.state.query)}&buffers=${encodeURIComponent(JSON.stringify(usedBuffers))}`;
      const response = await fetch(url)
      const data = await response.json()
      this.setState({query_id: data[0].id})
    }
    this.setState({saving_query: false})
    alert(`Find this query again at: localhost:3000?query=${this.state.query_id}`)
  }

  // reduce reused code
  createLayer = async () => {
    let result = window.prompt("Are you sure you would like to create a layer out of this query? This may take some time. If so, give your layer a unique one-word name (no spaces or special characters) and press OK", "");
    if (result == null || result == "") {
      console.log("User cancelled the prompt.")
    } else {
      const format = /^[A-Za-z]+$/;
      if(format.test(result.trim())){
        this.setState({saving_layer: true})
        let usedBuffers = this.getUsedBuffers()
        const url = `http://localhost:5000/create?base=${this.state.base_table}&name=${result.trim()}&filter=${encodeURIComponent(this.state.query)}&buffers=${encodeURIComponent(JSON.stringify(usedBuffers))}`;
        const response = await fetch(url)
        const data = await response.json()
        if (data.status == 500) alert(data.message)
        this.setState({saving_layer: false})
        this.getBufferFields();
      }
      else{
        alert("Invalid layer name. Must be one word with no special characters (only alphabet).")
      }
    }
  }

  getBuffer = async (b) => {
    const url = `http://localhost:5000/buffer?table=${b.table}&distance=${b.distance}`;
    const response = await fetch(url)
    const data = await response.json()
    this.updateBuffer(b.alias, {data: data, table: b.table, distance: b.distance})
  }

  updateBuffer(table, data){
    let currentBuffers = this.state.buffers;
    currentBuffers[table] = data;
    this.setState({buffers: currentBuffers, /*mapuuid: uuid(), */ query_id: null})
  }

  prevPage = async (e) => {
    console.log(e)
  }

  nextPage = async (e) => {
    console.log(e)
  }

  updateMapFocus = async (centroid) => {
    window.scrollTo(0, 0)
    this.setState({centroid: centroid, mapuuid: uuid(), zoom: 18})
  }

  notifyBaseTable = (bt) => {
    this.setState({base_table: bt})
  }

  findAddress = async (a) => {
    const url = `http://localhost:5000/find?address=${a}&base=${this.state.base_table}`;
    const response = await fetch(url)
    const data = await response.json()
    if (data.length > 0) this.updateMapFocus([data[0].fields.centroid.y, data[0].fields.centroid.x])
    this.setState({addresses: data})
  }

  notifyBoundary = (b) => {
    this.setState({boundary: b})
  }

  /*
  <div className="pagination-nav">
                <Pagination>
                      <Pagination.Prev onClick={this.prevPage.bind(this)} disabled={this.state.page < 2}/>
                      <Pagination.Next onClick={this.nextPage.bind(this)}/>
                </Pagination>
              </div>*/

  render(){
    console.log(this.state.properties, this.state.address)
    return(
      <div className='app'>
        <Address findAddress={this.findAddress}/>
        <div className="top-side">
          <Map layers={this.state.layers} notifyBoundary={this.notifyBoundary} addresses={this.state.addresses} centroid={this.state.centroid} mapuuid={this.state.mapuuid} zoom={this.state.zoom} properties={this.state.properties} buffers={this.state.buffers}/>
          <div className="left-side">
            <Buffer fields={this.state.fields.buffers} update={this.updateBuffers} clear={this.clearBuffers}/>
            <Filter boundary={this.state.boundary} notifyBaseTable={this.notifyBaseTable} tables={this.state.base_tables} options={this.state.options} fields={this.state.fields} update={this.updateFilter} buffers={this.state.buffers}/>
          </div>
        </div>
        <div className="bottom-side">
        {(this.state.properties.length && !this.state.loading) || (this.state.addresses.length) ?
        <>
            {(this.state.properties.length && !this.state.loading) ? 
            <div className="results-table">
               <PropTable title="Properties" updateMapFocus={this.updateMapFocus} properties={this.state.properties}/> 
            </div> : <></>}
            {this.state.addresses.length ?
            <div className="results-table">
               <PropTable title="Addresses" updateMapFocus={this.updateMapFocus} properties={this.state.addresses}/>
            </div>
            : <></>}
        </>
        : 
            <div className="empty-table">
              {this.state.loading ? <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner> : 
              <span>No results found yet.</span>}
            </div>
          }
        </div>
        <div className="search-buttons-group">
                <button className="filter-button search-button" onClick={this.search.bind(this)}>search</button>
          		  <button className="filter-button share-button" onClick={this.share.bind(this)}>{this.state.saving_query ? "saving..." : "quick share"}</button>
                <button className="filter-button share-button" onClick={this.createLayer.bind(this)}>{this.state.saving_layer ? "saving..." : "create layer"}</button>
          	  </div>
      </div>
    )
  }
}

export default App
