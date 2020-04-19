import mlsgrid from './mlsgrid'

console.time('app')
async function updateDb() {
  console.timeLog('app')
  await mlsgrid.upsertProperties()
}

updateDb().then(() => {
  console.log('done!')
}).finally(() => {
  console.timeEnd('app')
})
  