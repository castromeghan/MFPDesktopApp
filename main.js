const {app, BrowserWindow, ipcMain, Notification, Menu} = require('electron');
const path = require('path');
const tables = require('./tables');
const firebaseConfig = require('./firebaseConfig');
const sortContent = require('./func')

const firebase = require('firebase/app');
const database = require('firebase/database');

const fb_app = firebase.initializeApp(firebaseConfig)
const db = database.getDatabase(fb_app)
const dbref = database.ref(db, `${tables.data}`)
const rowRef = database.ref(db, `${tables.row}`)
const custRef = database.ref(db, `${tables.cust_table}`)
const densRef = database.ref(db, `${tables.dens_table}`)
const matRef = database.ref(db, `${tables.mat_table}`)
const rowsRef = database.ref(db, `${tables.rows}`)

let mainBrowerWindow, addBlockBrowser, removeBlockBrowser, searchBlockBrowser, importDataBrowser, mapBrowser;

let content = [], rows = [], rowContent = [], notification;
let custArr = [], densArr = [], matArr = [];
let custId = null, densId = null, matId = null, rowId = null, sortedContent = null;

database.onValue(dbref, snapshot=>{
    if(snapshot.exists()){
        const data = snapshot.val()
        if(data){
            const keys = Object.keys(data)
            const arr = []
            keys.forEach(key=>arr.push({...data[key], ['cid']: key}))
            content = arr
            sortedContent = sortContent(arr)

            if(mapBrowser){
                mapBrowser.webContents.send('map_data', sortedContent)
            }
        }else{
            content = []
            sortedContent = []
        }
    }
})

database.onValue(rowRef, snapshot=>{
    if(snapshot.exists()){
        const data = snapshot.val()
        const keys = Object.keys(data)
        const arr = []  
        keys.forEach(key=>arr.push({...data[key], ['id']: key}))
        rows = arr
    }
})

database.onValue(custRef, snapshot=>{
    if(snapshot.exists()){
        const data = snapshot.val()
        const keys = Object.keys(data)
        if(keys.length > 0){
            custId = keys[0]
            custArr = data[custId] ?? []
        }
    }
})

database.onValue(densRef, snapshot=>{
    if(snapshot.exists()){
        const data = snapshot.val()
        const keys = Object.keys(data)
        if(keys.length > 0){
            densId = keys[0]
            densArr = data[densId] ?? []
        }
    }
})

database.onValue(matRef, snapshot=>{
    if(snapshot.exists()){
        const data = snapshot.val()
        const keys = Object.keys(data)
        if(keys.length > 0){
            matId = keys[0]
            matArr = data[matId] ?? []
        }
    }
})

database.onValue(rowsRef, snapshot=>{
    if(snapshot.exists()){
        const data = snapshot.val()
        const keys = Object.keys(data)
        if(keys.length > 0){
            rowId = keys[0]
            rowContent = data[rowId] ?? []
        }
    }
})

const closeApp = () => {
    if(addBlockBrowser){
        addBlockBrowser.close()
    }
    if(removeBlockBrowser){
        removeBlockBrowser.close()
    }
    if(searchBlockBrowser){
        searchBlockBrowser.close()
    }
    if(importDataBrowser){
        importDataBrowser.close()
    }
    if(mapBrowser){
        mapBrowser.close()
    }
    app.quit()
}

// Menu
const menu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Exit',
                click: () => closeApp()
            }
        ]
    }
]

app.whenReady().then(()=>{
    mainBrowerWindow = new BrowserWindow({
        width: 500, maxWidth: 1600, minWidth: 500,
        height: 600, maxHeight: 900, minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'scripts', 'preload.js')
        }
    })
    mainBrowerWindow.loadFile(path.join(__dirname, 'ui', 'index.htm'))

    mainBrowerWindow.on('closed', ()=>{
        app.quit()
    })

    // Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0){
            mainBrowerWindow = new BrowserWindow({
                width: 500, maxWidth: 1600, minWidth: 500,
                height: 600, maxHeight: 900, minHeight: 600,
                webPreferences: {
                    preload: path.join(__dirname, 'scripts', 'preload.js')
                }
            })
            mainBrowerWindow.loadFile(path.join(__dirname, 'ui', 'index.htm'))

            mainBrowerWindow.on('closed', ()=>{
                closeApp()
            })
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('add', ()=>{
    addBlockBrowser = new BrowserWindow({
        width: 500, maxWidth: 1600, minWidth: 500,
        height: 900, maxHeight: 900, minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'scripts', 'add.js')
        }
    })
    addBlockBrowser.loadFile(path.join(__dirname, 'ui', 'add.htm'))
    addBlockBrowser.webContents.send('rows', rows)
    addBlockBrowser.webContents.send('content', content)
})

