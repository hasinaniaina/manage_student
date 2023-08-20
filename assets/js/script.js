'use strict'
const path = require('path')
const {app} = require('@electron/remote')
const fs = require('fs')
const model = require(path.join(app.getAppPath(), 'src/model.js'))
const export_xlsx = require(path.join(app.getAppPath(), 'src/exportXlsx.js'))

function add_recu(a){
    let recu_parent        = $(a).parent().parent()
    let pattern            = recu_parent.find('.recu-pattern').last().clone()
    let pattern_id         = $(pattern).attr('id')
    let pattern_id_section = pattern_id.split("-")[2]
    pattern_id             = pattern_id.split("-")[3]
    let pattern_new_id     = parseInt(pattern_id) + 1

    pattern.find('#n-recu-' + pattern_id_section + '-' + pattern_id).attr('name', 'recu-n-'+ pattern_id_section + '-'  + pattern_new_id)
    pattern.find('#n-recu-' + pattern_id_section + '-'  + pattern_id).attr('id', 'n-recu-'+ pattern_id_section + '-'  + pattern_new_id)
    pattern.find('#recu-amount-' + pattern_id_section + '-'  + pattern_id).attr('name', 'recu-amount-'+ pattern_id_section + '-'  + pattern_new_id)
    pattern.find('#recu-amount-'+ pattern_id_section + '-'  + pattern_id).attr('id', 'recu-amount-'+ pattern_id_section + '-'  + pattern_new_id)
    pattern.find('#delete_recu_line-'+ pattern_id_section + '-'  + pattern_id).attr('id', 'delete_recu_line-'+ pattern_id_section + '-'  + pattern_new_id)
    $(pattern).attr('id', 'recu-pattern-'+ pattern_id_section + '-'   + pattern_new_id)

    pattern.insertBefore($(a).parent())

    $('#recu-amount-'+ pattern_id_section + '-'  + pattern_new_id).val("")
    $('#n-recu-' + pattern_id_section + '-' + pattern_new_id).val("")  
    $('#recu-amount-'+ pattern_id_section + '-'  + pattern_new_id).prop('disabled', false)
    $('#n-recu-' + pattern_id_section + '-' + pattern_new_id).prop('disabled', false)
    $('#delete_recu_line-' + pattern_id_section + '-' + pattern_new_id).css('display', 'inline-block')

    let new_recu = $('#n-recu-'+ pattern_id_section + '-'  + pattern_new_id)

    // checkIfNumAlreadyExist(new_recu, 'recu-input')
    checkIfRecuAlreadyInUseForThisSous(new_recu)
    onInputChanged()
}

function add_sous(a) {
    let pattern    = $('.sous-recu-holder').last().clone()
    let pattern_id = $(pattern).attr('id')
        pattern_id = pattern_id.split("-")[2]

    let pattern_new_id = parseInt(pattern_id) + 1
        pattern.find('#n_sous-' + pattern_id).attr('name', 'sous-n-' + pattern_new_id)
        pattern.find('#n_sous-' + pattern_id).attr('id', 'n_sous-' + pattern_new_id)
        pattern.find('#delete_sous_line-'+ pattern_id).attr('id', 'delete_sous_line-' + pattern_new_id)
        $(pattern).attr('id', "sous-pattern-" + pattern_new_id)
        pattern.insertBefore($(a).parent())

        pattern.find('#n-recu-' + pattern_id + '-1').attr('name', 'recu-n-'+ pattern_new_id + '-1')
        pattern.find('#n-recu-' + pattern_id + '-1').attr('id', 'n-recu-'+ pattern_new_id + '-1')
        pattern.find('#recu-amount-' + pattern_id + '-1').attr('name', 'recu-amount-'+ pattern_new_id + '-1')
        pattern.find('#recu-amount-'+ pattern_id + '-1').attr('id', 'recu-amount-'+ pattern_new_id + '-1' )
        pattern.find('#delete_recu_line-'+ pattern_id + '-1').attr('id', 'delete_recu_line-'+ pattern_new_id + '-1')
        pattern.find('#add-recu-'+ pattern_id).attr('id', 'add-recu-'+ pattern_new_id)
        pattern.find('#recu-pattern-'+ pattern_id + '-1').attr('id', 'recu-pattern-'+ pattern_new_id + '-1')

        let all_recu_pattern = pattern.find("div[id^=recu-pattern-"+ pattern_id + "]")

        all_recu_pattern.each(() => {
            $(all_recu_pattern).remove()
        })
        
        $('#recu-amount-'+ pattern_new_id + '-1').val("")
        $('#n-recu-' + pattern_new_id + '-1').val("")
        $('#recu-amount-'+ pattern_new_id + '-1').prop('disabled', false)
        $('#n-recu-' + pattern_new_id + '-1').prop('disabled', false)
        $('#delete_recu_line-' + pattern_new_id + '-1').css('display', 'inline-block')
        $('#delete_sous_line-' + pattern_new_id).css('display','inline-block')

        let new_sous = $('#n_sous-' + pattern_new_id)
        
        new_sous.val("")
        new_sous.prop('disabled', false)

        checkIfNumAlreadyExist(new_sous, 'sous-input')
        displayAutoCompleteSous()
        onInputChanged()
}  

