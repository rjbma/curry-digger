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
  const links = Task.sequenceArray(
    Cheerio.selectAll(
      "#actor-previous-projects ul a.ipc-metadata-list-summary-item__t"
    )(dom)
      .map(Cheerio.attr("href"))
      .slice(0, 3)
      .map(Either.toTask)
  )
    .mapError((msg) => new Error(msg))
    .map((urls) => urls.map((url) => `https://www.imdb.com${url}`));
  return links;
}

function readMovieDetails(dom: cheerio.CheerioAPI): TaskType<Error, Movie> {
  const movie = {
    title: Either.toTask(
      Cheerio.required("title is required")(".hero__primary-text")(dom)
    ).mapError((msg) => new Error(msg)),
    directors: Either.toTask(
      Cheerio.required("directors are required")(
        ".title-pc-list li .ipc-metadata-list-item__list-content-item"
      )(dom)
    ).mapError((msg) => new Error(msg)),
  };
  return Task.sequenceObject(movie);
}

Cheerio.scrapeUrl(readMovieUrlsFromActorPage)(
  "https://www.imdb.com/name/nm0000241/"
)
  .map(Utils.peek("url"))
  .map((urls) => urls.map((url) => Cheerio.scrapeUrl(readMovieDetails)(url)))
  .chain((movies) => Task.sequenceArray(movies))
  .fork(console.error, console.log);

// scrapeUrl(readMovieDetails)(
//   'https://www.imdb.com/title/tt37024665/?ref_=nm_flmg_job_1_cdt_t_1',
// ).fork(console.error, console.log)

export { Task, Either, cheerio };
