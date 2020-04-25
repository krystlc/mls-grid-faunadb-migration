import mlsgrid from './mlsgrid'
import db from './faunadb'

module.exports.updateDb = async () => {
  console.time('app')
  await mlsgrid.upsertProperties()
  console.timeLog('app')
  await mlsgrid.deleteProperties()
  console.timeEnd('app')
}