function checkIfNumAlreadyExist(element, input){
    element.on('change', function(){
        let exist   = false
        let changed = $(this)
        let inputs  = $('.' + input)
        for (let i = 0; i <  inputs.length; i++) {
            if ($(inputs[i]).attr('id') !== changed.attr('id') && changed.val() == $(inputs[i]).val()) {
                changed.val("")
                exist = true
                break
            }
        }
        if (exist) {
            let alert = '<p class="alert alert-danger alert-input">Ce numéro a été déjà tapé</p>'
            $(alert).insertAfter(changed)

            setTimeout(function(){
                let alert_input = $('.alert-input')
                $(alert_input).remove()
            }, 2000)
        }  
    })
}

function checkIfRecuAlreadyInUseForThisSous(recu) {
    recu.on('change', function(){
        let section          = recu.attr('id').split('-')[2]
        let sous             = $('#n_sous-' + section).val()
        let recu_typed       = ($(this).val() == '') ? 0 :  $(this).val()
        let sous_in_database = model.getSousList(sous)

        if (sous_in_database) {
            let sous_id              = sous_in_database[0][0]
            let recu_with_sous_exist = model.getRecuList(recu_typed, sous_id)

            if (recu_with_sous_exist > 0) {
                recu.val('')
                let alert = '<p class="alert alert-danger alert-input">Le numéro recu: '  +recu_typed+ ' a été déjà utilisé pour le numéro facture ' +sous+ ' a été déjà utilisé</p>'
                $(alert).insertAfter($(this))

                setTimeout(function(){
                    let alert_input = $('.alert-input')
                    $(alert_input).remove()
                }, 2000)
            }
        }
    })
}

function add_note(a){
    let pattern = $('.note-holder').last().clone()
    let pattern_id = $(pattern).attr('id').split("-")[2]
    let pattern_new_id = parseInt(pattern_id) + 1

    $(pattern).attr('id', 'note-holder-' + pattern_new_id)
    pattern.find('label').html('Note: ' + pattern_new_id)
    pattern.find('#note-' + pattern_id).attr('name', 'note-' + pattern_new_id).attr('id','note-' + pattern_new_id)

    pattern.insertBefore($(a).parent())
}


function delete_recu_line(a) {
    let id_section = $(a).attr('id').split("-")[1]
    let id         = $(a).attr('id').split("-")[2]
    $('#recu-pattern-' + id_section + '-' + id).remove()
}

function delete_sous_line(a) {
    let count = $('.delete-sous').length

    if (count > 1) {
        let id = $(a).attr('id').split('-')[1]
        $('#sous-pattern-' + id).remove()
    }
}

function save() {
    let datas        = formatAllDataToStore()
    let info_student = datas[0]
    let sous         = datas[1]
    let note         = datas[2]
    let empty_found  = checkAllInput()

    if (!empty_found) {
        model.saveFormData('student', info_student)
    
        model.getLastDataInTable('student').then((student_id) => {
            model.saveFormData('sous', sous, student_id)
            model.saveFormData('test', note, student_id)
        }, (error) => {
            console.log(error)
        })
    
        alert('Sauvegarde réussie')
    
        let menu_add = $("#add-navbar")
        menu_add.trigger('click')
    }
}

function save_and_quit() {
    let datas        = formatAllDataToStore()
    let info_student = datas[0]
    let sous         = datas[1]
    let note         = datas[2]
    let empty_found  = checkAllInput()

    if (!empty_found) {
        model.saveFormData('student', info_student)
    
        model.getLastDataInTable('student').then((student_id) => {
            model.saveFormData('sous', sous, student_id)
            model.saveFormData('test', note, student_id)
        }, (error) => {
            console.log(error)
        })
    
        alert('Sauvegarde réussie')
        setTimeout(function(){
            let menu_list = $("#list-navbar")
            menu_list.trigger('click')
        }, 1000)
    }
}

