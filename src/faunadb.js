const dotenv = require('dotenv')
dotenv.config()

import faunadb from 'faunadb'
const q = faunadb.query

const faunadbRequestResult = (res) => console.log('\nfaunadb request complete...\n')
const client = new faunadb.Client({
  secret: process.env.FAUNA_DB_ACCESS_TOKEN,
  observer: faunadbRequestResult
})

const refById = q.Match(
  q.Index('property_by_ListingId'),
  q.Select(['ListingId'], q.Var('property'))
)

const upsertQuery = q.If(
  q.Exists(refById),
  q.Replace(
    q.Select('ref', q.Get(refById)),
    { data: q.Var('property') }
  ),
  q.Create(
    q.Collection('properties'),
    { data: q.Var('property') }
  )
)

const deleteQuery = q.If(
  q.Exists(refById),
  q.Delete(
    q.Select('ref', q.Get(refById))
  ),
  null
)

const getQuery = verb => {
  switch (verb) {
    case 'UPSERT':
      return upsertQuery
    case 'DELETE':
      return deleteQuery
    default:
      return null
  }
}

/**
 * @param {array} data data to be used in mutation
 * @param {string} verb type of mutation e.g. upsert, delete, etc
 */
export const updatePropertiesCollection = async (data, verb) => {
  try {
    console.time('fauna_upsert_time')
    const query = getQuery(verb)
    const response = await client.query(
      q.Map(
        data,
        q.Lambda(
          'property',
          query
        )
      )
    )  
    console.log(`# ${verb} ${response.length} properties`)
  } catch (err) {
    console.error('${verb} batch failed :(\n', err)
  } finally {
    console.timeEnd('fauna_upsert_time')
  }
}

const searchByAddress = (address) => {
  console.log('computing...')
  return 'i dunno man' + address
} 

export default {
  searchByAddress,
  updatePropertiesCollection
}