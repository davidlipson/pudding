import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import uuid from 'react-uuid'
import FilterRow from './FilterRow';

class FilterGroup extends Component {
  constructor(props) {
    const first_filter = uuid();
    super(props);
    this.state = {
        filters: {first_filter: ""},
        children: {},
        condition: "and",
        branch_query: ""
    }
    this.removeChild = this.removeChild.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.updateChildQuery = this.updateChildQuery.bind(this);
  }
  
  addChild(){
    let currentChildren = this.state.children;
    currentChildren[uuid()] = "";
    this.setState({children: currentChildren})
  }

  componentDidUpdate(p,s){
      if(s.branch_query != this.state.branch_query){
        this.props.update(this.props.uuid, this.state.branch_query)
      }
      if(s.condition != this.state.condition){
          this.updateQuery();
      }
  }

  updateQuery(){
    let queries = [];
    Object.keys(this.state.filters).forEach(f => {
        if(this.state.filters[f].query != ""){
          if (this.state.filters[f].table != "map-boundary" && this.state.filters[f].table != this.props.base_table && typeof this.state.filters[f].query != 'undefined' && !this.state.filters[f].query.includes('St_Intersects')){
            queries.push(`St_Intersects(${this.props.base_table}.geom, ${this.state.filters[f].table}.buffer_geom)`)
          }
          queries.push(this.state.filters[f].query)
        }
    })
    let query = [`${queries.join(" and ")}`];
    Object.keys(this.state.children).forEach(f => {
        if(this.state.children[f] != "") query.push(this.state.children[f])
    })

    // fix this to handle empty queries
    if (query.length == 0 || query[0] == ""){
      this.setState({branch_query: ""})
    }
    else{
      this.setState({branch_query: `${this.props.uuid ? `${this.state.condition} ` : ""}(${query.join(" ")})`})

    }
  }

  updateChildQuery(u, query){
    let currentChildren = this.state.children;
    currentChildren[u] = query;
    this.setState({children: currentChildren})
    this.updateQuery();
  }


  updateFilter(u, query, table){
      let currentFilters = this.state.filters;
      currentFilters[u] = {query, table}
      this.setState({filters: currentFilters})
      this.updateQuery();
  }

  addFilter(){
      let currentFilters = this.state.filters
      currentFilters[uuid()] = "";
      this.setState({filters: currentFilters})
  }

  updateCondition(e, v){
      this.setState({condition: v})
  }

  removeChild(u){
      let currentChildren = this.state.children;
      delete currentChildren[u];
      this.setState({children: currentChildren});
      this.updateQuery();
  }

  removeFilter(u){
    let currentFilters = this.state.filters
    delete currentFilters[u]
    this.setState({filters: currentFilters})
    this.updateQuery();
  }

  render(){
    return(   
        <div className='filter-group'>
            {this.props.uuid ?
                <FormControl className="condition-group">
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    onChange={this.updateCondition.bind(this)}
                >
                    <FormControlLabel value="and" checked={this.state.condition == "and" ? true : false} control={<Radio />} label="AND" />
                    <FormControlLabel value="or" checked={this.state.condition == "and" ? false : true} control={<Radio />} label="OR" />
                </RadioGroup>
                </FormControl> : <></>
            } 
        
        {Object.keys(this.state.filters).map(f => <FilterRow boundary={this.props.boundary} base_table={this.props.base_table} options={this.props.options} key={f} uuid={f} fields={this.props.fields} buffers={this.props.buffers} update={this.updateFilter} remove={this.removeFilter}/>)}

         {Object.keys(this.state.children).map((child) => 
            <FilterGroup boundary={this.props.boundary} base_table={this.props.base_table} options={this.props.options} key={child} fields={this.props.fields} buffers={this.props.buffers} uuid={child} update={this.updateChildQuery} remove={this.removeChild}/> 
         )}

        <div className="add-condition">
            <button onClick={this.addFilter.bind(this)}>AND</button>
            <button onClick={this.addChild.bind(this)}>()</button>
            {this.props.uuid ? <button onClick={this.props.remove.bind(this, this.props.uuid)}>-</button> : <></>}
        </div>
        </div>
    )
  }
}

export default FilterGroup
