const playwright = require('playwright')
const cheerio = require('cheerio')

//--------------------------------------

if (process.argv[2] && process.argv[2] == '--help') {
  
  console.log(`
  Developer assume no liability and are not responsible for any misuse or damage.

  -u        Enter the dork and url with this switch, example: -u site:*.mysite.com
  
  `)
  
  process.exit(1)
}

//--------------------------------------

const urlPath = process.argv.indexOf('-u')
let myUrl

if (urlPath > -1) {
    myUrl = process.argv[urlPath + 1]
}
const userUrl = myUrl

//--------------------------------------


const url = []

async function saveImages() {
  const browser = await playwright.chromium.launch({
      headless: true
  })
  const page = await browser.newPage()
  i = 0
  while(true){
    await page.goto(`https://www.google.com/search?q=${userUrl}&start=${i}`)
    const html = await page.content()
    const $ = await cheerio.load(html)
    $('cite.qLRx3b.tjvcx.GvPZzd.cHaqb').each((index, element)=>{url.push($(element).text().split(" ")[0])})
    const b = $('#pnnext').text()
    if(b != 'Next'){
      break
    }
    i += 10
  }
  browser.close()

  let newUrl = [...new Set(url)]
  newUrl.forEach(u => {
    console.log(u)
  })
}

saveImages()