

launchFilter()
function launchFilter(){
    let filter_input       = $('input')
    let filter_select      = $('.filtre-select')
    let button_search      = $('#btn-filtre-search')
    let button_clear       = $('#btn-filtre-clear')
    filter_input.on('change', function() {
        checkIfThereIsFilter(filter_input, filter_select, button_search)
    })


    filter_select.on('change', function() {
        checkIfThereIsFilter(filter_input, filter_select, button_search)
    })

    filter_input.on('keyup', function(){
        let input_name = $(this).attr('name')
        displayListNameOrProm($(this), input_name)
    })

    button_search.on('click', function(){
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
        getAllStudentInfo(0, 10, query_filter)
    })

    button_clear.on('click', function(){
        filter_input.each(function() {
            $(this).val('')
        })

        filter_select.each(function() {
            $(this).val('')           
        })
    })


}

function displayListNameOrProm(input_typed, input_name){
    let input_parent         = input_typed .parent()
    let filter_auto_complete = input_parent.find('.auto-complete-filter')
    let ul                   = filter_auto_complete.find('ul')

    let results = model.getAllNameOrProm(input_typed.val(), input_name)
    if (results) {
        let li         = ''
        for (let result in results) {
            li += '<li>' + results[result] + '</li>'
        }
        filter_auto_complete.css('display', 'block')
        ul.html(li)
    } else {
        filter_auto_complete.css('display', 'none')
    }

    let filter_li  = filter_auto_complete.find('li')
        filter_li.on('click', function() {
            input_typed.val($(this).html())
            filter_auto_complete.css('display', 'none')
        })


    $(document).on('click', function(){
        filter_auto_complete.css('display', 'none')
    })
}


function checkIfThereIsFilter(filter_input, filter_select, button_search) {
    let filter_input_empty = true
    let filter_select_empty = true

    filter_input.each(function(){
        if ($(this).val() != "") {
            filter_input_empty = false
            return false
        } 
    })

    filter_select.each(function() {
        if ($(this).val()) {
            filter_select_empty = false
            return false
        }
    })

    if (filter_input_empty && filter_select_empty) {
        button_search.prop('disabled', true)
    } else {
        button_search.prop('disabled', false)
    }
}