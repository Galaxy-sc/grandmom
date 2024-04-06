import {readPdfText} from 'npm:pdf-text-reader'

async function main() {
    const path = await Deno.args[0]
    const pdfText = await readPdfText({url: path})
    let textChar = pdfText.replace(/[\n\d\W\_]/g, " ")
    let saveTextChar = textChar.split(" ")
    saveTextChar.forEach((x, i)=>{
        saveTextChar[i] = x.toLowerCase()
    })

    saveTextChar.sort()

    // Duplicate counter
    let counter = []
    var current
    var cnt = 0
    for (var i = 0; i < saveTextChar.length; i++) {
        if (saveTextChar[i] != current) {
            if (cnt > 0) {
                counter[i] = cnt + '\t:\t' + current
            }
            current = saveTextChar[i]
            cnt = 1
        } else {
            cnt++ // Word counter
        }
    }

    let sortCounter = counter.sort(function(a, b) {
        return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]) // Sort by number of duplicates
    })

    let co = 0
    sortCounter.reverse().forEach( (x) => {
        console.log(co + '\t-\t' + x)
        co++
    })
}

main()
