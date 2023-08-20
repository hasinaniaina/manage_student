
// electron.remote for Renderer Process and electron for Main Process
const fs      = require('fs')
const path    = require('path')
const {app}   = require('@electron/remote')
const cheerio = require('cheerio')

let htmlPath    = path.join(app.getAppPath(), 'src', 'section')
let body        = fs.readFileSync(path.join(app.getAppPath(), 'index.html'), 'utf-8')
let list        = fs.readFileSync(path.join(htmlPath, 'list.html'), 'utf8')
let generate    = fs.readFileSync(path.join(htmlPath, 'generate-certificate.html'), 'utf8')
let add         = fs.readFileSync(path.join(htmlPath, 'add.html'), 'utf8')
let nav         = fs.readFileSync(path.join(htmlPath, 'nav-bar.html'), 'utf8')

window.controller = require(path.join(app.getAppPath(), 'src/controller.js'))
window.model      = require(path.join(app.getAppPath(), 'src/model.js'))
window.model.db   = path.join(app.getAppPath(), 'studentManagement.db')

let cheerio_content = cheerio.load(body)
cheerio_content('#nav-bar').append(nav)
cheerio_content('#content-holder').append(list)
// cheerio_content('#content-holder').append(importation)
// cheerio_content('#content-holder').append(generate)
// cheerio_content('#content-holder').append(add)

let content = cheerio_content.html()
$("body").html(content)