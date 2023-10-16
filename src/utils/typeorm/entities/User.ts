import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tickets } from './Tickets';
import { WorkspacesUsers } from './WorkspacesUsers';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @OneToMany(() => WorkspacesUsers, (workspacesUsers) => workspacesUsers.user, {
    cascade: true,
  })
  workspacesUsers: WorkspacesUsers[];

  @ManyToMany(() => Tickets, (tickets) => tickets.users)
  tickets: Tickets[];
}
