import { PrismaClient } from '@prisma/client';
import { DataLoaders } from '../loaders/loaders.js';

export enum MemberTypeId {
  BASIC = 'BASIC',
  BUSINESS = 'BUSINESS',
}

export interface User {
  id: string;
  name: string;
  balance: number;
}

export interface Profile {
  id: string;
  userId: string;
  memberTypeId: MemberTypeId;
  isMale: boolean;
  yearOfBirth: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface MemberTypeModel {
  id: MemberTypeId;
  discount: number;
  postsLimitPerMonth: number;
}

export interface Context {
  prisma: PrismaClient;
  loaders: DataLoaders;
}
