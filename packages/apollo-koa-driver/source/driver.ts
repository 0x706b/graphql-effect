import * as Tx from "@0x706b/convenience-ts/effect-ts/Effect";
import * as K from "@0x706b/effect-ts-koa";
import * as T from "@effect-ts/core/Effect";
import * as L from "@effect-ts/core/Effect/Layer";
import { identity, pipe } from "@effect-ts/core/Function";
import { has, HasType } from "@effect-ts/system/Has";
import {
   Context,
   ContextURI,
   ExtendObjectTypeSummoner,
   FieldPURIS,
   InferredFieldAlgebra,
   InferredInputAlgebra,
   InputObjectTypeSummoner,
   InputPURIS,
   makeExtendObjectTypeSummoner,
   makeInputObjectTypeSummoner,
   makeObjectTypeSummoner,
   makeScalarTypeFromCodecSummoner,
   makeScalarTypeSummoner,
   makeSchemaGenerator,
   ObjectTypeSummoner,
   ScalarTypeFromCodecSummoner,
   ScalarTypeSummoner,
   SchemaGenerator,
   SchemaResolvers,
   SchemaResolversEnv,
   SchemaScalars,
   SchemaScalarsEnv
} from "@graphql-effect/core";
import { Config } from "apollo-server-core";
import {
   ApolloServer,
   IResolvers,
   ITypeDefinitions,
   makeExecutableSchema
} from "apollo-server-koa";
import * as koa from "koa";
import { ConnectionContext } from "subscriptions-transport-ws";
import WebSocket from "ws";

import { convertResolvers } from "./convertResolvers";
import { convertScalarResolvers } from "./convertScalars";

export type ApolloKoaConfig = Omit<Config, "context" | "schema" | "subscriptions"> & {
   subscriptions?: Partial<{
      keepAlive?: number;
      onConnect?: (
         connectionParams: unknown,
         websocket: WebSocket,
         context: ConnectionContext
      ) => T.Effect<any, any, never, any>;
      onDisconnect?: (
         websocket: WebSocket,
         context: ConnectionContext
      ) => T.Effect<any, any, never, any>;
      path: string;
   }>;
};

export type ApolloExpressSubsriptionsEnv<C extends ApolloKoaConfig> = C extends {
   subscriptions: {
      onConnect?: (
         connectionParams: unknown,
         websocket: WebSocket,
         context: ConnectionContext
      ) => T.Effect<any, infer R, never, any>;
      onDisconnect?: (
         websocket: WebSocket,
         context: ConnectionContext
      ) => T.Effect<any, infer R2, never, any>;
   };
}
   ? (R extends never ? unknown : R) & (R2 extends never ? unknown : R2)
   : unknown;

export interface ApolloKoaInstanceConfig<
   ServerURI extends string,
   Ctx,
   R extends SchemaResolvers<ServerURI, any, Ctx, R, any>,
   S extends SchemaScalars = {}
> {
   additionalResolvers?: IResolvers;
   resolvers: R;
   scalars?: S;
   typeDefs: ITypeDefinitions;
}

export interface ApolloKoaDriver<
   ServerURI extends string,
   FieldPURI extends FieldPURIS,
   InputPURI extends InputPURIS,
   Ctx,
   C extends ApolloKoaConfig,
   RE
> {
   _C: C;
   _CTX: Ctx;
   _RE: RE;

   accessContext: T.SyncR<Context<ServerURI, Ctx>, Ctx>;
   extendObjectType: ExtendObjectTypeSummoner<ServerURI, FieldPURI, Ctx>;
   generateSchema: SchemaGenerator<ServerURI, Ctx>;
   inputObjectType: InputObjectTypeSummoner<ServerURI, InputPURI>;

   instance: <R extends SchemaResolvers<ServerURI, any, Ctx, R, any>, S extends SchemaScalars = {}>(
      config: ApolloKoaInstanceConfig<ServerURI, Ctx, R, S>
   ) => L.Layer<
      unknown,
      SchemaResolversEnv<ServerURI, R, Ctx> &
         SchemaScalarsEnv<S> &
         ApolloExpressSubsriptionsEnv<C> &
         RE &
         K.HasKoa,
      never,
      HasApolloKoaInstance
   >;

   objectType: <Root>() => ObjectTypeSummoner<ServerURI, FieldPURI, Root, Ctx>;
   scalarType: ScalarTypeSummoner<ServerURI>;
   scalarTypeFromCodec: ScalarTypeFromCodecSummoner<ServerURI>;
}

export interface ApolloKoaInstance {
   server: ApolloServer;
}
export const HasKoaExpressInstance = has<ApolloKoaInstance>();
export type HasApolloKoaInstance = HasType<typeof HasKoaExpressInstance>;

type Ret<T> = T extends T.Effect<infer _S, infer _R, infer _E, infer _A> ? _A : never;

