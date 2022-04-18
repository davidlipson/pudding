import React, { Component } from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css';

import TextField from '@mui/material/TextField';

class PropTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results_filters: {},
    }
  }

  selectRow(e){
    this.props.updateMapFocus([e.fields.centroid.y, e.fields.centroid.x])
  }


  updateResultsFilter(e, k){
    let currentFilters = this.state.results_filters;
    currentFilters[e] = k.target.value
    this.setState({results_filters: currentFilters});
  }

  getFilteredResults(){
    const filteredResults = this.props.properties.filter(p => {
      for (const [key, val] of Object.entries(this.state.results_filters)){
        if (!String(p.fields[key]).includes(val)) return false;
      }
      return true;
    });
    return filteredResults;
  }


  render(){
    const currentResults = this.getFilteredResults();
    return(
        <Table striped bordered hover>
                <tbody>
                  <tr className="header-row">
                  {Object.keys(this.props.properties[0].fields).filter(x => !x.includes('geom') && !x.includes('centroid')).map(k => (
                    <th>{k}<TextField
                      label="Filter"
                      type="search"
                      onChange={this.updateResultsFilter.bind(this, k)}
                    /></th>
                  ))}
                  </tr>
                  {currentResults.map(p => (
                    <tr onClick={this.selectRow.bind(this, p)}>
                    {Object.keys(p.fields).filter(x => !x.includes('geom') && !x.includes('centroid')).map((k, i) => (
                      <td>{String(p.fields[k])}</td>
                    ))}
                    </tr>
                  ))}
                </tbody>
        </Table>
    )
  }
}

export default PropTable