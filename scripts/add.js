const {ipcRenderer} = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form')
    const msg = document.querySelector('#msg')
    const dens = document.querySelector('#density')

    let rows = null, content = null;
    ipcRenderer.on('row_error', (e, item)=>{
        msg.innerHTML = item
        setTimeout(()=>msg.innerHTML = '', 4000)
    })

    ipcRenderer.on('rows', (e, item)=>rows = item)
    ipcRenderer.on('content', (e, item)=>content = item)

    ipcRenderer.on('reset_add_form', ()=>{
        form.reset()
    })

    dens.addEventListener('blur', e=>{
        const v = e.target.value
        const findItem = rows.find(r=>r.density === v)
        if(findItem){
            document.querySelector('#row').value = findItem.row
        }
    })

    form.addEventListener('submit', e=>{
        e.preventDefault()
        const id = document.querySelector('#id').value
        const density = document.querySelector('#density').value
        const material = document.querySelector('#material').value
        const customer = document.querySelector('#customer').value
        const d = document.querySelector('#date').value
        const row = document.querySelector('#row').value
        const dateSplit = d.split('-')
        const date = `${dateSplit[1]}/${dateSplit[2]}/${dateSplit[0]}`

        if(id && density && material && customer && date && row){
            const findC = content.find(c=>c.id === id && c.date === date)
            if(findC){
                alert("A block already exists with this Block No.")
            }else{
                const obj = {id, density, material, customer, date, row}
                ipcRenderer.send('add_data', obj)
            }
        }else{
            msg.innerHTML = 'All fields are required'
            setTimeout(()=>msg.innerHTML = '', 3000)
        }
    })
})