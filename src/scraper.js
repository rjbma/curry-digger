import R from 'ramda'
import S from 'sanctuary'
import Future from 'fluture'
import * as U from './utils/utils'
import * as C from './utils/cheerio'

/*
    Define some types here, so that we know what we are talking about later...
    For example, when we say `Url` later we are really just talking about `String`

    type alias Url = String
    type alias PageBody = String
    type alias Err = { msg: String }
    
*/

// scrapeUrl :: (Dom -> Either Err a) -> Url -> Future Err a
const scrapeUrl = R.curry(
    (strategy, url) =>
        U.getHtml(url)
            .map(C.loadDom)
            .map(strategy)
            // transform the Either returned by the strategy into a Future and join with the existing Future
            .chain(U.eitherToFuture) // Future Err a
            // add the url to the error message, so that we know which one failed
            .mapRej(err => `Error scraping url: ${url}. Some details: ${err}`) // Future Err a
)

// decodeMovie :: Dom -> Either Err Movie
const decodeMovie = dom => {
    // the image URL isn't mandatory, we'll just use a default image
    const defaultImageUrl =
        'http://i.dailymail.co.uk/i/pix/2015/11/19/19/16593664000005DC-3325905-image-a-16_1447960037815.jpg'

    const obj = {
        title: C.required(
            'Could not find a title!',
            '.title_block .title_wrapper h1'
        )(dom),
        summary: C.required(`Don't know what it's about!`, '.summary_text')(
            dom
        ),
        year: S.Right(C.optional('', '.title_block #titleYear a')(dom)),
        director: S.Right(C.optional('', '.plot_summary span[itemprop=director]')(dom)),
        imageUrl: R.compose(
            S.Right,
            S.fromMaybe(defaultImageUrl),
            R.chain(C.attr('src')),
            C.selectFirst('.minPosterWithPlotSummaryHeight .poster a img')
        )(dom),
    }
    return U.sequenceObject(S.of(S.Either), obj)
}

// decodeActorMovies :: Dom -> Either Err (List String)
const decodeActorMovieUrls = dom => {
    const actorMoviesSelector =
        '#filmography #filmo-head-actor + .filmo-category-section .filmo-row b a'

    const arr = R.compose(
        R.sequence(S.of(S.Either)), // Either Err (List String)
        R.map(S.maybeToEither(U.error('Invalid Url'))), // List (Either Err String)
        R.map(R.map(x => 'http://www.imdb.com' + x)), // List (Maybe String)
        R.map(C.attr('href')), // List (Maybe String)
        C.selectAll(actorMoviesSelector) // List Dom
    )(dom)

    return arr
}

const logSuccesses = R.curry((start, data) => {
    const elapsedSec = (new Date() - start) / 1000.0
    console.log(data)
    console.log('Took ', elapsedSec, 's')
})

scrapeUrl(decodeActorMovieUrls, 'http://www.imdb.com/name/nm0000241')
    // Future Err (List String)

    // take only the first 3 hits. no point in strssing the server
    .map(R.take(3))
    // Future Err (List String)

    .map(R.map(scrapeUrl(decodeMovie)))
    // Future Err (List (Future Err Movie))

    .chain(Future.parallel(10))
    // Future Err (List Movie)

    .fork(console.error, logSuccesses(new Date()))
