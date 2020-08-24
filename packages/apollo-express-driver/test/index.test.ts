import * as T from "@effect-ts/core/Effect";
import { FunctionN, pipe } from "@effect-ts/core/Function";
import { UnionToIntersection } from "@effect-ts/core/Utils";
import { Scalar, SchemaScalars, SchemaScalarsEnv } from "@graphql-effect/core/dist/Scalar";
import { GQLFieldInterpreter, GQLInputInterpreter } from "@graphql-effect/core/interpreters";
import { CoreFieldPURI, CoreInputPURI } from "@graphql-effect/core/programs";

import { makeApollo } from "../source";

const Apollo = makeApollo<CoreFieldPURI, CoreInputPURI>(
   { ...GQLFieldInterpreter(), ...GQLInputInterpreter() },
   GQLInputInterpreter()
)("Apollo", {}, ({ req, res }) =>
   pipe(
      T.access((_: { env: string }) => _),
      T.map(() => ({ req, res }))
   )
);

const A = Apollo.objectType<{}>()({
   fields: (F) => ({
      a: F.string(),
      b: F.field({
         args: {},
         resolve: () =>
            pipe(
               T.access((_: { env2: string }) => _),
               T.chain(({ env2 }) => T.succeed(env2))
            ),
         type: F.string()
      })
   }),
   name: "A"
});

const Query = Apollo.objectType<{}>()({
   fields: (F) => ({
      A: F.field({
         args: {},
         resolve: () => T.succeed({ a: "A", b: "B" }),
         type: F.objectField(() => A)
      })
   }),
   name: "Query"
});

const Scalar = Apollo.scalarType("S", {
   parseLiteral: (v) => T.succeed("wow"),
   parseValue: (u) =>
      pipe(
         T.access((_: { env3: boolean }) => _),
         T.chain(() => T.succeed("wow"))
      ),
   serialize: (u) => T.succeed("wow")
});

const { resolvers, typeDefs, scalars } = Apollo.generateSchema(Query, A, Scalar);
