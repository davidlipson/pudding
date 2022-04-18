import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

class FilterRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        table: this.props.base_table,
        field: "",
        where: "",
        value: ""
    } 
    this.type_methods = {
        'string': {
            'Equals': [<TextField className="condition-tf" id="outlined-basic" variant="outlined" onInput={this.updateValue.bind(this)}/>], 
            'Starts': [<TextField className="condition-tf" id="outlined-basic" variant="outlined"  onInput={this.updateValue.bind(this)}/>], 
            'Substring': [<TextField className="condition-tf" id="outlined-basic" variant="outlined" onInput={this.updateValue.bind(this)}/>],
            'One Of': [<TextField className="condition-tf" id="outlined-basic" variant="outlined" onInput={this.updateValue.bind(this)}/>]
        },
        'number': {
            '=': [<TextField className="condition-tf" onInput={this.updateValue.bind(this)}
                id="outlined-number"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}/>], 
            '<': [<TextField className="condition-tf" onInput={this.updateValue.bind(this)}
                id="outlined-number"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}/>],
            '>': [<TextField className="condition-tf" onInput={this.updateValue.bind(this)}
                id="outlined-number"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}/>]
        },
        'array': {'Contains': [<TextField className="condition-tf" id="outlined-basic" variant="outlined" onInput={this.updateValue.bind(this)}/>]},
        'buffer': {
            'Within': []/*, 
            'Overlaps': []*/
        }
    }
  }

  componentWillUpdate(nextProps, nextState){
    if(this.state.table == "map-boundary" && !nextProps.boundary){
      this.setState({table: nextProps.base_table, field: "", where: "", value: ""})
    }

    if(this.state.table == this.props.base_table && nextProps.base_table != this.state.table && nextState.table == this.state.table){
      this.setState({table: nextProps.base_table, field: "", where: "", value: ""})
    }
    if(this.state.table != this.props.base_table && this.props.buffers != nextProps.buffers && !(this.state.table in nextProps.buffers)){
      this.setState({table: nextProps.base_table, field: "", where: "", value: ""})
    }
  }

  notifyQuery(){
      if(this.state.table == "map-boundary"){
        console.log(this.props.boundary)
        let query = `ST_Within(${this.props.base_table}.geom, ST_GeomFromGeoJSON('${JSON.stringify(this.props.boundary.toGeoJSON().geometry)}'))`
        this.props.update(this.props.uuid, query, this.state.table)
        return 
      }
      let field = `${this.state.table}.${this.state.field}`;
      if(this.state.table != "" && this.state.field == "intersects"){
        let query = `St_Intersects(${this.props.base_table}.geom, ${this.state.table}.buffer_geom)`;
        this.props.update(this.props.uuid, query, this.state.table)
      }
      else if (this.state.table != "" && this.state.field != "" && this.state.where != "" && this.state.value != ""){
        let query = "";
        if (this.getType() == 'array') {
          query = `(ARRAY[${this.state.value}]::varchar[] && ${field}::varchar[])`
        }
        else {
          switch(this.state.where){
            case "Equals":
                query = `${field} = '${this.state.value}'`
                break;
            case "One Of":
                query = `${field} in (${this.state.value})`
                break;
            case "Starts":
                query = `${field} like '${this.state.value}%'`
                break;
            case "Substring":
                query = `${field} like '%${this.state.value}%'`
                break;
            case "=":
                query = `${field} = ${this.state.value}`
                break;
            case ">":
                query = `${field} > ${this.state.value}`
                break;
            case "<":
                query = `${field} < ${this.state.value}`
                break;
            case "Contains":
                query = `'${this.state.value}' = ANY(${field})`
                break;
            default:
                query = "";
          }
        }
        
        this.props.update(this.props.uuid, query, this.state.table)
      }
      else{
        this.props.update(this.props.uuid, "", "")
      }
  }

  componentDidUpdate(prevProps, prevState){
    if ((prevState.table != this.state.table) || (prevState.field != this.state.field) 
    || (prevState.where != this.state.where) || (prevState.value != this.state.value)){
      this.notifyQuery();
    }
  }

  updateTable = async(e) => {
    this.setState({table: e.target.value, field: "", where: "", value: ""})
  }

  updateField = async(e) => {
    let field = e.target.value
    this.setState({field: field, where: "", value: ""})
  }

  updateWhere(e){
    this.setState({where: e.target.value, value: ""})
  }

  updateValue(e){
    let results = e.target.value
    if (this.state.where == 'One Of'){
      results = results.split(',');
      results = results.map(r => `'${r.trim()}'`)
      results = results.join(',')
    }
    this.setState({value: results.trim()})
  }

  updateACValue(e, v){
    let strings = v.map(i => `'${i[this.state.field]}'`).join(',');
    this.setState({value: strings.trim()})
  }

  getType(){
    return this.getTypeHelper(this.state.field, this.state.table)
  }

  getTypeHelper(field, t){
      if (field == 'intersects') return 'buffer';
      let table = this.props.fields.fields;
      if (t != "property_merged" && t == this.props.base_table){
        table = this.props.fields.buffers[this.state.table]
        console.log(table)
      }
      let r = 'string'
      table.forEach(f => {
        if (f.column_name == field){
            switch(f.data_type){
                case 'character varying':
                    r = 'string';
                    break;
                case 'integer':
                    r ='number';
                    break;
                case 'numeric':
                    r = 'number';
                    break
                case 'double precision':
                    r = 'number';
                    break;
                case 'ARRAY':
                    r = 'array';
                    break;
                case 'buffer':
                  r = 'buffer'
                  break;
                default:
                    return r;
            }
        }
      })
      return r;
  }

  getBufferFields(b){
    let rows = [<div className="filter-buffer-divider"></div>/*, <MenuItem value={`buffer-${b}`}><span className="filter-buffer-span">{b}</span></MenuItem>*/]
    this.props.fields.buffers[b].forEach(f => {
      rows.push(<MenuItem className="filter-buffer-field-span" value={`buffield-${b}-${f.column_name}`}><span>{b}: {f.column_name}</span></MenuItem>)
    })
    return rows;
  }

  getFields(){
    try{
      if(this.state.table == "property_merged") return this.props.fields.fields;
      if (this.state.table == this.props.base_table) return this.props.fields.buffers[this.state.table]
      return [{column_name: 'intersects', data_type: 'buffer'}].concat(this.props.fields.buffers[this.props.buffers[this.state.table].table])
    }
    catch(e){
      return []
    }
  }

  render(){
    const currentType = this.getType();
    const currentFields = this.getFields();
    console.log(this.state.table)
    const currentOptions =  this.state.field in this.props.options ? this.props.options[this.state.field] : []
    return(   
              <div className="filters-row">
                {this.props.uuid ? <button className="remove-filter-row" onClick={this.props.remove.bind(this, this.props.uuid)}>x</button> : <></>}
                <div className="buffer-filter buff-filter-a">
                  <InputLabel id="buffer-search-label">Table</InputLabel>
                  <Select
                    labelId="buffer-search-label"
                    id="buffer-search-select"
                    label="Table"
                    name="search_table"
                    value={this.state.table}
                    onChange={this.updateTable.bind(this)}
                  >
                    <MenuItem value={this.props.base_table}>{this.props.base_table}</MenuItem>
                    {this.props.boundary && <MenuItem value="map-boundary">inside boundary</MenuItem>}
                    {Object.keys(this.props.buffers).map(b => <MenuItem value={b}>{b}</MenuItem>)}
                  </Select>
               </div>

               {this.state.table != "map-boundary" &&
               <>
                <div className="buffer-filter buff-filter-a">
                  <InputLabel id="buffer-search-label">Field</InputLabel>
                  <Select
                    labelId="buffer-search-label"
                    id="buffer-search-select"
                    label="Field"
                    name="search_type"
                    value={this.state.field}
                    onChange={this.updateField.bind(this)}
                  >
                    {currentFields.map(f => <MenuItem value={f.column_name}>{f.column_name}</MenuItem>)}
                  </Select>
               </div>
               {this.state.field != "intersects" ? <><div className="buffer-filter buff-filter-a">
                    <InputLabel id="buffer-search-label">Where</InputLabel>
                    <Select
                      labelId="buffer-search-label"
                      id="buffer-search-select"
                      label="Where"
                      name="search_where"
                      value={this.state.where}
                      onChange={this.updateWhere.bind(this)}
                    >
                      {Object.keys(this.type_methods[currentType]).map(f => <MenuItem value={f}>{f}</MenuItem>)}
                    </Select>
                </div>
                <div className="buffer-filter buff-filter-b">
                {currentOptions.length && (this.state.where == "One Of" || this.state.where == "Contains") ? 
                <Autocomplete multiple className={`condition-tf ${this.state.value.split(',').length > 1 ? "autocomplete-tf" : ""}`}
                    getOptionLabel={(option) => option[this.state.field]}
                    disablePortal
                    options={currentOptions}
                    sx={{ width: 300 }}
                    onChange={this.updateACValue.bind(this)}
                    renderInput={(params) => <TextField {...params} label="" />}
                  /> : this.type_methods[currentType][this.state.where]}
              </div></> : <></>}
              </>
              }
               
              </div>
    )
  }
}

export default FilterRow
