import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FilterGroup from './FilterGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
        properties: [],
        page: 1,
        limit: 100,
        full_query: "",
        base_table: "property_merged"
    }
    this.updateFilter = this.updateFilter.bind(this)
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

  changeLimit(e){
    this.setState({limit: e.target.value});
  }

  updateFilter(u, query){
    this.setState({full_query: query})
    this.props.update(query);
  }

  updateBaseTable = (e) => {
    this.props.notifyBaseTable(e.target.value)
    this.setState({base_table: e.target.value})
  }

  /*<div className="limit-filter">
                <span>Limit: {this.state.limit}</span>
                <input id='slider' type='range' min='1' max='5001' step='10' onChange={this.changeLimit.bind(this)}/>
              </div>*/

  render(){
    console.log('buffers', this.props.buffers)
    return(   
        <div className='filters'>
              <div className="section-title">Filters</div>
              <div className="section-subline">Join filters on all pudding tables and buffers.</div>
              <div className="buffer-filter buff-filter-a base-table">
                  <InputLabel id="buffer-search-label">Base Table</InputLabel>
                  <Select
                    labelId="buffer-search-label"
                    id="buffer-search-select"
                    label="Field"
                    name="search_type"
                    value={this.state.base_table}
                    onChange={this.updateBaseTable}
                  >
                    {this.props.tables.map(t => <MenuItem value={t.table_name}>{t.table_name}</MenuItem>)}
                  </Select>
               </div>
              <FilterGroup boundary={this.props.boundary} base_table={this.state.base_table} options={this.props.options} update={this.updateFilter} fields={this.props.fields} buffers={this.props.buffers}/>
            </div>
    )
  }
}

export default Filter
