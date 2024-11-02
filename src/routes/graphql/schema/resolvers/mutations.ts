import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { Context } from '../../types/types.js';
import { PostType, ProfileType, UserType } from '../types.js';
import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
} from '../inputs.js';
import { UUIDType } from '../../types/uuid.js';

export const Mutations = new GraphQLObjectType<unknown, Context>({
  name: 'Mutations',
  fields: {
    createUser: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: (_, { dto }: { dto: { name: string; balance: number } }, { prisma }) =>
        prisma.user.create({ data: dto }),
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: (
        _,
        {
          dto,
        }: {
          dto: {
            userId: string;
            memberTypeId: string;
            isMale: boolean;
            yearOfBirth: number;
          };
        },
        { prisma },
      ) => prisma.profile.create({ data: dto }),
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: (
        _,
        {
          dto,
        }: {
          dto: {
            authorId: string;
            title: string;
            content: string;
          };
        },
        { prisma },
      ) => prisma.post.create({ data: dto }),
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: (
        _,
        { id, dto }: { id: string; dto: { name: string; balance: number } },
        { prisma },
      ) => prisma.user.update({ where: { id }, data: dto }),
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: (
        _,
        {
          id,
          dto,
        }: {
          id: string;
          dto: {
            isMale: boolean;
            yearOfBirth: number;
            memberTypeId: string;
          };
        },
        { prisma },
      ) => prisma.profile.update({ where: { id }, data: dto }),
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: (
        _,
        { id, dto }: { id: string; dto: { title: string; content: string } },
        { prisma },
      ) => prisma.post.update({ where: { id }, data: dto }),
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }) => {
        await prisma.user.delete({ where: { id } });
        return 'User deleted successfully';
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }) => {
        await prisma.profile.delete({ where: { id } });
        return 'Profile deleted successfully';
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }) => {
        await prisma.post.delete({ where: { id } });
        return 'Post deleted successfully';
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma },
      ) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });
        return 'Subscribed successfully';
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma },
      ) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });
        return 'Unsubscribed successfully';
      },
    },
  },
});
