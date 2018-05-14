export class Signup {
  public create(req, res): Promise<any> {
    console.log("got body:");
    console.log(req.body);

    return Promise.resolve(
      res.status(200).json(
        { responseCode: 200, errorMessage: "none" }
      ));
  }
}

export default new Signup();
