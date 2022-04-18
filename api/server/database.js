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

client.on('error', e => {
	console.error('Database error', e);
	client = null;
  });

  const limit = 500;

function generateBufferString(table, distance, encode){
	return `select *, ${encode ? "ST_AsGeoJSON(" : ""}st_buffer(geom::geography, ${distance})::geometry${encode ? ")" : ""} buffer_geom from ${table}`
}

function generatePropertyQuery(base, filter, buffers){
	let buffersWith = Object.keys(buffers).map(b => `${buffers[b].alias} as (${generateBufferString(buffers[b].table, buffers[b].distance, false)})`)
	let buffersWithString = buffersWith.length > 0 ? `with ${buffersWith.join(', ')} ` : "";
	let buffersJoin = Object.keys(buffers).map(b => buffers[b].alias)
	let buffersJoinString = buffersJoin.length > 0 ? `,${buffersJoin.join(', ')}` : "";
	let bufferGeoms = Object.keys(buffers).map(b => `ST_AsGeoJSON(${buffers[b].alias}.buffer_geom) ${buffers[b].alias}_geom`)
	let bufferGeomsString = bufferGeoms.length > 0 ? `,${bufferGeoms.join(', ')}` : "";
	let query = `${buffersWithString}select ${base}.*, ST_AsGeoJSON(${base}.geom) prop_geom${bufferGeomsString} from ${base} as ${base}${buffersJoinString} ${(typeof filter != 'undefined') && filter != "" ? `where ${filter}` : ""}`
	return query
}

function generateNewTablePropertyQuery(base, filter, buffers){
	let buffersWith = Object.keys(buffers).map(b => `${buffers[b].alias} as (${generateBufferString(buffers[b].table, buffers[b].distance, false)})`)
	let buffersWithString = buffersWith.length > 0 ? `with ${buffersWith.join(', ')} ` : "";
	let buffersJoin = Object.keys(buffers).map(b => buffers[b].alias)
	let buffersJoinString = buffersJoin.length > 0 ? `,${buffersJoin.join(', ')}` : "";
	let bufferGeoms = Object.keys(buffers).map(b => `ST_AsGeoJSON(${buffers[b].alias}.buffer_geom) ${buffers[b].alias}_geom`)
	let bufferGeomsString = bufferGeoms.length > 0 ? `,${bufferGeoms.join(', ')}` : "";
	let query = `${buffersWithString}select ${base}.* from ${base} as ${base}${buffersJoinString} ${(typeof filter != 'undefined') && filter != "" ? `where ${filter}` : ""}`
	return query
}

// Connect to the DB
client.connect().then(() => {
	console.log(`Connected To ${client.database} at ${client.host}:${client.port}`)
}).catch((e) => {console.log(e)})

module.exports = {
	queryFields: async (table) => {
		let query = `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' 
					and data_type in ('integer', 'numeric', 'ARRAY', 'double precision', 'character varying')`
		const results = await client.query(query)
		return results.rows
	},
	getBaseTables: async () => {
		let query = `SELECT table_name FROM information_schema.tables WHERE table_name like 'custom%'`
		const results = await client.query(query)
		return results.rows

	},
	queryBufferFields: async (table) => {
		let query = `SELECT * from buffer_fields`
		const results = await client.query(query)
		return results.rows
	},
	queryDistinct: async (field, table) => {
		let query = `select distinct ${field} from ${table}`
		const results = await client.query(query)
		return results.rows
	},
	queryOptions: async () => {
		const fields = {
			"neighbourhood": ["area_name"],
			"address": ["lfname"],
			"property_merged": ["f_type"],
			"tdsb": ["schname", "city"]
		}

		let results = {}

		for (const [table, field] of Object.entries(fields)) {
			for (const x in field){
				let f = field[x]
				let query = `select distinct ${f} from ${table}`
				const result = await client.query(query)
				results[f] = result.rows
			}
		}

		return results
	},
	queryProperties: async (base, filter, buffers) => {
		const query = `${generatePropertyQuery(base, filter, buffers)} limit ${limit}`
		console.log(query)
		const results = await client.query(query)
		return results.rows
	},
	loadQuery: async (id) => {
		try{
			const res = await client.query(`select query from past_queries where id='${id}'`)
			let query = res.rows[0].query
			const results = await client.query(query)
			return {query: query, data: results.rows}
		}
		catch(e){
			console.log(e)
			return {query: "", data: []}
		}
	},
	saveAndShare: async (base, filter, buffers) => {
		const query = `${generatePropertyQuery(base, filter, buffers)} limit ${limit}`
		console.log(query)
		const outer_query = `insert into past_queries (query) values ('${query.replace(/'/g,"''")}') returning id`
		console.log(outer_query)
		const results = await client.query(outer_query)
		return results.rows
	},
	createTable: async (base, name, filter, buffers) => {
		try{
			let query = generateNewTablePropertyQuery(base, filter, buffers)
			const outer_query = `create table ${name} as (${query})`
			console.log(outer_query)
			client.query(outer_query)
				.then(results => {
					query = `CREATE INDEX ${name}_geom_idx ON ${name} USING GIST (geom)`;
					console.log(query)
					client.query(query).then(ind => {
						console.log("skipping alter table")
						/*query = `alter table ${name} alter column geom set storage external`;
						console.log(query)
						client.query(query).then(storage => {
							query = `UPDATE ${name} SET geom = ST_SetSRID(geom, 4326)`;
							console.log(query)
							client.query(query).then(srid => {
								return true
							})
						})*/
					})
				})
				.catch(err => {
					console.log(err)
					return false
				})
		}
		catch(e){
			console.log(e)
			return false
		}
		
	},
	findAddress: async (address, base) => {
		const query = `select *, ST_AsGeoJSON(geom) as prop_geom from ${base} where addresses::varchar ilike '%${address}%'`
		const results = await client.query(query)
		return results.rows
	},
	createBuffer: async (table, distance) => {
		let query = generateBufferString(table, distance, true)
		const results = await client.query(query)
		return results.rows
	}
}
