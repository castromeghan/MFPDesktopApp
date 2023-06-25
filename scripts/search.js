const {ipcRenderer} = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form')
    const msg = document.querySelector('#msg')
    const researchResults = document.querySelector('#search-results')

    ipcRenderer.on('search_results', (e, item)=>{
        if(item){
            researchResults.querySelector('div').classList.remove('display-none')
            document.querySelector('#rowv').innerHTML = item.row
            document.querySelector('#datev').innerHTML = item.date
            document.querySelector('#custv').innerHTML = item.customer
            document.querySelector('#densv').innerHTML = item.density
            document.querySelector('#matv').innerHTML = item.material
        }else{
            researchResults.querySelector('div').classList.add('display-none')
        }
    })

    form.addEventListener('submit', e=>{
        e.preventDefault()
        const density = document.querySelector('#density').value
        const customer = document.querySelector('#customer').value
        if(density || customer){
            ipcRenderer.send('search_data', {density, customer})
        }else{
            researchResults.querySelector('div').classList.add('display-none')
            msg.innerHTML = 'One of the fields must have value'
            setTimeout(()=>msg.innerHTML = '', 3000)
        }
    })
})