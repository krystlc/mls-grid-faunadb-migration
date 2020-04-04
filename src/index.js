import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()

console.log('starting ES6 app...')

axios.defaults.baseURL = 'https://api.mlsgrid.com'
axios.defaults.headers.common['Authorization'] = process.env.ACCESS_TOKEN

async function getProperties() {
  try {
    const response = await axios.get('/PropertyResi', {
      params: {
        $filter: 'ModificationTimestamp gt 2020-04-03T23:59:59.99Z'
      }
    })
    console.log('yes!', response)
  } catch (error) {
    console.log('nooooo', error.message)
  } finally {
    console.log('donzo!')
  }
}

getProperties()