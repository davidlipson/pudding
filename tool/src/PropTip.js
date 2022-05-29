import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextField from '@mui/material/TextField';

class PropTip extends Component {
  constructor(props) {
    super(props);
    this.state = {
        tags: ""
    };
  }

    updateTags = (e) => {
        console.log(e)
    }


  render(){
    return(   
        <div className="tooltip-body">
            <div className="tooltip-header">
                {this.props.address}
            </div>
            <div className="add-prop-tags">
            <div className="tag-add">
                  <TextField id="outlined-basic" variant="outlined" onInput={this.updateTags.bind(this)}/>
                  <button onClick={() => alert()}>Add Tags</button>
              </div>
            </div>
        </div>
    )
  }
}

export default PropTip
