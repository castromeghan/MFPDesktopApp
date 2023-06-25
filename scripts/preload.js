const {ipcRenderer} = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('#add')
    const removeBtn = document.querySelector('#remove')
    const searchBtn = document.querySelector('#search')
    const dataBtn = document.querySelector('#data')
    const mapBtn = document.querySelector('#map')

    addBtn.addEventListener('click', ()=> ipcRenderer.send('add'))
    removeBtn.addEventListener('click', ()=> ipcRenderer.send('remove'))
    searchBtn.addEventListener('click', ()=> ipcRenderer.send('search'))
    dataBtn.addEventListener('click', ()=> ipcRenderer.send('importdata'))
    mapBtn.addEventListener('click', ()=> ipcRenderer.send('map'))
})