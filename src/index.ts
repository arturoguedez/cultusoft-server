import app from './app';

const port = process.env.PORT || 300000;

app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }

    return console.log(`server is listening on ${port}`);
});
