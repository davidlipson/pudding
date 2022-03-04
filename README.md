# *PUDDING*
PUDDING allows users to build complex queries against (Toronto) GIS data in order to find viable sites for PROOF projects, as well as determining scalable markets for development. A user can filter based on property-specific metrics (frontage, dimensions, zoning, etc) as well as by a site's proximity to other datapoints (custom points/polygons, infrastructure, other properties, schools, etc) in order to isolate for properties of interest.

***Outlined below is the core functionality of PUDDING v0.1, an internal tool for mapping and sharing gis filters. Further features are outlined [here](#version-x)***

### Stack

The tool consists of three primary elements:
  1. pudDB - a postgres/postgis database containing all gis layers in sql tables. 
  2. API - a series of endpoints which can query the PUDDB tables
  3. UI - a web application for filtering, mapping, sharing, and downloading data through accessing the API's endpoints.

### Using the UI

Generally, the most common use case of PUDDING will be through the UI in a web browser (ReactJS). The web app is made up of four windows for filtering, searching, and viewing pudDB queries:
  1. Buffers - a "buffer" is a named set of related geometries that have each been extended by some distance from their normal boundary. For example:
   
   ```
    Buffer all subway stations on the Bloor Line by 500 meters and call it 'Bloor Stations 500m'
   ```
    
  2. Filters - create and join any number of filters together based on property-level fields, or proximity to/distance from any buffer created in the Buffers window. For example:
   
   ```
    Filter for properties where...
      (Street Name includes 'Dundas' OR Street Name includes 'Bloor') AND
      (Within 'Bloor Stations 500m')
   ```
    
  3. Table Viewer - after pressing "Search", all properties that meet the Filters criteria will populate ever field in a table. The fields shown in the table can be selected or deselected to hide or view fields of importance/non-importance. Click on a row will recenter the Map around the specific property.
  4. Map Viewer - all properties will also show as blue shapes on an Open Street Map viewer. Different layers will be viewable/hideable to simplify the map.

### Using the API
Generally the API and DB layers will only be accessed by developers, but still worth noting that the API is built in NodeJS for future reference. The API will consist of a few basic endpoints:
  1. /properties - given an optional filter query, and limit and pagination fields, this returns all properties that meet any number of filter requirements, including any generated buffers.
  2. /buffer - returns a buffer of any kind (based on pudDB geometries, a set of coordinates or polygons, etc)
  3. TBD

### Using the DB
The pudDB data is currently sourcing data from the city's [open data portal](https://open.toronto.ca/catalogue/)

### Property-level data
The base property table is a merging of multiple gis layers, and will be extended as additional property-specific data becomes useful. Currently, the table provides each property with an address (or set of addresses in some cases), zone information, neighbourhood, and other open data information. Additional calculations, such as dimensions and frontage will be made and appended to this table. This is the primary table that is being filtered by the tool, and when buffers are included in the queries, this table joins with each buffer to isolate for properties that match both the filter requirements, and the buffer(s) requirements.

## V1.0 Development
PUDDING will be built in stages, on an as-needed bases. After the core functionality outlined above has been implemented **and** the tool has shown to be beneficial in finding a site for PROOF, only then will further features (vX) be built.
A beta of the tool has already been presented, and based on the feedback from this discussion, the tool will need to udnergo some restructuring for v1.0 to function as intended. A few steps will need to be taken over the coming weeks/months...
  1. Clearly structure the pudDB tables with all features/fields of interest and calculations taken into account. Model all fields in order to build generalizable filtering code (this will enable users to reliably filter on any field they want at any time without requiring new code changes when fields are added or changed)
  2. Clean up and generalize API endpoints
  3. Rewrite most of the UI code in a more componentized way to allow for more dynamic filtering/buffer creation (map and table shouldn't change much).

## Version X
In a future version, the tool could theoreticallly automate the entire process of design and report/pro forma generation. When a filter is generated, a user could selected a property, hit "Generate" and produce a PDF report (as well as additional assets such as Rhino/Grasshopper files, spreadsheets, filtered properties table file, etc) for presenting to potential developers. Properties that have generated reports attached to them, or properties that have been marked as "Favourites" can be stored so that in future queries, these properties are colour tagged in the Map Viewer, and may have additional information attached to them.
