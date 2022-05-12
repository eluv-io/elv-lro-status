// builds (or rebuilds) the main.js file
const path = require('path')
const fs = require('fs')

const jsFileBasenamesList = pathStr =>
  fs.readdirSync(pathStr,{withFileTypes: true})
    .filter(dirEnt => dirEnt.isFile() && dirEnt.name.endsWith('.js'))
    .map(dirEnt => path.basename(dirEnt.name,'.js'))

const fileParts = ['const internal = {']
const srcInternalRequires = jsFileBasenamesList('src/internal')
  .map(basename => `  ${basename}: require('./internal/${basename}')`)
  .join(',\n')
fileParts.push(srcInternalRequires)
fileParts.push('}')

fileParts.push('')
fileParts.push('module.exports = {')
fileParts.push('  internal,')

const srcTopLevelRequires = jsFileBasenamesList('src')
  .filter(basename => basename !== 'main')
  .map(basename => `  ${basename}: require('./${basename}')`)
  .join(',\n')
fileParts.push(srcTopLevelRequires)
fileParts.push('}')

const fileContents = fileParts.join('\n') + '\n'

fs.writeFileSync('src/main.js', fileContents)
