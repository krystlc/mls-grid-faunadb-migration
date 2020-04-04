import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()

console.log('starting fetch...')

axios.defaults.baseURL = 'https://api.mlsgrid.com'
axios.defaults.headers.common['Accept-Encoding'] = 'gzip'
axios.defaults.headers.common['Authorization'] = process.env.ACCESS_TOKEN

let pages = 0
const arr = []
async function getProperties(url) {
  try {
    pages++
    const response = await axios.get(url)
    const { value } = response.data
    if (value) {
      arr.push(...value)
      console.log(`PAGE no. ${pages}: `, value.length)
      const nextLink = response.data['@odata.nextLink']
      if (nextLink) {
        setTimeout(() => getProperties(nextLink), 2000)
      }
    }
  } catch (error) {
    console.log('ERR:', error.reponse.message)
  } finally {
    console.log('DONZO!')
    console.log(arr)
  }
}

const startLink = `${axios.defaults.baseURL}/PropertyResi?$filter=${encodeURI('MlgCanView eq true and ModificationTimestamp gt 2020-04-03T23:59:59.99Z')}&$skip=13000`
getProperties(startLink)