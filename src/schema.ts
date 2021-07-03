import { permissions } from './permissions'
import { APP_SECRET, getUserId } from './utils'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { applyMiddleware } from 'graphql-middleware'
import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
  list,
  scalarType,
} from 'nexus'
import { DateTimeResolver, JSONObjectResolver } from 'graphql-scalars'
import { Context } from './context'
import { nexusPrisma } from 'nexus-plugin-prisma'
import { GraphQLScalarType } from 'graphql'

export const Json = asNexusMethod(JSONObjectResolver, 'json')
export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.list.field('films', {
      type: 'Film',
      resolve: (parent, args, context: Context) => {
        return context.prisma.film.findMany()
      },
    })

    t.field('film', {
      type: 'Film',
      args: { id: intArg() },
      resolve: (parent, {id}, context) => {
        return context.prisma.film.findUnique({
          where: {
            id: Number(id)
          }
        })
      }
    })

    t.nullable.field('me', {
      type: 'User',
      resolve: (parent, args, context: Context) => {
        const userId = getUserId(context)
        return context.prisma.user.findUnique({
          where: {
            id: Number(userId),
          },
        })
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const hashedPassword = await hash(args.password, 10)
        const user = await context.prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
            password: hashedPassword,
          },
        })
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        }
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, context: Context) => {
        const user = await context.prisma.user.findUnique({
          where: {
            email,
          },
        })
        if (!user) {
          throw new Error(`No user found for email: ${email}`)
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          throw new Error('Invalid password')
        }
        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user,
        }
      },
    })

    t.field('createProfile', {
      type: 'Profile',
      args: {
        info: stringArg(),
        subscribeType: stringArg(),
        avatar: stringArg(),
      },
      resolve: (parent, args, context: Context) => {
        const userId = getUserId(context)
        if (!userId) throw new Error('Could not authenticate user.')
        return context.prisma.profile.create({
          data: {
            ...args,
            User: { connect: { id: Number(userId) } },
          },
        })
      },
    })

    t.field('updateProfile', {
      type: 'Profile',
      args: {
        id: intArg(),
        info: stringArg(),
        avatar: stringArg(),
      },
      resolve: (parent, { id, ...args }, context) => {
        const userId = getUserId(context)
        if (!userId) throw new Error('Could not authenticate user.')
        return context.prisma.profile.update({
          data: {
            ...args,
          },
          where: {
            id: Number(id),
          },
        })
      },
    })

    t.field('createComment', {
      type: 'Comment',
      args: {
        content: nonNull(stringArg()),
        id: nonNull(intArg()),
      },
      resolve: (parent, { content, id }, context) => {
        const userId = getUserId(context)
        if (!userId) throw new Error('Could not authenticate user.')
        return context.prisma.comment.create({
          data: {
            content,
            User: { connect: { id: Number(userId) } },
            Film: { connect: { id: Number(id) } },
          },
        })
      },
    })
  },
})

const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.int('id')
    t.string('info')
    t.string('subscribeType')
    t.string('avatar')
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
    t.field('Profile', {
      type: 'Profile',
      resolve: (parent, _, context) => {
        return context.prisma.user
          .findUnique({
            where: {
              id: parent.id || undefined,
            },
          })
          .Profile()
      },
    })
    t.field('comments', {
      type: 'Comment',
    })
  },
})

const Comment = objectType({
  name: 'Comment',
  definition(t) {
    t.int('id')
    t.string('content')
    t.date('createdAt')
    
    t.field('User', {
      type: 'User',
      resolve: (parent, _, context) => {
        const userId = getUserId(context)
        return context.prisma.user.findUnique({
          where: {
            id: Number(userId)
          }
        })
      }
    })
  },
})

const Film = objectType({
  name: 'Film',
  definition(t) {
    t.int('id')
    t.string('img')
    t.string('title')
    t.string('description')
    t.string('categories')
    t.string('itemTitle')
    t.string('ratingKinopoisk')
    t.string('ratingIMDb')
    t.string('trailer')
    t.string('more')
    t.int('releaseYear')
    t.nonNull.field('country', {
      type: 'JSONObject',
    })
    t.nonNull.field('directors', {
      type: 'JSONObject',
    })
    t.nonNull.field('geners', {
      type: 'JSONObject',
    })
    t.nonNull.field('cast', {
      type: 'JSONObject',
    })
    t.nonNull.field('kino', {
      type: 'JSONObject',
    })
    t.string('miniImg')
    t.date('added')
    t.list.field('comments', {
      type: 'Comment',
      // args: {
      //   filmId: intArg()
      // },
      resolve: (parent, args, context) => {
        // const filmId = getUserId(context)
        return context.prisma.comment.findMany()
      }
    })
  },
})

const ViewedFilm = objectType({
  name: 'ViewedFilms',
  definition(t) {
    t.int('id')
    t.string('content')
  },
})

const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token')
    t.field('user', { type: 'User' })
  },
})

const schemaWithoutPermissions = makeSchema({
  types: [
    Query,
    Mutation,
    User,
    ViewedFilm,
    Profile,
    AuthPayload,
    Json,
    DateTime,
    Comment,
    Film,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
  plugins: [
    nexusPrisma({
      experimentalCRUD: true,
      scalars: {
        DateTime: DateTimeResolver,
        Json: new GraphQLScalarType({
          ...JSONObjectResolver,
          name: 'Json',
          description:
            'The `JSON` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
        }),
      },
    }),
  ],
})

export const schema = applyMiddleware(schemaWithoutPermissions, permissions)
