import { App } from './app';

const app = new App();
app.setup()
    .then(() => {
        app.start();
    });
