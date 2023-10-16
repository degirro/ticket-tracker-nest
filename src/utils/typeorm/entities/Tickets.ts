import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Workspaces } from './Workspaces';

@Entity({ name: 'tickets' })
export class Tickets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  desc: string;

  @Column()
  priority: string;

  @Column()
  issueType: string;

  @Column()
  status: string;

  @Column()
  estimation: number;

  @ManyToMany(() => User, (user) => user.tickets, {
    cascade: ['insert', 'remove'],
  })
  @JoinTable()
  users: User[];

  @ManyToOne(() => Workspaces, (workspaces) => workspaces.tickets)
  @JoinColumn({ name: 'workspaceId' })
  workspaces: Workspaces;

  @Column()
  workspaceId: number;
}
