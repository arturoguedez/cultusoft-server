import { App } from './app';

let app = new App();
app.setup()
    .then(() => {
        app.start();
    });