function checkAllInput() {
    let all_add_input = $('input')
    let empty_found   = false

    all_add_input.each(function() {
        if($(this).val() == '') {
            empty_found = true
            alert("Tous les champs devraient être tous rempli...")
            return false
        }
    })

    all_add_input.each(function() {
        if($(this).val() == '') {
            this.style.border = 'solid 1px red'
        } else {
            this.style.border = '1px solid #ced4da'
        }
    })

    return empty_found
}

function displayStudentInfo(datas){
    let name      = $('#name')
    let level     = $('#level')
    let prom     = $('#prom')
    let pr        = $('#pr')
    let gr        = $('#gr')
    let clar      = $('#clar')
    let lis       = $('#lis')
    let pattern_1 = $('#sous-pattern-1').remove()

    name.val(datas[0][0]['name'])
    level.val(datas[0][0]['level'])
    prom.val(datas[0][0]['prom'])

    pr.val(datas[3][0]['pr'])
    gr.val(datas[3][0]['gr'])
    clar.val(datas[3][0]['clar'])
    lis.val(datas[3][0]['lis'])

    let pattern    = ""
    let count_sous = 1

    for (let sous in datas[1]) {
        pattern += `<div class="sous-recu-holder" id="sous-pattern-` + count_sous + `">    
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label sous-label">N° souche:</label>
                            <div class="col-sm-8">
                                <input type="text" name="sous-n-` + count_sous + `" value="` + datas[1][sous]['sous'] + `" class="form-control form-control-sm sous-input" id="n_sous-` + count_sous + `" placeholder="Numéro sous" disabled>
                                <div class="auto-complete-sous">
                                    <ul class="list-sous">
                                    </ul>
                                </div>
                            </div>
                            <div class="col-sm-2 recu-input-holder">
                                <a href="#" onclick="delete_sous_line(this);" style="display:none" return false;" id="delete_sous_line-` + count_sous + `" class="delete-sous"><i class="fas fa-minus-circle"></i></a>
                            </div>
                        </div> `

        let count_recu = 1
        pattern +=    `<div class="form-group row recu-holder" >`
        for(let recu in datas[2]) {

            if (datas[1][sous]['id'] == datas[2][recu]['id_sous']) {
                pattern +=    `<div class="row col-sm-12 recu-pattern" id="recu-pattern-` + count_sous + `-` + count_recu + `">
                                    <label class="col-sm-2 col-form-label recu-label">Reçu:</label>
                                    <div class="col-sm-3 recu-input-holder">
                                        <input type="text" name="recu-n-` + count_sous + `-` + count_recu + `" value="` + datas[2][recu]['recu'] + `" class="form-control form-control-sm recu-input" id="n-recu-` + count_sous + `-` + count_recu + `" placeholder="Reçu N°" disabled>
                                    </div>
                                    <div class="col-sm-4 recu-input-holder">
                                        <input type="number" name="recu-amount-` + count_sous + `-` + count_recu + `" value="` + datas[2][recu]['montant'] + `" class="form-control form-control-sm recu-amount-input" id="recu-amount-` + count_sous + `-` + count_recu + `" placeholder="montant en Ariary" disabled>
                                    </div>
                                    <div class="col-sm-2 recu-input-holder">
                                        <a href="#" style="display:none" onclick="delete_recu_line(this);return false" id="delete_recu_line-` + count_sous + `-` + count_recu + `" class="delete-recu"><i class="fas fa-minus-circle"></i></a>
                                    </div>
                                </div>`
                count_recu ++
            }
        }
        pattern += ` <div class="form-group row add-recu-holder col-sm-12" >
                        <a href="#" class="add-recu-` + count_sous + `" onclick="add_recu(this);return false;"><i class="fas fa-plus"></i>&nbsp;Ajouter un numéro reçu </a>
                    </div>
                </div>
            </div> `
        count_sous ++         
    }
    

    
    $('.add-sous').each(function(){
        $(pattern).insertBefore($(this).parent())
    })

    updateStudentInfo(datas[0][0]['id'])
}