ipcMain.on('add_data', (e, item)=>{
    const findR = rows.find(r=>r.density === item.density && r.row === item.row)
    const findRowC = rowContent.find(rc=>rc.code === item.row)
    const findCust = custArr.find(c_item=>c_item.code === item.customer)
    const findDens = densArr.find(d_item=>d_item.code === item.density)
    const findMat = matArr.find(m_item=>m_item.code === item.material)
    if(findRowC){
        if(findCust){
            if(findDens){
                if(findMat){
                    database.push(dbref, item)
                    .then(()=>{
                        if(findR){
                            const title = 'Add Block Success'
                            const body = 'Successfully added block to inventory'
                            notification = new Notification({title, body})
                            notification.show()
                            addBlockBrowser.webContents.send('reset_add_form');
                        }else{
                            database.push(rowRef, {density: item.density, row: item.row})
                            .then(()=>{
                                const title = 'Add Block Success'
                                const body = 'Successfully added block to inventory'
                                notification = new Notification({title, body})
                                notification.show()
                                addBlockBrowser.webContents.send('reset_add_form');
                            })
                        }
                    })
                    .catch(()=>{
                        const title = 'Add Block Error'
                        const body = 'Error occurred while adding block'
                        notification = new Notification({title, body})
                        notification.show()
                    })
                }else{
                    addBlockBrowser.webContents.send('row_error', 'Invalid Material')
                }
            }else{
                addBlockBrowser.webContents.send('row_error', 'Invalid Density')
            }
        }else{
            addBlockBrowser.webContents.send('row_error', 'Invalid Customer Code')
        }
    }else{
        addBlockBrowser.webContents.send('row_error', 'Invalid Row')
    }
})

ipcMain.on('remove', ()=>{
    removeBlockBrowser = new BrowserWindow({
        width: 500, maxWidth: 1600, minWidth: 500,
        height: 900, maxHeight: 900, minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'scripts', 'remove.js')
        }
    })
    removeBlockBrowser.loadFile(path.join(__dirname, 'ui', 'remove.htm'))
})

ipcMain.on('remove_data', (e, item)=>{
    const f_c = content.filter(c=>c.id === item.id && c.customer === item.customer && c.density === item.density && c.material === item.material && c.row === item.row && c.date === item.date)
    
    if(f_c.length === 1){
        const r_c = f_c[0]
        database.set(database.ref(db, `${tables.data}/${r_c.cid}`), null)
        .then(()=>{
            const title = 'Remove Block Status'
            const body = `Successfully removed ${item.customer} block from inventory`
            notification = new Notification({title, body})
            notification.show()
        })
        .catch(()=>{
            const title = 'Remove Block Error'
            const body = `Failed to remove ${item.customer} block from inventory`
            notification = new Notification({title, body})
            notification.show()
        })
        .finally(()=>{
            removeBlockBrowser.webContents.send('reset_add_form');
        })
    }
})

ipcMain.on('search', ()=>{
    searchBlockBrowser = new BrowserWindow({
        width: 500, maxWidth: 1600, minWidth: 500,
        height: 600, maxHeight: 900, minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'scripts', 'search.js')
        }
    })
    searchBlockBrowser.loadFile(path.join(__dirname, 'ui', 'search.htm'))
})

