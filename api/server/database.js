const postgres = require('pg')
const connectionString = process.env.DATABASE_URL

// Initialize postgres client
const client = new postgres.Client({
	user: "postgres",
	password: "",
	database: "puddb",
	port: 5434,
	host: "localhost",
	ssl: false
})

function generateBufferQuery(distance, field, filter){
	const table = {
		"area_name": "neighbourhood",
		"zn_zone": "zone_category"
	}
	if (table[field] && parseInt(distance) && filter && filter != ""){
		const bufferQuery = `
			select st_buffer(geom::geography, ${parseInt(distance) * 1000})::geometry as buffer_geom from ${table[field]} n where ${field} ilike '${filter}%'
		`
		return bufferQuery
	}
	return ""

}

// Connect to the DB
client.connect().then(() => {
	console.log(`Connected To ${client.database} at ${client.host}:${client.port}`)
}).catch((e) => {console.log(e)})

module.exports = {
	queryProperties: async (query) => {
		const page = parseInt(query.page)
		const limit = query.limit ? parseInt(query.limit) : 100
		const filter_string = query.filter ? ` where ${query.filter}` : ""
		
		const bufferQuery = generateBufferQuery(
			query.buffer_distance, 
			query.buffer_field, 
			query.buffer_filter
		)

        let propQuery = `select 
					gid, objectid,
					geom,
					ST_AsGeoJSON(zone_geom) zone_geom,
					ST_AsGeoJSON(neigh_geom) neigh_geom,
					f_type,
					zn_zone,
					area_name,
					lo_nums, lfnames, centroid from property_merged${filter_string}
				   `
						
        if (bufferQuery != ""){
        	propQuery = `select 
					gid, objectid,
					ST_AsGeoJSON(geom) geom,
					ST_AsGeoJSON(buffer_geom) buffer_geom,
					ST_AsGeoJSON(zone_geom) zone_geom,
					ST_AsGeoJSON(neigh_geom) neigh_geom,
					f_type,
					zn_zone,
					area_name,
					lo_nums, lfnames, centroid
					from (${propQuery}) as main
					inner join (${bufferQuery}) as buff
					on ${query.buffer_search_type == 'Within' ? 'st_dwithin' : 
					(query.buffer_search_type == 'Outside' ? 'not st_dwithin' : 'st_overlaps')}
					${query.buffer_search_type == 'Borders' ? '(main.geom, buff.buffer_geom)' : 
					'(main.geom, buff.buffer_geom, 0)'}
			`
        }
        else{
        	propQuery = `select 
					gid, objectid,
					ST_AsGeoJSON(geom) geom,
					ST_AsGeoJSON(zone_geom) zone_geom,
					ST_AsGeoJSON(neigh_geom) neigh_geom,
					f_type,
					zn_zone,
					area_name,
					lo_nums, lfnames, centroid
					from (${propQuery}) as main
					`
        }

        propQuery = `${propQuery} offset ${page > 1 ? (page - 1) * limit : 0} fetch next ${limit} rows only`
        
        console.log(propQuery)
        const results = await client.query(propQuery)
        return results.rows
    },
    queryNeighbourhoods: async (query) => {
		const page = parseInt(query.page)
		const limit = query.limit ? parseInt(query.limit) : 100
		const filter_string = query.filter ? `where ${query.filter}` : ""
        const propQuery = `select 
					gid,
					ST_AsGeoJSON(geom) geom,
					area_name
				   from neighbourhood
				   ${filter_string}
				   order by gid
				   offset ${page > 1 ? (page - 1) * limit : 0} fetch next ${limit} rows only;`
        console.log(propQuery)
        const results = await client.query(propQuery)
        return results.rows
    },
    queryFieldOptions: async (field) => {
        const propQuery = `select distinct ${field}) from property_merged`
        console.log(propQuery)
        const results = await client.query(propQuery)
        return results.rows
    }
}