function updateStudentInfo(id_student) {
    $("#edit-student-info").on('click', function(){

        let empty_found  = checkAllInput()

        if (!empty_found) {
            let datas = formatAllDataToStore()
            let student_info = datas[0]
            let sous         = datas[1]
            let note         = datas[2]

            model.updateStudentInfo('student', student_info, id_student).then((success) => {
                if (success) {
                    model.updateStudentInfo('test', note, id_student).then((success) => {
                        if (success) {
                            model.saveFormData('sous', sous, id_student)
                            let menu_list = $("#list-navbar")
                            menu_list.trigger('click')
                        }
                    })
                }
            })
        }
    })
}

function formatAllDataToStore(){
    let all_input    = $("input")
    let all_select   = $("select")
    let info_student = []
    let note         = []
    let sous         = []
    let datas        = []
    all_input.each(function() {
        let attr_name_1         = $(this).attr("name")
        let attr_value_1        = $(this).val()
        let attr_name_splited_1 = attr_name_1.split("-")
       
        if (attr_name_splited_1[0] == "sous") {
            sous[attr_value_1] = []
            all_input.each(function() {
                let attr_name_2         = $(this).attr("name")
                let attr_value_2        = $(this).val()
                let attr_name_splited_2 = attr_name_2.split("-");
                
                if (attr_name_splited_2[0] == 'recu' && attr_name_splited_2[1] == "n" && attr_name_splited_2[2] == attr_name_splited_1[2]) {
                    all_input.each(function() {
                        let attr_name_3         = $(this).attr("name")
                        let attr_value_3        = $(this).val()
                        let attr_name_splited_3 = attr_name_3.split("-")

                        if (attr_name_splited_3[0] == 'recu' && attr_name_splited_3[1] == "amount" && attr_name_splited_3[2] == attr_name_splited_1[2] && attr_name_splited_3[3] == attr_name_splited_2[3]) {
                            sous[attr_value_1].push({
                                recu: attr_value_2, montant: attr_value_3
                            })
                        } 
                    })

                }
            })
        }
        
        if(attr_name_splited_1[0] == "name") {
            info_student['name'] = attr_value_1 
        } else if(attr_name_splited_1[0] == "prom") {
            info_student['prom'] = attr_value_1
        }


    })

    all_select.each(function() {
        let attr_name = $(this).attr("name")
        let attr_value = $(this).val()
        if (attr_name.includes("note")) {
            let attr_name_splited = attr_name.split("-")
            switch(attr_name_splited[1]){
                case 'pr':
                    note['pr'] = attr_value
                    break
                case 'gr':
                    note['gr'] = attr_value
                    break
                case 'clar':
                    note['clar'] = attr_value
                    break
                case 'lis':
                    note['lis'] = attr_value
                    break
            }
        }

        if (attr_name.includes("level")) {
            info_student['level'] = attr_value
        }
    })

    datas.push(info_student, sous, note)

    return datas

}


function getAllStudentInfo(offset, limit, query_filter){
    let tbody        = $('#list-student-holder')
    let exam_tbody   = $('#list-examen-holder')
    let student_info = model.getAllStudentsInfo(offset, limit, query_filter)
    let list      = ''

    tbody.html("")
    exam_tbody.html("")

    if (student_info) {
        student_info.forEach((info) => {
            list    = '<tr>'
                for (let inf in info) {
                    if (inf == 0) {
                        list += '<td scope="row">' + info[inf] + '</td>'
                    } else {
                        if (info[inf] == "NOK") {
                            list += '<td style="color:red">' + info[inf] + '</td>'
                        } else if (info[inf] == "OK") {
                            list += '<td style="color:green">' + info[inf] + '</td>'
                        } else {
                            list += '<td>' + info[inf] + '</td>'
                        }
                    }
                }
            list += `<td colspan="2">
                    <a href="#" class="" id="edit-navbar" onclick="window.controller.editView(` + info[0] + `)"> 
                        <i class="fas fa-edit" style="cursor: pointer;"></i>
                    </a> <a href="#" class="" id="edit-navbar" onclick="window.controller.editView(` + info[0] + `, true)"> 
                        <i class="fas fa-eye" aria-hidden="true" style="cursor: pointer;"></i>
                    </a>
                    </td>`
            list += '</tr>'
            
            tbody.append(list)
        })
    
        student_info.forEach((info) => {
            let test_info = model.getTestStudent(info[0])
            list    = '<tr>'
                for (let inf in info) {
                    switch (parseInt(inf)) {
                        case 0:   
                            list += '<td scope="row">' + info[inf] + '</td>'
                            break
                        case 1:  
                            list += '<td>' + info[inf] + '</td>'
                            break
                        case 2:   
                            list += `<td>
                                        <select class="form-control form-control-sm note-test" name="note-pr" id="pr-` +info[0]+ `">
                                            <option>0</option>
                                            <option>1</option>
                                        </select>   
                                    </td>`
                            break
                        case 3:
                            list += `<td>
                                        <select class="form-control form-control-sm note-test" name="note-gr" id="gr-` +info[0]+ `">
                                            <option>0</option>
                                            <option>1</option>
                                        </select>   
                                    </td>`
                            break
                        case 4:
                            list += `<td>
                                        <select class="form-control form-control-sm note-test" name="note-clar" id="clar-` +info[0]+ `">
                                            <option>0</option>
                                            <option>1</option>
                                        </select>   
                                    </td>`
                            break
                        case 5:
                            list += `<td>
                                        <select class="form-control form-control-sm note-test"  name="note-lis" id="lis-` +info[0]+ `">
                                            <option>0</option>
                                            <option>1</option>
                                        </select>   
                                    </td>`
                            break
                    }
            }
            list += `<td colspan="2">`
            list += '</tr>'
    
            exam_tbody.append(list)
            $("#pr-" + info[0]).val(test_info[0])
            $("#gr-" + info[0]).val(test_info[1])
            $("#clar-" + info[0]).val(test_info[2])
            $("#lis-" + info[0]).val(test_info[3])
        })
    }
}