ipcMain.on('search_data', (e, item)=>{
    const {density, customer} = item
    const timeArr = []
    if(density && customer){
        const newArr = content.filter(el=>el.density === density && el.customer === customer)
        newArr.forEach(element=>{
            const dsplit = element.date.split('/')
            const yy = dsplit[2], mm = dsplit[0], dd = dsplit[1];
            timeArr.push(new Date(`${yy}-${mm}-${dd}`).getTime())
        })
        timeArr.sort()
        const findS = newArr.find(s=>{
            const ds = s.date.split('/')
            const yy = ds[2], mm = ds[0], dd = ds[1];
            const t = new Date(`${yy}-${mm}-${dd}`).getTime()
            if(t === timeArr[0]){
                return s
            }
        })
        searchBlockBrowser.webContents.send('search_results', findS)
    }else if(density && !customer){
        const newArr = content.filter(el=>el.density === density)
        newArr.forEach(element=>{
            const dsplit = element.date.split('/')
            const yy = dsplit[2], mm = dsplit[0], dd = dsplit[1];
            timeArr.push(new Date(`${yy}-${mm}-${dd}`).getTime())
        })
        timeArr.sort()
        const findS = newArr.find(s=>{
            const ds = s.date.split('/')
            const yy = ds[2], mm = ds[0], dd = ds[1];
            const t = new Date(`${yy}-${mm}-${dd}`).getTime()
            if(t === timeArr[0]){
                return s
            }
        })
        searchBlockBrowser.webContents.send('search_results', findS)
    }else if(!density && customer){
        const newArr = content.filter(el=>el.customer === customer)
        newArr.forEach(element=>{
            const dsplit = element.date.split('/')
            const yy = dsplit[2], mm = dsplit[0], dd = dsplit[1];
            timeArr.push(new Date(`${yy}-${mm}-${dd}`).getTime())
        })
        timeArr.sort()
        const findS = newArr.find(s=>{
            const ds = s.date.split('/')
            const yy = ds[2], mm = ds[0], dd = ds[1];
            const t = new Date(`${yy}-${mm}-${dd}`).getTime()
            if(t === timeArr[0]){
                return s
            }
        })
        searchBlockBrowser.webContents.send('search_results', findS)
    }
})

ipcMain.on('importdata', ()=>{
    importDataBrowser = new BrowserWindow({
        width: 500, maxWidth: 1600, minWidth: 500,
        height: 600, maxHeight: 900, minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'scripts', 'data.js')
        }
    })
    importDataBrowser.loadFile(path.join(__dirname, 'ui', 'data.htm'))
})

ipcMain.handle('send_import_data', (e, item)=>{
    const {table, importdata} = item

    if(table === 'Densities'){
        if(densId){
            database.set(database.ref(db, `${tables.dens_table}/${densId}`), importdata)
            .then(()=>{
                const title = 'Density Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Density Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }else{
            database.push(densRef, importdata)
            .then(()=>{
                const title = 'Density Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Density Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }
    }else if(table === 'Raw Materials'){
        if(matId){
            database.set(database.ref(db, `${tables.mat_table}/${matId}`), importdata)
            .then(()=>{
                const title = 'Density Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Raw Material Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }else{
            database.push(matRef, importdata)
            .then(()=>{
                const title = 'Raw Material Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Raw Material Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }
    }else if(table === 'Customer Codes'){
        if(custId){
            database.set(database.ref(db, `${tables.cust_table}/${custId}`), importdata)
            .then(()=>{
                const title = 'Customer Codes Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Customer Codes Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }else{
            database.push(custRef, importdata)
            .then(()=>{
                const title = 'Customer Codes Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Customer Codes Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }
    }else if(table === 'Rows'){
        if(rowId){
            database.set(database.ref(db, `${tables.rows}/${rowId}`), importdata)
            .then(()=>{
                const title = 'Rows Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Rows Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }else{
            database.push(rowsRef, importdata)
            .then(()=>{
                const title = 'Rows Import Success'
                const body = 'Successfully imported data'
                notification = new Notification({title, body})
                notification.show()
            })
            .catch(()=>{
                const title = 'Rows Import Error'
                const body = 'Failed to import data'
                notification = new Notification({title, body})
                notification.show()
            })
        }
    }
})

ipcMain.on('map', ()=>{
    mapBrowser = new BrowserWindow({
        width: 800, maxWidth: 1600, minWidth: 800,
        height: 800, maxHeight: 900, minHeight: 800,
        webPreferences: {
            preload: path.join(__dirname, 'scripts', 'map.js')
        }
    })
    mapBrowser.loadFile(path.join(__dirname, 'ui', 'map.htm'))
    mapBrowser.webContents.send('map_data', sortedContent)
    mapBrowser.on('close',()=> mapBrowser = null)
})
