import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import uuid from 'react-uuid';
import BufferRow from './BufferRow';

class Buffer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buffers: {}
    }
    this.removeBuffer = this.removeBuffer.bind(this)
    this.updateBuffer = this.updateBuffer.bind(this)
    this.clearBuffers = this.clearBuffers.bind(this)
  }

  addBuffer = async () => {
    let currentBuffers = this.state.buffers;
    currentBuffers[uuid()] = {}
    this.setState({buffers: currentBuffers})
  }

  removeBuffer(u){
    let currentBuffers = this.state.buffers;
    delete currentBuffers[u]
    this.setState({buffers: currentBuffers})
  }

  clearBuffers(){
    this.setState({buffers: {}})
    this.props.clear();
  }

  updateBuffer(u, query){
    let currentBuffers = this.state.buffers;
    currentBuffers[u] = query
    this.setState({buffers: currentBuffers})
  }

  getAvailableTables(){
    let usedTables = {}
    Object.keys(this.props.fields).forEach(f => {
      Object.keys(this.state.buffers).forEach(b => {
        if (this.state.buffers[b].table == f){
          usedTables[f] = b
        }
      })
    })
    return usedTables
  }

  render(){
    const availableTables = /*this.getAvailableTables();*/ {}
    console.log(this.state.buffers)

    return(   
        <div className='buffers'>
          <div className="section-title">Buffers</div>
          <div className="section-subline">Create up to 5 buffers, one per table.</div>
          <div className="buffer-body">
          {Object.keys(this.state.buffers).map(b => {
            //const available = Object.keys(this.props.fields).filter(f => !(f in availableTables) || (b == availableTables[f]));
            // removed inability to have more than one of same table
            const available = Object.keys(this.props.fields)
            if (available.length > 0){
              return <BufferRow fields={available} key={b} uuid={b} remove={this.removeBuffer} update={this.updateBuffer}/>;
            }
            return <></>
          })}
          </div>
          <div className="buffer-buttons">
            {Object.keys(availableTables).length == Object.keys(this.props.fields).length ? <></> :
            <button onClick={this.addBuffer.bind(this)} disabled={Object.keys(this.state.buffers).length >= 5 ? true : false} className="add-buffer">+</button>}
            <button onClick={this.props.update.bind(this, this.state.buffers)}>Update</button>
            <button onClick={this.clearBuffers.bind(this)}>Clear</button>
          </div>
        </div>
    )
  }
}

export default Buffer

