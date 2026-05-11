import { SessionContainer } from 'supertokens-node/recipe/session';

declare global {
  namespace Express {
    interface Request {
      session: SessionContainer;
    }
  }
}
