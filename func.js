const sortContent = (array) => {
    let letters = []
    let arr = array.map(item=>{
        let sp = item.row.split('')
        if (!letters.includes(sp[0]))
            letters.push(sp[0])
        return {...item, letter: sp[0], num: Number(sp[1])}
    })
    letters.sort()

    arr.sort((a, b)=>a.num - b.num)
    arr.sort()

    let c = []
    let result = []
    letters.forEach(l=>{
        result = [...result, {[l]: []}]
        arr.forEach(el=>{
            if(el.letter === l)
                c.push(el)
        })
    })

    c.forEach(item=>{
        result.forEach(res=>{
            let lc= res[item.letter]
            if(lc){
                let str = ''
                let splRow = item.row.trim().split('')
                splRow.forEach((n, index)=>{
                    if(index !== 0){
                        str += `${n}`
                    }
                })
                str = Number(str)
                if(lc.length === 0){
                    lc = [ {[item.row]: [item], num: str} ]
                }else{
                    let status = false
                    lc.forEach(mem=>{
                        if(mem.hasOwnProperty(item.row)){
                            status = true
                        }
                    })
                    if(status){
                        lc.map(el=>{
                            if(el[item.row]){
                                el[item.row] = [...el[item.row], item]
                            }
                            return el
                        })
                    }else{
                        lc = [ ...lc, {[item.row]: [item], num: str} ]
                    }
                    lc.sort((a, b)=>a.num - b.num)
                    lc.sort()
                }
                res[item.letter] = lc
            }
        })
    })

    return result
}

module.exports = sortContent