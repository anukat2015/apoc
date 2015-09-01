var fs = require('fs')
var path = require('path')
var parseInclusions = require(__dirname + '/inclusion-parser.js')
var template = require(__dirname + '/template.js')
var jscode = require(__dirname + '/jscode.js')
var debug = require('debug')('apoc:acf')

module.exports = function getContent(cypherFilePath, vars, context) {

  var statements = []

  if (fs.existsSync(cypherFilePath)) {

    var cypherFileDir = path.dirname(cypherFilePath)
    var content = fs.readFileSync(cypherFilePath).toString()
    content = content.trim().replace(/#.*/g, '') // remove comments
    content = parseInclusions(content, cypherFilePath)

    if (vars) content = template(content, vars) // template
    content = jscode(content, context) // js code

    content.split('\n\n').forEach(function (statement) {

      statement = statement.trim()

      // don't process empty lines
      if (statement.length > 0) {

        // include files
        var includes = statement.match(/include \w+.acf/g)

        if (includes) {
          includes.forEach(function (include) {
            var file = cypherFileDir + '/' + include.split(' ')[1]
            statement = statement.replace(include, fs.readFileSync(file))
          })
        }
        statements.push(statement)
      }

    })

    debug(statements)

    return statements

  } else {
    throw new Error('File not found: ' + cypherFilePath)
  }

}