'use strict'

const path = require('path')
const fs = require('fs')
const SQL = require('sql.js')

const electron = require('electron')
const { windowsStore, off } = require('process')
const {app} = process.type === 'browser'
  ? electron
  : require('@electron/remote')

let   script = path.join(app.getAppPath(),'assets', 'js', 'script.js')

SQL.dbOpen = function (databaseFileName) {
    try {
      return new SQL.Database(fs.readFileSync(databaseFileName))
    } catch (error) {
      console.log("Can't open database file.", error.message)
      return null
    }
  }
  
SQL.dbClose = function (databaseHandle, databaseFileName) {
  try {
    let data = databaseHandle.export()
    let buffer = Buffer.alloc(data.length, data)
    fs.writeFileSync(databaseFileName, buffer)
    databaseHandle.close()
    return true
  } catch (error) {
    console.log("Can't close database file.", error)
    return null
  }
}

module.exports.initDb = function (appPath) {
    let dbPath = path.join(appPath, 'studentManagement.db')
    
    let createDb = function (dbPath) {
      // Create a database.
      let db = new SQL.Database()
      let query = fs.readFileSync(
      path.join(__dirname, 'db', 'schema.sql'), 'utf8')
      let result = db.exec(query)

      if (Object.keys(result).length === 0 &&
        typeof result.constructor === 'function' &&
        SQL.dbClose(db, dbPath)) {
        console.log('Created a new database.')
      } else {
        console.log('model.initDb.createDb failed.')
      }
    }
    let db = SQL.dbOpen(dbPath)
        
    if (db === null) {
      /* The file doesn't exist so create a new database. */
      createDb(dbPath)
    } else {
      /*
        The file is a valid sqlite3 database. This simple query will demonstrate
        whether it's in good health or not.
      */
      let query = 'SELECT count(*) as `count` FROM `sqlite_master`'
      let row = db.exec(query)
      let tableCount = parseInt(row[0].values)

      if (tableCount === 0) {
        console.log('The file is an empty SQLite3 database.')
        createDb(dbPath)
      } else {
        console.log('The database has', tableCount, 'tables.')
      }
    }
  }

module.exports.saveFormData = function (tableName, keyValue, foreign_value) {
    console.log(keyValue)
    if (Object.keys(keyValue).length > 0) {
      let query         = ''
      let db            = ''
      let sous_id_exist = null
      
      switch (tableName) {
        case 'student':
          insertIntoTable(tableName, keyValue, db)
          break
        case 'sous':
            for (let sous in keyValue) {
              let sous_id_exist = null
              let result        = null
              db = SQL.dbOpen(window.model.db)

              try {
                query = "SELECT id, sous FROM sous WHERE sous = '" + sous + "'"
                result = db.exec(query) 
              } catch (error) {
                console.log("recu error: " + error)
              } finally {
                SQL.dbClose(db, window.model.db)
              }
              
              if (result == "") {
                db = SQL.dbOpen(window.model.db)
                
                try {
                  query = 'INSERT INTO ' + tableName
                  query += " (sous, id_student) VALUES "
                  query += " ('" + sous + "', '" + foreign_value +"') "
                  let statement = db.run(query)
                } catch (error) {
                  console.log("recu error: " + error)
                } finally {
                  SQL.dbClose(db, window.model.db)
                }
              
              } else {
                sous_id_exist = result[0]['values'][0][0]
              }

              
              model.getLastDataInTable('sous', sous_id_exist).then((sous_id) => {
                if (sous_id) {
                  db = SQL.dbOpen(window.model.db)
                  tableName = 'invoice'

                  try {
                    keyValue[sous].forEach(element => {
                      let recu_linked_sous_no_exist = model.getRecuList(element['recu'], sous_id)

                      if (!recu_linked_sous_no_exist) {
                          query = 'INSERT INTO ' + tableName
                          query += ' ('
                          
                          for (let key in element) {
                              query += key + ','
                          }
                      
                          query += ' id_sous, id_student)'
                          query += ' VALUES ('
                          
                          for (let key in element) {
                              query += "'" + element[key] + "',"
                          }
      
                          query += "'" + sous_id + "', '" + foreign_value + "')"
                          let statement = db.run(query)
                      }
                    })
                  } catch (error) {
                    console.log("recu error: " + error)
                  } finally {
                    SQL.dbClose(db, window.model.db)
                  }
                }
              })
            }
          break
        case 'test':
          insertIntoTable(tableName, keyValue, db, 'id_student', foreign_value)
          break
      } 
  }
}

