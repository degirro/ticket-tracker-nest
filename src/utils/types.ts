import { Request } from 'express';
import { Tickets, User } from './typeorm';

export type CreateUserParams = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}>;

export type FindUserOptions = Partial<{
  selectAll: boolean;
}>;

export type ValidateUserDetails = {
  username: string;
  password: string;
};

export interface AuthenticatedRequest extends Request {
  user: User;
}

export type CreateTicketsParams = {
  title: string;
  desc: string;
  priority: string;
  issueType: string;
  status: string;
  estimation: number;
  users: User[];
};

export type UpdateTicketParams = {
  id: number;
  title: string;
  desc: string;
  priority: string;
  issueType: string;
  status: string;
  estimation: number;
  users: User[];
};

export type CreateWorkspacesParams = {
  admin: User;
  name: string;
  users: User[];
};
