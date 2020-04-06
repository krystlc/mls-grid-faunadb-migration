import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const timestamp = new Date()
timestamp.setDate(timestamp.getDate() - 1)

console.log('starting app...', timestamp)

const instanceMlsGrid = axios.create({
  baseURL: 'https://api.mlsgrid.com',
  headers: {
    'Authorization': `Bearer ${process.env.MLS_GRID_ACCESS_TOKEN}`,
    'Accept-Enconding': 'gzip'
  }
})

const instanceFaunaDb = axios.create({
  baseURL: 'https://graphql.fauna.com/graphql',
  headers: {
    'Authorization': `Bearer ${process.env.FAUNA_DB_ACCESS_TOKEN}`
  }
})

const counties = ['Hillsborough', 'Pasco'] // , 'Pinellas'

const getProperties = async (url) => {
  console.log('\nattempting to fetch properties...\n')
  try {
    // const response = await instanceMlsGrid.get(url)
    const response = require(`../data/${url}`)
    return response
  } catch (error) {
    throw error
  }
}

const getAllProperties = async (url) => {
  const response = await getProperties(url)
  let data = [...new Set(response.data.value)]
  const nextLink = response.data['@odata.nextLink']
  if (nextLink) {
    const nextResponse = await getAllProperties(nextLink)
    data = [...data, ...nextResponse]
  }
  return data
}

const createProperty = async (property) => {
  console.log('creating property in fauna db...')
  const data = Object.keys(property).map(key => {
    return `\n${key}: ${JSON.stringify(property[key])}`
  }).join()
  const query = `mutation { 
      createProperty(data: {
        ${data}
      }
    ){
      _id
    }
  }`
  try {
    const response = await instanceFaunaDb({
      method: 'post',
      data: JSON.stringify({ query: `${query}` })
    })
    return response.data
  } catch (error) {
    throw error
  }
}

const createProperties = async() => {
  // const startLink = `${instanceMlsGrid.defaults.baseURL}/PropertyResi?$filter=${encodeURI('MlgCanView eq true and ModificationTimestamp gt ${timestamp}')}&$skip=10000`
  const startLink = 'test.json'
  const allProperties = await getAllProperties(startLink)
  return allProperties
    .filter(({ CountyOrParish }) => counties.includes(CountyOrParish))
    .map(property => {
      property.propertyId = property['@odata.id']
      delete property['@odata.id']
      return property
    })
}

createProperties().then(list => {
  // console.log('list', list.length)
  createProperty(list[0]).then(response => {
    console.log('created property', response)
  })
})