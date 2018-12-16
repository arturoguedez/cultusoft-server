import * as i18n from 'i18n';

export abstract class ValidatorAbstract {

  public error(request, response, phrase: string, replace?) {
    return response.status(200).json({
      responseCode: 500,
      errorMessage: i18n.__({ phrase: phrase, locale: i18n.getLocale(request) }, replace ? replace : {})
    });
  }

  private getField(request, field: string) {
    if (request.body) {
      if (request.body.hasOwnProperty(field)) {
        return request.body[field];
      }
    }
    return null;
  }

  protected getFields(request, fields: Array<string>) {
    return fields.map((field) => this.getField(request, field));
  }

  protected abstract validateFields(request, response, next): string;

  public validate() {
    const self = this;
    return function(request, response, next) {
      console.log(request.path);
      self.validateFields(request, response, next);
    }
  }
}
