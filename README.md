# What it this?
I needed to extract information from some pages; I wanted to try out functional programming in javascript; I built this.

You can read more about it [here](https://medium.com/@rjbma/scraping-the-web-experiments-with-functional-programming-in-javascript-part-i-56ec7c40b297).

# Libraries
As described in the article above, this project is mostly about plumbing, i.e. controlling how data is routed between components.
These libraries do most of the heavy lifting:
- [request](https://github.com/request/request): we'll use to perform a GET request to a URL and get the HTML back 
- [Cheerio](https://github.com/cheeriojs/cheerio): let's us use jQuery-like selectors to select and extract text from HTML elements
- [Ramda](http://ramdajs.com/): the FP utility library
- [Sanctuary](https://sanctuary.js.org/): we'll just use it for the `Maybe` and `Either` implementations. It would have been possible to use it as an FP utility library as well, instead of **Ramda**.
- [Fluture](https://github.com/fluture-js/Fluture): for the implementation of `Future`

# I want to use this. What do I do?
Currently, there's no library on **npm**, probably never will be. 

Interesting stuff is in the `scraper.js` file. You should probably leave the `scrapeUrl` function alone, and just build your own decoder functions (those will depend on the web pages you want to scrape. Look at `decodeMovie` and `decodeActorMovieUrls` for examples). 

Each decoder function is then passed as an argument to `scrapeUrl` which will return a `Future`. You can keep adding stuff to your scraping pipeline by mapping and chaining on that `Future` until you're ready to fork it. 

If anything of this is new to you, I really recommend reading the article above, in which I describe in excruciating detail how I got to this solution.

# Tests
There are some tests, specifically for the utility functions that define the API for **cheerio** and **request**. To run them:

    npm test
