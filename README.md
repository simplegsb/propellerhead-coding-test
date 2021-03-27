# Propellerhead Coding Test

## About

This project is written in **Node.js**. It is an **Express.js** HTTP server providing RESTful web services.

## Development

### Code

1. Install **Node.js** 8+
1. Clone this repo
1. Run `npm install`

### Database

Create a MySQL database and run the following:

1. Make sure the `assets/config/dev.json`'s default database URL is pointing to your local database
1. `npm run migrate`
1. `npm run seed:test-data` will create example data for testing

### Build

Run `npm build`

### Start the API

Run `node lib/api/index`

## Implementation Details

### Promises

Promises are used almost exclusively for asynchronous operations. For an introduction to promises go
[here](https://developers.google.com/web/fundamentals/getting-started/primers/promises) and for documentation go
[here](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Moment.js

Moments are used exclusively for representing dates. Unless specifically required in a certain time zone, they should be
created in UTC mode.
