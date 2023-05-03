# grandmom
#
Deno js google Scraper to find subdomains.
#### Install
```sh
deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
```
Linux dependencies:
https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

#### Run
```sh
deno run -A grandmom.js --url site:*.your_site
```
or
```sh
deno run -A grandmom.js --url site:*.*.your_site
```

### compile
```sh
deno compile -A grandmom.js
grandmom --url site:*.your_site
```