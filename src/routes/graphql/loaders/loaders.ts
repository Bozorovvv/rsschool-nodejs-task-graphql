import DataLoader from 'dataloader';
import {
  PrismaClient,
  Profile as PrismaProfile,
  User as PrismaUser,
} from '@prisma/client';
import { MemberTypeId, MemberTypeModel, Post, Profile, User } from '../types/types.js';

export interface DataLoaders {
  profileLoader: DataLoader<string, Profile | null>;
  postsLoader: DataLoader<string, Post[]>;
  subscribedToLoader: DataLoader<string, User[]>;
  subscribersLoader: DataLoader<string, User[]>;
  memberTypeLoader: DataLoader<MemberTypeId, MemberTypeModel | null>;
}

const transformPrismaProfile = (profile: PrismaProfile): Profile => ({
  ...profile,
  memberTypeId: profile.memberTypeId as MemberTypeId,
});

const transformPrismaUser = (user: PrismaUser): User => ({
  id: user.id,
  name: user.name,
  balance: user.balance,
});

export const createLoaders = (prisma: PrismaClient): DataLoaders => {
  return {
    profileLoader: new DataLoader(async (userIds) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: userIds as string[] } },
      });
      return userIds.map((id) => {
        const profile = profiles.find((p) => p.userId === id);
        return profile ? transformPrismaProfile(profile) : null;
      });
    }),

    postsLoader: new DataLoader(async (authorIds) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: authorIds as string[] } },
      });
      return authorIds.map((id) => posts.filter((post) => post.authorId === id));
    }),

    subscribedToLoader: new DataLoader(async (userIds) => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: userIds as string[] } },
        include: { author: true },
      });
      return userIds.map((id) =>
        subscriptions
          .filter((sub) => sub.subscriberId === id)
          .map((sub) => transformPrismaUser(sub.author)),
      );
    }),

    subscribersLoader: new DataLoader(async (authorIds) => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: { in: authorIds as string[] } },
        include: { subscriber: true },
      });
      return authorIds.map((id) =>
        subscriptions
          .filter((sub) => sub.authorId === id)
          .map((sub) => transformPrismaUser(sub.subscriber)),
      );
    }),

    memberTypeLoader: new DataLoader(async (memberTypeIds) => {
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: memberTypeIds as MemberTypeId[] } },
      });
      return memberTypeIds.map((id) => {
        const memberType = memberTypes.find((type) => id === (type.id as MemberTypeId));
        return memberType
          ? {
              id: memberType.id as MemberTypeId,
              discount: memberType.discount,
              postsLimitPerMonth: memberType.postsLimitPerMonth,
            }
          : null;
      });
    }),
  };
};
