import cheerio from 'cheerio'
import R from 'ramda'
import S from 'sanctuary'

/* 
    Functional "API" for using cheerio

    Define some utility functions that will allow us to work with `cheerio`
    using a more functional style. In particular,
    we don't want to use methods on global objects, and we don't want to worry 
    about binding or `this`. Also, we need to be able to use these functions
    with our "main" functions, using `compose` or `pipe`
*/

// Define some types
// type alias Html = String
// type alias DOM = Object // unknown structure, defined by Cheerio
// type alias Selector = String

// loadDom :: Html -> DOM
export const loadDom = cheerio.load.bind(cheerio)

// selectAll :: Selector -> DOM -> List DOM
export const selectAll = R.curry((sel, dom) => {
    const res = dom(sel)
    return R.map(cheerio, res.toArray())
})

// selectFirst :: Selector -> DOM -> Maybe DOM
export const selectFirst = R.curry((sel, dom) =>
    R.compose(S.toMaybe, R.head, selectAll(sel))(dom)
)

// html :: Dom -> Html
// Gets the HTML string representation of the given element
export const html = dom => dom.html()

// text :: Dom -> String
// Gets the string content the given element, INCLUDING its children elements
export const text = dom => R.trim(dom.text())

// innerText :: Dom -> String
// Gets the string content the given element, EXCLUDING its children elements
export const innerText = dom => {
    return R.trim(dom.contents().filter(filterText).text());

    function filterText() {
        return this.type == 'text'
    }
}

// attr :: String -> Dom -> Maybe String
// Get the value of the attribute with the given name from the given element
export const attr = R.curry((attrName, dom) =>
    R.compose(R.map(R.trim), S.toMaybe, dom.attr.bind(dom))(attrName)
)

// required :: Err -> Selector -> Either Err String
// Helper function for getting the text of required elements
export const required = R.curry((err, selector) =>
    R.compose(S.maybeToEither(err), R.map(innerText), selectFirst(selector))
)

// optional :: String -> Selector -> String
// Helper function for getting the text of optional elements
export const optional = R.curry((defaultValue, selector) =>
    R.compose(S.fromMaybe(defaultValue), R.map(text), selectFirst(selector))
)
