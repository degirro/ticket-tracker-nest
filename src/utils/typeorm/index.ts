import { Tickets } from './entities/Tickets';
import { User } from './entities/User';
import { Workspaces } from './entities/Workspaces';
import { WorkspacesUsers } from './entities/WorkspacesUsers';
import { SessionEntity } from './entities/Session';
import { Notifications } from './entities/Notifications';
const entities = [
  User,
  SessionEntity,
  Tickets,
  Workspaces,
  WorkspacesUsers,
  Notifications,
];

export {
  User,
  SessionEntity,
  Tickets,
  Workspaces,
  WorkspacesUsers,
  Notifications,
};

export default entities;
