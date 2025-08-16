import * as cheerio from 'cheerio'
import * as request from 'request'
import puppeteer from 'puppeteer'
import { Either, Task, TaskType, Utils } from 'curry-types'

const loadDom = (domStr: string) => Task.of(cheerio.load(domStr))

const selectAll = (sel: string) => (dom: cheerio.CheerioAPI) =>
  Task.of(
    dom(sel)
      .toArray()
      .map(el => cheerio.load(el)),
  )

const selectFirst = (sel: string) => (dom: cheerio.CheerioAPI) =>
  selectAll(sel)(dom).chain(els =>
    Task.fromNullable(`No elements found for selector: ${sel}`)(els[0]),
  )

const html = (dom: cheerio.CheerioAPI) => Task.of(dom.html())

// Gets the string content the given element, INCLUDING its children elements
const text = (dom: cheerio.CheerioAPI) => Task.of(dom.text().trim())

// innerText :: Dom -> String
// Gets the string content the given element, EXCLUDING its children elements
const innerText = (dom: cheerio.CheerioAPI) =>
  Task.of(
    dom('*')
      .contents()
      .filter((i, el) => el.type == 'text')
      .text()
      .trim(),
  )

const attr = (attrName: string) => (dom: cheerio.CheerioAPI) => {
  const attr = dom('*').attr(attrName)
  return Task.fromNullable(`Attribute ${attrName} not found`)(attr)
}

// // Helper function for getting the text of required elements
// const required =
//   (err: string) => (selector: string) => (dom: cheerio.CheerioAPI) =>
//     Utils.head(selectAll(selector)(dom))
//       .map((el) => innerText(el))
//       .chain(Either.fromNullable(err));

// const optional =
//   (defaultValue: string) => (selector: string) => (dom: cheerio.CheerioAPI) =>
//     Utils.head(selectAll(selector)(dom))
//       .map((el) => innerText(el))
//       .chain(Either.fromNullable(defaultValue));

const getHtmlWithRequest = (url: string) =>
  Task.fromPromise(
    () =>
      new Promise<string>((res, rej) => {
        const opts = { method: 'GET', uri: url }
        request.get(opts, (error, response, body) => {
          if (error) {
            rej(error)
          } else {
            res(body)
          }
        })
      }),
  )

const getHtml = (url: string) =>
  Task.fromPromise(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })
    const html = await page.content()
    return html
  })

const scrapeUrl =
  <T>(strategy: (dom: cheerio.CheerioAPI) => TaskType<Error, T>) =>
  (url: string): TaskType<Error, T> => {
    return getHtml(url).chain(Cheerio.loadDom).chain(strategy)
  }

const Cheerio = {
  loadDom,
  selectAll,
  selectFirst,
  html,
  text,
  innerText,
  attr,
  // required,
  // optional,
  scrapeUrl,
}

export { Cheerio }