type ContextFn<Conf extends ApolloKoaConfig, RE, Ctx> = (_: {
   connection?: Conf["subscriptions"] extends {
      onConnect: (...args: any[]) => T.Effect<any, any, never, any>;
   }
      ? Omit<koa.Context["connection"], "context"> & {
           context: Ret<ReturnType<Conf["subscriptions"]["onConnect"]>>;
        }
      : koa.Context["connection"];
   ctx: koa.Context;
}) => T.Effect<any, RE, never, Ctx>;

export function makeApollo<FieldPURI extends FieldPURIS, InputPURI extends InputPURIS>(
   fieldInterpreters: InferredFieldAlgebra<any, FieldPURI, any, any>,
   inputInterpreters: InferredInputAlgebra<any, InputPURI>
) {
   return <ServerURI extends string, Ctx, Conf extends ApolloKoaConfig, RE>(
      uri: ServerURI,
      config: Conf,
      context: ContextFn<Conf, RE, Ctx>
   ): ApolloKoaDriver<ServerURI, FieldPURI, InputPURI, Ctx, Conf, RE> => {
      const accessContext = T.access((_: Context<ServerURI, Ctx>) => _[ContextURI][uri]);

      const ApolloExpressInstance = <
         R extends SchemaResolvers<ServerURI, any, Ctx, R, any>,
         S extends SchemaScalars = {}
      >(
         instanceConfig: ApolloKoaInstanceConfig<ServerURI, Ctx, R, S>
      ) => {
         const { additionalResolvers, resolvers, scalars, typeDefs } = instanceConfig;
         const acquire = T.accessM(
            (
               env: SchemaResolversEnv<ServerURI, R, Ctx> &
                  SchemaScalarsEnv<S> &
                  ApolloExpressSubsriptionsEnv<Conf> &
                  RE
            ) =>
               pipe(
                  T.of,
                  T.bind("app", () => K.accessApp(identity)),
                  T.bind("httpServer", () => K.accessServer(identity)),
                  T.let("resolversToBind", () =>
                     convertResolvers<ServerURI, Conf, Ctx, RE, R>({ env, res: resolvers, uri })
                  ),
                  T.let("scalarsToBind", () =>
                     convertScalarResolvers({ env, scalars: scalars ?? {} })
                  ),
                  T.let("apolloConfig", () => {
                     const config_ = { ...config } as Omit<Config, "context" | "schema">;
                     if (config.subscriptions && config.subscriptions.onConnect) {
                        const onConnect = config.subscriptions.onConnect;
                        const onDisconnect = config.subscriptions.onDisconnect;

                        config_.subscriptions = {
                           keepAlive: config.subscriptions.keepAlive,
                           onConnect: (connectionParams, websocket, context) =>
                              pipe(
                                 onConnect(connectionParams, websocket, context),
                                 T.provide(env),
                                 T.runPromise
                              ),
                           onDisconnect: onDisconnect
                              ? (websocket, context) =>
                                   pipe(
                                      onDisconnect(websocket, context),
                                      T.provide(env),
                                      T.runPromise
                                   )
                              : undefined,
                           path: config.subscriptions.path
                        };
                     }
                     return config_;
                  }),
                  T.bind("schema", ({ resolversToBind, scalarsToBind }) =>
                     pipe(
                        () =>
                           makeExecutableSchema({
                              resolvers: {
                                 ...resolversToBind,
                                 ...(additionalResolvers ?? {}),
                                 ...scalarsToBind
                              },
                              typeDefs
                           }),
                        T.effectPartial((u) => u),
                        T.orDieKeep
                     )
                  ),
                  T.bind("server", ({ apolloConfig, schema, app, httpServer }) =>
                     pipe(
                        () => {
                           const server = new ApolloServer({
                              context: (ctx) =>
                                 pipe(context(ctx as any), T.provide(env), T.runPromise),
                              schema,
                              ...apolloConfig
                           });
                           server.applyMiddleware({ app });
                           apolloConfig.subscriptions &&
                              server.installSubscriptionHandlers(httpServer);
                           return server;
                        },
                        T.effectPartial((u) => u),
                        T.orDieKeep
                     )
                  ),
                  T.chain(({ server }) => T.succeed(server))
               )
         );
         return L.prepare(HasKoaExpressInstance)(
            T.map_(acquire, (server) => ({ server }))
         ).release((s) =>
            pipe(() => s.server.stop(), Tx.effectPartialAsync(identity), T.orDieKeep)
         );
      };
      return {
         _C: undefined as any,
         _CTX: undefined as any,
         _RE: undefined as any,
         accessContext,
         extendObjectType: makeExtendObjectTypeSummoner<ServerURI, FieldPURI, Ctx>()(
            fieldInterpreters
         ),
         generateSchema: makeSchemaGenerator<ServerURI, Ctx>(),
         inputObjectType: makeInputObjectTypeSummoner<ServerURI, InputPURI>()(inputInterpreters),
         instance: ApolloExpressInstance,
         objectType: <Root>() =>
            makeObjectTypeSummoner<ServerURI, FieldPURI>()(fieldInterpreters)<Root, Ctx>(),
         scalarType: makeScalarTypeSummoner<ServerURI>(),
         scalarTypeFromCodec: makeScalarTypeFromCodecSummoner<ServerURI>()
      };
   };
}