function displayAutoCompleteSous(){
    let sous_input = $('.sous-input')
    let sous_auto  = $('.auto-complete-sous')

    sous_auto.each(function(){
        $(this).css('display','none')
    })

    sous_input.on('keyup', function(){
        let sous_input_typed = $(this)
        let sous_input_parent   = sous_input_typed .parent()
        let sous_auto_complete  = sous_input_parent.find('.auto-complete-sous')
        let ul                  = sous_auto_complete.find('ul')
        
        let results = model.getSousList(sous_input_typed.val())
        if (results) {
            let li         = ''
            for (let result in results) {
                li += '<li>' + results[result][1] + '</li>'
            }
            sous_auto_complete.css('display', 'block')
            ul.html(li)
        } else {
            sous_auto_complete.css('display', 'none')
        }



        let sous_li  = sous_auto_complete.find('li')
        sous_li.on('click', function() {
            sous_input_typed.val($(this).html())
            sous_auto_complete.css('display', 'none')
            checkIfNumAlreadyExist(sous_input_typed, 'sous-input')
        })

        $(document).on('click', function(){
            sous_auto_complete.css('display', 'none')
        })
    })

    let sous_inputs_parent = sous_input.parent().parent().parent()
    sous_inputs_parent.each(function(){
        let recu    = $(this).find('.recu-input')
        recu.each(function(){
            checkIfRecuAlreadyInUseForThisSous($(this))
        })
    })
}

function pagination(total_line_value = 10) {
    let totalEtudiant = model.getTotalCountOfStudent()
    let limit         = parseInt(total_line_value)
    let totalPages    = 1
    let guide         = parseInt(total_line_value)

    if (totalEtudiant > limit) {
        while(guide < totalEtudiant) {
            guide += limit  
            totalPages  = guide / limit
        }
    }
    
    $('#pagination-demo').twbsPagination('destroy')

    $('#pagination-demo').twbsPagination({
        totalPages: totalPages,
        visiblePages: 3,
        next: 'Next',
        prev: 'Prev',
        onPageClick: function (event, page) {
            let offset = limit * (page - 1)   
            getAllStudentInfo(offset, limit)           
        }
    });

    let page = $('.page-item.active').find('a').html()
    let offset    = limit * (parseInt(page) - 1)
    getAllStudentInfo(offset, limit)
}


function setTotalLigneToDisplay(){
    let total_line = $("#total-ligne")
    let i = 10
    while (i <= 100 ) {
        let o = new Option(i, i);
        total_line.append(o);
        i += 10
    }
    pagination(total_line.val())

    total_line.on('change',function() {
        let total_line_value = $(this).val()
        pagination(total_line_value)
    })
}

function setTotal() {
    let amount_input = $(".recu-amount-input")
    let total_payed  = $('#total-payed')
    let remains_payed = $('#remains-payed')

    let total        = 0
    amount_input.each(function(){
        let amount = ($(this).val()) ? parseInt($(this).val()) : 0
        total += amount
    })

    
    let fee = model.getAppConfig()[0]
    let remains = parseInt(fee[0]) - parseInt(total)

    remains_payed.html(remains.toLocaleString())
    total_payed.html(total.toLocaleString())

    let test_input = $(".note-test")
    let total_test = $('#total-test')
    let total_note = 0

    test_input.each(function(){
        let note = ($(this).val()) ? parseInt($(this).val()) : 0
        total_note += note
    })

    total_test.html(total_note)
}


