'use strict'
const fs      = require('fs')
const path    = require('path')
const {app}   = require('@electron/remote')
let model     = require(path.join(app.getAppPath(),'src', 'model.js'))



let htmlPath = path.join(app.getAppPath(), 'src', 'section')
let script   = path.join(app.getAppPath(),'assets', 'js', 'script.js')
let filtre   = path.join(app.getAppPath(), 'src', 'filtre.js')
let body     = fs.readFileSync(path.join(app.getAppPath(), 'index.html'), 'utf-8')
let list     = fs.readFileSync(path.join(htmlPath, 'list.html'), 'utf8')
let generate = fs.readFileSync(path.join(htmlPath, 'generate-certificate.html'), 'utf8')
let add      = fs.readFileSync(path.join(htmlPath, 'add.html'), 'utf8')
let edit     = fs.readFileSync(path.join(htmlPath, 'edit.html'), 'utf8')
let config   = fs.readFileSync(path.join(htmlPath, 'config.html'), 'utf8')

module.exports.changeView = (view) => {
    let view_old        = $('a.active')
    let view_old_id     = view_old.attr('id').split('-')
    let view_to_display = ''
    let view_id         = $(view).attr('id').split("-")
    let view_selected   = ''

    switch(view_id[0]) {  
        case 'add':
            view_to_display = add
            view_selected   = 'add'
            break
        case 'list':
            view_to_display = list
            view_selected   = 'list'
            break
        case 'generate':
            view_to_display = generate
            view_selected   = 'generate'
            break
        case 'config':
            view_to_display = config
            view_selected   = 'config'
            break
    }
    
    let content = $(view_to_display).html();
    view_old.removeClass('active')
    $(view).addClass('active')
    $("#content-holder").html(content)

    if (view_selected == 'list') {
        launchFilter()
        chooseTab()
        setTotalLigneToDisplay()
        assignTest()
    }
    
    if (view_selected == 'add') {
        displayAutoCompleteSous()
        setTotal()
        onInputChanged()
    }

    if (view_selected == 'config') {
        setConfigValue()
    }

}

module.exports.editView = (student_id, see_detail = false) => {
    let view_old        = $('a.active')
    let view_to_display = ''
    
    view_to_display = edit

    let content = $(view_to_display).html()
    $("#content-holder").html(content)
    model.getSpecificStudentInfo(student_id)

    if (see_detail) {
        editViewSeeDetail()
    }
    
    setTotal()
    onInputChanged()
    displayAutoCompleteSous()
}


