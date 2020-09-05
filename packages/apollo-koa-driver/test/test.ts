import * as K from "@0x706b/effect-ts-koa";
import * as T from "@effect-ts/core/Effect";
import * as L from "@effect-ts/core/Effect/Layer";
import { pipe } from "@effect-ts/core/Function";
import {
   CoreFieldPURI,
   CoreInputPURI,
   GQLFieldInterpreter,
   GQLInputInterpreter
} from "@graphql-effect/core";

import * as G from "../source";

const Apollo = G.makeApollo<CoreFieldPURI, CoreInputPURI>(
   { ...GQLFieldInterpreter(), ...GQLInputInterpreter() },
   GQLInputInterpreter()
)("Apollo-Koa", {}, ({ ctx }) => T.succeed(ctx));

const Query = Apollo.objectType<{}>()({
   fields: (F) => ({
      hello: F.field({
         args: {},
         resolve: ({ ctx }) => T.succeed(`Hello, world! ::: ${ctx.ip}`),
         type: F.string()
      })
   }),
   name: "Query"
});

const { typeDefs, resolvers } = Apollo.generateSchema(Query);

const Koa = K.Koa(4000, "localhost");

const App = pipe(Apollo.instance({ resolvers, typeDefs }), L.using(Koa));

const cancel = pipe(T.never, T.provideSomeLayer(App), K.provideKoaConfig, T.runMain);

process.on("SIGINT", () => {
   cancel();
});