function onInputChanged(){
    let amount_input = $(".recu-amount-input")
    let test_input   = $(".note-test")
    amount_input.on('change', function() {
        setTotal()
    })

    test_input.on('change', function() {
        setTotal()
    })
}


function setConfigValue(){
    let student_initial_id = $('#student-initial-number')
    let fee                = $('#fee')

    let config = model.getAppConfig()[0]
    student_initial_id.val(config[1])
    fee.val(config[0])
}


function saveFirstConfig() {
    let student_initial_id = $('#student-initial-number')
    let fee                = $('#fee')
    let input_empty        = false

    if (student_initial_id.val() == "") {
        alert("Le champ 'Numéro initial du premier étudiant' doit être renseigner")
        input_empty        = true
    } 
    
    if (fee.val() == "") {
        alert("Le champ 'Ecolage' doit être renseigner") 
        input_empty        = true
    } 


    if (!input_empty) {
        fee = fee.val()
        student_initial_id = student_initial_id.val()
        model.updateConfig(fee, student_initial_id)
        alert('Sauvegarde réussi')
    }
}

function editViewSeeDetail() {
    let all_input        = $('input')
    let all_select_input = $('select')
    let delete_sous      = $('.delete-sous')
    let delete_recu      = $('.delete-recu')
    let add_sous         = $('.add-sous-holder')
    let add_recu         = $('.add-recu-holder')

    all_input.prop('disabled', true)
    all_select_input.prop('disabled', true)
    delete_sous.remove()
    delete_recu.remove()
    add_sous.remove()
    add_recu.remove()
}

function chooseTab(){
    let tab = $('.tab')
    let examen_tab = $('.examen-tab')
    let list_tab = $('.list-tab')
    tab.on('click', function(){
        tab.each(function(){
            if ($(this).hasClass('active')) {
                $(this).removeClass('active')
            }        
        })

        $(this).addClass('active')
        if ($(this).attr('id') == 'tab-clicked-list-etudiant') {
            examen_tab.css('display','none')
            list_tab.css('display', 'block')
        } else {
            examen_tab.css('display','block')
            list_tab.css('display', 'none')
        }
    })
}

function assignTest(){
    let note_test = $('.note-test')
    note_test.on('change', function(){
        let note_input_id_splited =  $(this).attr('id').split('-')
        let field                 = note_input_id_splited[0]
        let student_id            = note_input_id_splited[1]
        let field_value           = $(this).val()
        model.updateTestStudent(field, field_value, student_id)
    })
}


function exportXlsx() {
    let choice_export       = $('input[name="export"]:checked')
    let choice_export_value = choice_export.val()
    let filter_input        = $('input')
    let filter_select       = $('.filtre-select')

    let all_filter = []
    filter_input.each(function(){
        let input_name = $(this).attr('name')
        let input_value = $(this).val()
        if (input_value !== '') {
            all_filter[input_name] = input_value
        }
    })

    filter_select.each(function() {
        let select_name = $(this).attr('name')
        let select_value = $(this).val()
        if (select_value) {
            all_filter[select_name] = select_value
        }            
    })

    let query_filter = model.getStudentIdByFilter(all_filter)
    let results      = model.getAllStudentsInfoForExport(query_filter)
    let datas        = []
    for (let res in results['values']) {
        datas.push([
            results['values'][res][0],
            results['values'][res][1]
        ])
    }

    let workSheetColumnsName = [
        'Numero', 'Nom'
    ]

    let workSheetName = choice_export_value
    let dir_path      = './xlsxLocation'

    if (!fs.existsSync(dir_path)){
        fs.mkdirSync(dir_path, { recursive: true });
        let filePath_not_yet_exist      = dir_path + "/fltc_export.xlsx"
        fs.writeFileSync(filePath_not_yet_exist, '');
    }

    let filePath      = dir_path + "/fltc_export.xlsx"
    

    setTimeout(function(){
        export_xlsx.exportExcel(datas, workSheetColumnsName, workSheetName, filePath)
        alert("Export réussi")
    }, 1000)
    
}

init()
function init() {
    let loading = $('.loading-container')
    $(function() {
        loading.css('display','none')
        setTotalLigneToDisplay()
        chooseTab()
        assignTest()   
    })
}

