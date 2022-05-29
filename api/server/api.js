const Router = require('koa-router')
const database = require('./database')
//const cache = require('./cache')
const joi = require('joi')
const validate = require('koa-joi-validate')

const router = new Router()

router.get('/fields', async ctx => {
	const results = await database.queryFields(ctx.query.table)
	if (results.length === 0) { ctx.throw(404) }
	ctx.body = results
})

router.get('/tables', async ctx => {
	const results = await database.getBaseTables()
	ctx.body = results
})

router.get('/fields/buffer', async ctx => {
	const results = await database.queryBufferFields()
	if (results.length === 0) { ctx.throw(404) }
	let props = {}
	results.forEach((row) => {
		if (row.name in props){
			props[row.name].push(row)
		}
		else{
			props[row.name] = [row]
		}
  	})
	ctx.body = props
})


router.get('/properties', async ctx => {
	try{
		const results = await database.queryProperties(ctx.query.base, ctx.query.filter, JSON.parse(decodeURIComponent(ctx.query.buffers)))
		const props = results.map((row) => {
			let geom = JSON.parse(row.prop_geom)
			let other_geoms = Object.keys(row).filter(f => f.includes("_geom") && f != "prop_geom").map(f => JSON.parse(row[f]))
			return {
				fields: row,
				geom: geom,
				buffer_geoms: other_geoms
			}
		  })
		  ctx.body = props
	}
	catch(e){
		console.log(e)
		console.log(ctx.query)
		ctx.body = []
	}	
})

router.get('/query', async ctx => {
	try{
		const results = await database.loadQuery(ctx.query.id)
		const props = results.data.map((row) => {
			let geom = JSON.parse(row.prop_geom)
			let other_geoms = Object.keys(row).filter(f => f.includes("_geom") && f != "prop_geom").map(f => JSON.parse(row[f]))
			return {
				fields: row,
				geom: geom,
				buffer_geoms: other_geoms
			}
		  })
		  ctx.body = {query: results.query, data: props}
	}
	catch(e){
		console.log(e)
		console.log(ctx.query)
		ctx.body = []
	}
})

router.get('/layers', async ctx => {
	try{
		const results = await database.getLayers()
		const props = results.map(layer => {
			let data = layer.data.map(row => {
				let geom = JSON.parse(row.geom)
				console.log(geom)
				return {
					geom: geom,
					fields: row
				}
			})	
			return {
				colour: layer.colour,
				data: data,
				name: layer.name
			}
		})
		console.log(props)
		ctx.body = props
	}
	catch(e){
		console.log(e)
		console.log(ctx.query)
		ctx.body = []
	}
})

router.get('/find', async ctx => {
	try{
		const results = await database.findAddress(ctx.query.address, ctx.query.base)
		const props = results.map((row) => {
			let geom = JSON.parse(row.prop_geom)
			return {
				fields: row,
				geom: geom
			}
		  })
		  ctx.body = props
	}
	catch(e){
		console.log(e)
		console.log(ctx.query)
		ctx.body = []
	}
})

router.get('/share', async ctx => {
	try{
		const results = await database.saveAndShare(ctx.query.base, ctx.query.filter, JSON.parse(decodeURIComponent(ctx.query.buffers)))
		if (results.length === 0) { ctx.throw(404) }
		ctx.body = results
	}
	catch(e){
		console.log(e)
		console.log(ctx.query)
		ctx.throw(404)
	}
})

router.get('/create', async ctx => {
	try{
		const results = await database.createTable(ctx.query.base, `custom_${ctx.query.name}`, ctx.query.filter, JSON.parse(decodeURIComponent(ctx.query.buffers)))
		ctx.body = results
	}
	catch(e){
		console.log(e)
		console.log(ctx.query)
		ctx.throw(404)
	}
})

router.get('/distinct', async ctx => {
	const results = await database.queryDistinct(ctx.query.field, ctx.query.table)
	if (results.length === 0) { ctx.throw(404) }
  	ctx.body = results
})

router.get('/options', async ctx => {
	const results = await database.queryOptions()
	/*if (Object.keys(results).length === 0) { ctx.throw(404) }*/
  	ctx.body = results
})


router.get('/buffer', async ctx => {
	const results = await database.createBuffer(ctx.query.table, ctx.query.distance)
	if (results.length === 0) { ctx.throw(404) }
	const props = results.map((row) => {
		let geom = JSON.parse(row.buffer_geom)
		return {
			fields: row,
			geom: geom
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
