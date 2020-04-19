import fetch from 'node-fetch'
import { updatePropertiesCollection } from './faunadb'

const dotenv = require('dotenv')
dotenv.config()

const MLS_OPTIONS = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.MLS_GRID_ACCESS_TOKEN}`
  }
}
const COUNTIES = process.env.COUNTIES.split(',')

/**
 * 
 * @param {string} url url to GET from
 * @param {string} verb type of mutation
 */
const fetchMLSProperties = async (url, verb) => {
  console.log('\nattempting to fetch properties from:\n', url)
  try {

    console.time('mls_grid_fetch')
    const response =  await fetch(url, MLS_OPTIONS)
    console.timeEnd('mls_grid_fetch')
    const data = await response.json() // require(`../data/${url}`)

    if (data && data.value) {
      console.log(`# ${verb} fetched: ${data.value.length} properties`)
      const filtered = data.value.filter(({ CountyOrParish }) => COUNTIES.includes(CountyOrParish))
      console.log(`# ${verb} matched: ${filtered.length} properties`)

      if (verb && filtered.length > 0) {
        await updatePropertiesCollection(filtered, verb)
      }
    
      const nextLink = data['@odata.nextLink']
      if (nextLink) {
        console.log('next page...', nextLink)
        await fetchMLSProperties(nextLink, verb)
      }
    }
  } catch (error) {
    console.error('\nfetch error!\n', error)
  }
}

const TIMESTAMP = new Date(process.env.LAST_TIMESTAMP)
TIMESTAMP.setDate(TIMESTAMP.getDate() - 1)

/**
 * 
 * @param {boolean} del flag for delete action
 */
const buildFilterStr = (del = false) => {
  let filter = `MlgCanView eq ${del ? 'false' : 'true'}`
  if (del || !process.env.MLS_CLEAN === 'true') {
    filter += ` and ModificationTimestamp gt ${TIMESTAMP.toISOString()}`
  }
  return `${process.env.MLS_GRID_BASE_URL}/PropertyResi?$filter=${encodeURI(filter)}`
    // return 'test.json'
}

const upsertProperties = async () => {
  const url = buildFilterStr()
  await fetchMLSProperties(url, 'UPSERT')
}

const deleteProperties = async () => {
  const url = buildFilterStr(true)
  await fetchMLSProperties(url, 'DELETE')
}

export default {
  upsertProperties,
  deleteProperties
}