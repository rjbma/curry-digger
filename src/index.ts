import * as cheerio from "cheerio";
import { Either, Task, TaskType, Utils } from "curry-types";
import { Cheerio } from "./cheerio";

type Movie = {
  title: string;
  year?: string;
  directors: string;
};

function readMovieUrlsFromActorPage(
  dom: cheerio.CheerioAPI
): TaskType<Error, string[]> {
  const urlSelector =
    "#actor-previous-projects ul a.ipc-metadata-list-summary-item__t";
  return Task.of(dom)
    .chain(Cheerio.selectAll(urlSelector))
    .map((urls) => urls.slice(0, 10))
    .map((urls) => urls.map(Cheerio.attr("href")))
    .chain(Task.sequenceArray)
    .mapError((msg) => new Error(msg))
    .map((urls) => urls.map((url) => `https://www.imdb.com${url}`));
}

function readMovieDetails(dom: cheerio.CheerioAPI): TaskType<Error, Movie> {
  const movie = {
    title: Cheerio.selectFirst(".hero__primary-text")(dom)
      .mapError((msg) => new Error(msg))
      .chain(Cheerio.innerText),
    directors: Cheerio.selectFirst(
      ".title-pc-list li .ipc-metadata-list-item__list-content-item"
    )(dom)
      .mapError((msg) => new Error(msg))
      .chain(Cheerio.innerText),
  };
  return Task.sequenceObject(movie);
}

Cheerio.scrapeUrl(readMovieUrlsFromActorPage)(
  "https://www.imdb.com/name/nm0000241/"
)
  .map(Utils.peek("url"))
  .map((urls) => urls.map((url) => Cheerio.scrapeUrl(readMovieDetails)(url)))
  .chain(Task.parallelArray(20))
  .fork(console.error, console.log);

export { Task, Either, cheerio };
