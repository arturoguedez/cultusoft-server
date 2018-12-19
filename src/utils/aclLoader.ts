import * as Acl from 'acl';
import aclModel from '../models/Acl';
import logger from '../utils/logger';

export class AclLoader {
  public loadAcl(): Promise<any> {
    const acl = new Acl(new Acl.memoryBackend());

    return aclModel.findAll()
      .then((allowedAcl) => {
        acl.allow(allowedAcl);
        return Promise.resolve(acl);
      });
  }
}
export default AclLoader;
