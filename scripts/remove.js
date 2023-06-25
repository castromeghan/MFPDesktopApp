const {ipcRenderer} = require('electron');
window.addEventListener('DOMContentLoaded', ()=>{
    const form = document.querySelector('form')

    ipcRenderer.on('reset_add_form', ()=>{
        form.reset()
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
            const obj = {id, density, material, customer, date, row}
            ipcRenderer.send('remove_data', obj)
        }else{
            msg.innerHTML = 'All fields are required'
            setTimeout(()=>msg.innerHTML = '', 3000)
        }
    })
})