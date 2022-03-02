const Router = require('koa-router')
const database = require('./database')
//const cache = require('./cache')
const joi = require('joi')
const validate = require('koa-joi-validate')

const router = new Router()

router.get('/properties', async ctx => {
	const results = await database.queryProperties(ctx.query)
	if (results.length === 0) { ctx.throw(404) }
	const props = results.map((row) => {
    	let geom = JSON.parse(row.geom)
		let zone_geom = JSON.parse(row.zone_geom)
		let neigh_geom = JSON.parse(row.neigh_geom)
		let buffer_geom = row.buffer_geom ? JSON.parse(row.buffer_geom) : {}
		return {
			gid: row.gid,
			objectid: parseInt(row.objectid),
			geom: geom,
			buffer_geom: buffer_geom,
			zone_geom: zone_geom,
			neigh_geom: neigh_geom,
			f_type: row.f_type,
			zn_zone: row.zn_zone,
			neighbourhood: row.area_name,
			address_numbers: row.lo_nums,
			streets: row.lfnames,
			centroid: row.centroid,
			//prop_centroid: row.prop_centroid
		}
  	})
  	ctx.body = props
})

router.get('/neighbourhoods', async ctx => {
	const results = await database.queryNeighbourhoods(ctx.query)
	if (results.length === 0) { ctx.throw(404) }
	const props = results.map((row) => {
		let geom = JSON.parse(row.geom)
		return {
					gid: row.gid,
					geom: geom,
					neighbourhood: row.area_name
		}
  	})
  	ctx.body = props
})

module.exports = router

