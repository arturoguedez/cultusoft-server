import app from './app';
const config = require('config');
const port = process.env.PORT || config.get('server').port;

app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }

    return console.log(`server is listening on ${port}`);
});
