import { App } from './app';

const app = new App();
app.setup()
  .then(() => {
    app.start();
  });

/**
TODO:
* Migrations fail when running them twice in a row, when the first one ran as a
clean run. It looks like the first migration does not get recorded into the history
*/
