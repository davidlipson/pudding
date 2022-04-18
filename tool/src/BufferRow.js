import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

class BufferRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        table: "",
        distance: 0,
        error: false
    }
    
  }

  componentDidUpdate(p, s){
    if((s.table != this.state.table) || (s.distance != this.state.distance)){
      if(this.state.table == ""){
        this.props.update(this.props.uuid, {})
      }
      else{
        this.props.update(this.props.uuid, {table: this.state.table, distance: this.state.distance, alias: `${this.state.table}_${this.state.distance}m`})
      }
    }
  }

  updateTable(e){
    this.setState({table: e.target.value, distance: 0})
  }

  updateDistance(e){
    if(e.target.value == ""){
        this.setState({distance: 0, error: true})
    }
    else{
        this.setState({distance: parseInt(e.target.value), error: false})
    }
  }

  render(){
    return(   
        <div className='buffer-row'>
                <button className="remove-filter-row" onClick={this.props.remove.bind(this, this.props.uuid)}>x</button>
                <div className="buffer-filter buffer-table-name">
                  <InputLabel id="buffer-search-label">Table</InputLabel>
                  <Select
                    labelId="buffer-search-label"
                    id="buffer-search-select"
                    label="Table"
                    name="search_type"
                    onChange={this.updateTable.bind(this)}
                  >
                    {this.props.fields.map(f => <MenuItem value={f}>{f}</MenuItem>)}
                  </Select>
               </div>
               <div className="buffer-filter">
                <TextField className="condition-tf" onInput={this.updateDistance.bind(this)}
                id="outlined-number"
                type="number"
                value={this.state.distance}
                label="Meters"
                error={this.state.error}
                helperText={this.state.error && "Set to 0 if left blank." || ""}
                InputLabelProps={{
                    shrink: true,
                }}/>
               </div>
        </div>
    )
  }
}

export default BufferRow

