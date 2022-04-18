import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextField from '@mui/material/TextField';


class Address extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: ""
        }
    }

    updateValue = (e) => {
        this.setState({address: e.target.value})
    }

    findAddress = () => {
        this.props.findAddress(this.state.address)
    }

  render(){
    return(   
              <div className="address-bar">
                  <TextField label="Search for an address, street or substring" className="address-search" id="outlined-basic" variant="outlined" onInput={this.updateValue.bind(this)}/>
                  <button onClick={this.findAddress}>locate</button>
              </div>
    )
  }
}

export default Address
