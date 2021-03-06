const spawn           = require('child_process').spawn
const Promise         = require('promise')
const dirEqual        = require('assert-dir-equal')
const assert          = require('assert')
const nexpect         = require('nexpect')
const rimraf          = require('rimraf')
const fs              = require('fs')
const requireUncached = require('require-uncached')

const fixturePath = __dirname + '/../fixtures/'


const cliPath  = __dirname + '/../dist/cli.js'
const buildDir = fixturePath + 'build'
const settings = {templatesDir : fixturePath + 'templates/'}

describe('cli interface', () => {

  let util = requireUncached('../lib/util')
  beforeEach(()=> util.saveSettings(settings).then(
    ()=> util = requireUncached('../lib/util')))

  it('generates a project that matches expected directory', function(done) {

    this.timeout(7000)
    const expectedDir = fixturePath + 'expected'

    rimraf.sync(buildDir)
    fs.mkdirSync(buildDir)

    nexpect
      .spawn('node',[cliPath],{
        cwd: buildDir
      })
      .expect(/destination/)
      .sendline("")
      .expect(/project/)
      .sendline("typeA")
      .expect(/name/)
      .sendline('Foo')
      .expect(/license/)
      .sendline('ISC')
      .sendEof()
      .run(err => {
        dirEqual(buildDir,expectedDir)
        done(err)
      })
  })

  it('-t sets template dir',function(done){
    const templatesDirValue = __dirname
    this.timeout(4000)
    nexpect
      .spawn('node', [cliPath,'-t',templatesDirValue],{
        cwd: buildDir
      })
      .expect(/templatesDir: /)
      .sendEof()
      .run(err => util.getSettings()
           .then(({templatesDir}) => assert.equal(templatesDir,templatesDirValue))
           .done(()=>done(),done))
  })
})
