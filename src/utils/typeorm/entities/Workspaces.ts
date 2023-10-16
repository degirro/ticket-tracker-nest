import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tickets } from './Tickets';
import { User } from './User';
import { WorkspacesUsers } from './WorkspacesUsers';

@Entity({ name: 'workspaces' })
export class Workspaces {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  admin: User;

  @OneToMany(
    () => WorkspacesUsers,
    (workspacesUsers) => workspacesUsers.workspaces,
    {
      cascade: true,
    },
  )
  workspacesUsers: WorkspacesUsers[];

  @OneToMany(() => Tickets, (tickets) => tickets.workspaces)
  tickets: Tickets[];
}
