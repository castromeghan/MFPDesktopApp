const {ipcRenderer} = require('electron');
window.addEventListener('DOMContentLoaded', ()=>{
    const colorCode = document.querySelector('#color-code')
    let sorted;
    const colors = {
        '0.8#V': 'red', 
        '1.0#V': 'brown', 
        '1#AR': 'yellow', 
        '1.5#V': 'green', 
        '2.0#V': 'dodgerblue', 
        '3.0#V': 'purple'
    }
    const colorKeys = Object.keys(colors)
    let colorString = ''
    colorKeys.forEach(weight=>{
        colorString += `<div class="padding-all-10 col-2 center-text bold-text ${weight === '1#AR' ? 'black-text': 'white-text'}" style="background-color: ${colors[weight]}">${weight}</div>`
    })
    colorCode.innerHTML = colorString

    ipcRenderer.on('map_data', (e, data)=>{
        let string = ''
        sorted = data
        setTimeout(()=>{
            const letters = []
            data.forEach(item=>{
                const key = Object.keys(item)[0]
                const keyLayer = item[key]
                
                // string += `<div class="col-4 padding-all-10">
                //                 <div class="center-text white-bg">${key}</div><br /></br />
                //             `

                string += `<div class="col-4 padding-all-10 font-helvetica">`

                keyLayer.forEach(el=>{
                    const elKey = Object.keys(el)[0]
                    string += `<div class="white-bg center-text font-20 bold-text font-helvetica">${elKey}</div>
                        <div class="row" style="margin-top: 1px">
                        `

                    const elData = el[elKey]
                    elData.forEach(obj=>{
                        string += `<div class="padding-all-1d" title="Date: ${obj.date} | Material: ${obj.material} | Row: ${obj.row} | ID: ${obj.id} | Customer: ${obj.customer} | Density: ${obj.density}">
                            <div class="${colors[obj.density] === 'yellow' ? 'black-text': 'white-text'} padding-all-5" style="background-color: ${colors[obj.density]}; border-left: 1 solid #ccc">${obj.customer}</div>
                        </div>
                        `
                    })
                    string += `</div><br />`
                })

                // string += ``
                
                string += `</div>`
            })

            document.querySelector('#map').innerHTML = string
        }, 100)
    })
})