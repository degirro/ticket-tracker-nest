import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Workspaces } from './Workspaces';

@Entity({ name: 'workspaces_users' })
export class WorkspacesUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.workspacesUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Workspaces, (workspaces) => workspaces.workspacesUsers)
  @JoinColumn({ name: 'workspaceId' })
  workspaces: Workspaces;

  @Column({ default: 'pending' })
  status: string;
}
