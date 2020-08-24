import * as Tx from "@0x706b/convenience-ts/effect-ts/Effect";
import { entries } from "@0x706b/convenience-ts/Record";
import * as T from "@effect-ts/core/Effect";
import { pipe } from "@effect-ts/core/Function";
import type { SchemaScalars, SchemaScalarsEnv } from "@graphql-effect/core";
import { GraphQLScalarType } from "graphql";

export function convertScalarResolvers<S extends SchemaScalars>(_: {
   env: SchemaScalarsEnv<S>;
   scalars: S;
}) {
   const toBind = {};
   for (const [typeName, resolver] of entries(_.scalars)) {
      (toBind as any)[typeName] = new GraphQLScalarType({
         name: resolver.name,
         parseLiteral: (u) =>
            pipe(
               resolver.functions.parseLiteral(u),
               T.provide({ ...(_.env as any) }),
               Tx.runSyncSerializable
            ),
         parseValue: (u) =>
            pipe(
               resolver.functions.parseValue(u),
               T.provide({ ...(_.env as any) }),
               Tx.runPromiseSerializable
            ),
         serialize: (u) =>
            pipe(
               resolver.functions.serialize(u),
               T.provide({ ...(_.env as any) }),
               Tx.runPromiseSerializable
            )
      });
   }
   return toBind;
}
