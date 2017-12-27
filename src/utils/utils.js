import Future from 'fluture'
import request from 'request'
import R from 'ramda'
import S from 'sanctuary'

// Define some types
// type alias Html = String
// type alias Url = String
// type alias Err = { msg: String }


// peek :: a -> a
// Prints the given input to the log and returns it again
export const peek = R.curry((prefix, a) => {
    console.log(prefix, ':', a)
    return a
})

// getHtml :: Url -> Future Err Html
export const getHtml = url =>
    Future((rej, res) => {
        const opts = { method: 'GET', uri: url }
        request(opts, (error, response, body) => {
            if (error) {
                rej(error)
            } else {
                res(body)
            }
        })
    })

// # eitherToFuture :: Either Err a -> Future a
export const eitherToFuture = either => {
    if (S.isLeft(either)) {
        return Future.reject(either.value)
    } else {
        return Future.of(either.value)
    }
}

// # maybeToFuture :: Maybe Err a -> Future a
export const maybeToFuture = R.curry((err, maybe) =>
    R.compose(eitherToFuture, S.maybeToEither(err))(maybe)
)

// sequenceObject :: (* -> f *) -> Object (f *) -> f (Object *)
// This is basically R.sequence, but for objects
export const sequenceObject = R.curry((appl, obj) => {
    const keys = R.keys(obj) // ['title', 'summary', 'year']
    const wrappedValues = R.values(obj) // [Maybe(1), Maybe(2), Maybe(3)]
    const unwrappedValues = R.sequence(appl, wrappedValues) // Maybe([1,2,3])
    return R.map(R.zipObj(keys))(unwrappedValues) // Maybe { title: 1, summary: 2, year: 3 }
})

// error :: String -> Err
// build an Err object with the given error message
export const error = msg => {
    msg
}
