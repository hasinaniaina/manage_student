const xlsx  = require('xlsx')
const path  = require('path')

module.exports.exportExcel = function(data, workSheetColumnsName, workSheetName, filePath) {
    let workBook = xlsx.readFile(filePath)

    // if (!workBook) {
    //      workBook = xlsx.utils.book_new()
    // }
    
    const workSheetData = [
        workSheetColumnsName,
        ...data
    ]

    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData)
    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName)
    xlsx.writeFile(workBook, path.resolve(filePath))
}