module.exports.updateStudentInfo = function (tablename, datas, id_student) {
    let query = ''
    let db    = ''
    db        = SQL.dbOpen(window.model.db)
    try {
      if (db !== null) {
        if (tablename == "sous") {

        } else {
          query = "UPDATE " + tablename + " SET "
          for (let key in datas) {
            query += key + " = '" + datas[key] + "' , "
          }

          query = removeLastComma(query)

          if (tablename == "student") {
            query += " WHERE id = " + id_student 
          } else if (tablename == "note") {
            query += " WHERE id_student = " + id_student 
          }

          let statement = db.run(query) 

          if (statement) {
            return Promise.resolve(true)
          }
        }        
      }
    } catch (error) {
      console.log("Update Student info error:" + error)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
}

module.exports.getLastDataInTable = function(tablename, id_table = null) {
  let result = null
  if (id_table == null) {
    let db     = SQL.dbOpen(window.model.db)
    if (db !== null) {
      let query     = "SELECT id FROM " + tablename + " ORDER BY id DESC LIMIT 1"
      let data      = db.exec(query)
      data          = data[0]['values'][0][0]
      SQL.dbClose(db, window.model.db)
      result = Promise.resolve(data)
    }
  } else {
    result = Promise.resolve(id_table)
  }

  return result
}

module.exports.getTotalCountOfStudent = function() {
  let db           = SQL.dbOpen(window.model.db)
  let student      = []
  if (db !== null) {
    try {
      let query       = "SELECT COUNT(id) FROM student"
      student = db.exec(query)[0]

      if (student) {
        return student['values'][0][0]
      }

    } catch (error) {
      console.log("Total count student error: " + error)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

module.exports.getAllStudentsInfo = function(offset, limit, query_filter = null) {
  let db           = SQL.dbOpen(window.model.db)
  let query        = ''
  let count        = 0
  let student_info = []
  if (db !== null) {
    query       = "SELECT id, name, level, prom FROM student ORDER BY id DESC LIMIT " + limit + " OFFSET " + offset + ""

    if (query_filter !== null) {
      query = query_filter
    }

    let student = db.exec(query)[0]
    SQL.dbClose(db, window.model.db)

    if (student) {
        student          = student['values']
        student.forEach((stud) => {
          db                  = SQL.dbOpen(window.model.db)
          student_info[count] = []

          query               = "SELECT SUM(montant) FROM invoice  WHERE id_student = '" + stud[0] + "'"
          let sum_invoice     = db.exec(query)[0]['values'][0][0]

          SQL.dbClose(db, window.model.db)
          
          let fee         = model.getAppConfig()[0]

          if (parseInt(sum_invoice) < parseInt(fee[0])) {
            sum_invoice = 'NOK'
          } else {
            sum_invoice = 'OK'
          }
          

          db           = SQL.dbOpen(window.model.db)
          query        = "SELECT SUM(pr + gr + clar + lis) FROM test WHERE id_student = '" + stud[0] + "'"
          let sum_test = db.exec(query)[0]['values'][0][0]
          SQL.dbClose(db, window.model.db)
          
          if (stud[2] == "Débutant") {
            if (parseInt(sum_test) < 4) {
              sum_test = 'NOK'
            } else {
              sum_test = 'OK'
            }
          } else {
            if (parseInt(sum_test) < 5) {
              sum_test = 'NOK'
            } else {
              sum_test = 'OK'
            }
          } 

          student_info[count].push(stud[0], stud[1], stud[2], stud[3], sum_invoice, sum_test)
          count++
        })    
    }


    return student_info
  }
}


module.exports.getAllStudentsInfoForExport = function(query_filter) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let result = db.exec(query_filter)[0]
    if (result) {
      return result
    }
  }
}

module.exports.getStudentIdByFilter = function(filter) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = "SELECT st.id id, st.name name, st.level level, st.prom prom  FROM student st "
        query += " LEFT JOIN invoice i ON st.id = i.id_student"
        query += " LEFT JOIN test t ON st.id = t.id_student"

        if (filter['name'] || filter['prom']) {
          query += " WHERE "
          if (filter['name']) {
            query += "st.name = '" + filter['name'] + "'"
            if (filter['prom']) {
              query += " AND "
            }
          }
  
          if (filter['prom']) {
            query += " st.prom = '" + filter['prom'] + "'"
          }
        }

        if (filter['fee'] || filter['test']) {
          query += " GROUP BY st.id HAVING "
          if (filter['fee']) {
            query += "  SUM(i.montant) < 275000 "
            if (filter['test']) {
              query += " AND "
            }
          }

          if (filter['test']) {
            query += " SUM(pr + gr + clar + lis)  < 4"
          }
        }

        return query
  }
}

