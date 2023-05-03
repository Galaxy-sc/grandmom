import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts"
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

const myurl = Deno.args.indexOf('--url')
let urlsIndex = myurl + 1
const userUrl = Deno.args[urlsIndex]

const url = []

async function saveImages() {
  const browser = await puppeteer.launch({
      headless: true
  })
  const page = await browser.newPage()
  let i = 0
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