module.exports.getSpecificStudentInfo = function(student_id) {
    let db           = SQL.dbOpen(window.model.db)
    let query        = ''
    let student_info = []
    let test_tab         = []
    let sous_tab         = []
    let recu_tab         = []
    let datas            = []
    if (db !== null) {
      try {
        query       = "SELECT id,name, level, prom FROM student where id= '" + student_id + "'"
        let student = db.exec(query)[0]['values'][0]
        student_info.push({
          id       : student[0],
          name     : student[1],
          level    : student[2],
          prom     : student[3]
        })

        query    = "SELECT pr, gr, clar, lis FROM test WHERE id_student = '" + student_id + "'"
        let test = db.exec(query)[0]['values'][0]

        test_tab.push({
          pr  : test[0],
          gr  : test[1],
          clar: test[2],
          lis : test[3],
        })

        query = "SELECT id, recu, montant, id_sous FROM invoice WHERE id_student = '" + student_id + "'"
        let recu        = db.exec(query)[0]['values']
        let sous_id_tmp = []
        for (let re in recu) {
          recu_tab.push({id: recu[re][0], recu: recu[re][1], montant: recu[re][2], id_sous: recu[re][3]})
          query = "SELECT id, sous FROM sous WHERE id = '" + recu[re][3] + "'"
          let sous = db.exec(query)[0]['values']

          if (!sous_id_tmp.includes(recu[re][3])) {
            sous_id_tmp.push(recu[re][3])
            for (let so in sous) {
              sous_tab.push({id: sous[so][0], sous: sous[so][1]})
            }
          }
        }


        datas.push(student_info, sous_tab, recu_tab, test_tab)
        displayStudentInfo(datas)

      } catch(error) {
        console.log("get specific student info error:" + error)
      } finally {
        SQL.dbClose(db, window.model.db)
      }
    }
}

module.exports.getSousList = function(sous) {
  let query = ''
  let db    = SQL.dbOpen(window.model.db)
  if (db !== null) {
    try {
      query = "SELECT id, sous FROM sous WHERE sous LIKE '%" + sous + "%'"
      let result = db.exec(query)

      if (result[0]) {
        return result[0]['values']
      }
    } catch (error) {
      console.log("sous list error :" + error) 
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}


module.exports.getRecuList = function(recu, id_sous) {
  let query = ''
  let db    = SQL.dbOpen(window.model.db)
  if (db !== null) {
    try {
      query = "SELECT id FROM invoice WHERE recu = '" + recu + "' AND id_sous = '" +  id_sous + "'"
      let result = db.exec(query)

      if (result[0]) {
        return result[0]['values']
      }

    } catch (error) {
      console.log("sous list error :" + error) 
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

function removeLastComma(string){        
  return string.replace(/,\s*$/, "")  
}


module.exports.getAllNameOrProm = function(value, input_name){
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = "SELECT " + input_name + " FROM student WHERE " + input_name + " LIKE '%" +value+ "%'"
    let result = db.exec(query)[0]
    if (result) {
        return result['values'];
    }
    SQL.dbClose(db, window.model.db)
  }
}


module.exports.getAppConfig = function(){
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = " SELECT fee, initial_student_number FROM config "
    let result = db.exec(query)[0]

    SQL.dbClose(db, window.model.db) 
    if (result) {
        return result['values'];
    }
    
  }
}

module.exports.updateConfig = function(fee, student_initial_id) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = " UPDATE config Set fee = '" + fee + "', initial_student_number = '" + student_initial_id + "' WHERE id = 1 "
    let statement = db.run(query)
    SQL.dbClose(db, window.model.db) 
  }
}

module.exports.getTestStudent = function(student_id) {
  let db  = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = "SELECT pr, gr, clar, lis FROM test WHERE id_student = '" + student_id + "'"
    let result = db.exec(query)[0]

    if (result) {
      return result['values'][0]
    }

    SQL.dbClose(db, window.model.db) 
  }
}

module.exports.updateTestStudent = function(field, field_value,student_id) {
  let db  = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = "UPDATE test SET " + field + " = '" + field_value + "' WHERE id_student = '" + student_id + "'"
    let statement = db.run(query)
    SQL.dbClose(db, window.model.db) 
  }
}




function insertIntoTable(tableName, keyValue, db, foreign_key = null, foreign_value = null) {
  db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    try {
      let count_student = model.getTotalCountOfStudent()
      let initial_student_number = model.getAppConfig()[0][1]
      let query = 'INSERT INTO ' + tableName
      query += '('

      if (count_student == 0 && tableName == 'student') {
        query += 'id, '
      }

      for (let key in keyValue) {
        if (key) {
          query += key + ','
        }
      }

      if (foreign_key !== null) {
        query += " " + foreign_key + ")"
      } else {
        query = removeLastComma(query)
        query += ')'
      }
      query += ' VALUES ('
      
      if (count_student == 0 && tableName == 'student') {
        query += '"' + initial_student_number + '", ' 
      }

      for (let key in keyValue) {
        query += "'" + keyValue[key] + "',"
      }

      if (foreign_value !== null) {
        query += " '" + foreign_value + "')"
      } else {
        query = removeLastComma(query)
        query += ')'
      }

      let statement = db.run(query)
    } catch (error) {
      console.log("this is the error: " + error)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}


  