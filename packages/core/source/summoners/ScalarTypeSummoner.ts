import { DecodeError } from "@0x706b/convenience-ts/io-ts";
import * as T from "@effect-ts/core/Effect";
import { flow, pipe } from "@effect-ts/core/Function";
import { valueFromASTUntyped, ValueNode } from "graphql";
import * as t from "io-ts";

import { createScalarTypeDefinitionNode } from "../AST";
import { ScalarType, ScalarTypeConfig } from "../containers";
import { ScalarA, ScalarE, ScalarFunctions, ScalarParseLiteralF } from "../Scalar";

export interface ScalarTypeSummoner<URI extends string> {
   <Name extends string, Funcs extends ScalarFunctions<any, any>>(
      name: Name,
      definition: Funcs,
      config?: ScalarTypeConfig
   ): ScalarType<URI, Name, Funcs, ScalarE<Funcs>, ScalarA<Funcs>>;
}

export interface ScalarTypeFromCodecSummoner<URI extends string> {
   <Name extends string, Config extends ScalarTypeFromCodecConfig<E, A> & ScalarTypeConfig, E, A>(
      name: Name,
      codec: t.Type<A, E>,
      config?: Config
   ): ScalarType<
      URI,
      Name,
      {
         parseLiteral: undefined extends Config["parseLiteral"]
            ? (u: ValueNode) => T.Effect<never, unknown, DecodeError<t.Type<A, E>>, E>
            : NonNullable<Config["parseLiteral"]>;
         parseValue: (u: unknown) => T.Effect<unknown, unknown, DecodeError<t.Type<A, E>>, E>;
         serialize: (u: unknown) => T.Effect<unknown, unknown, DecodeError<t.Type<A, E>>, A>;
      },
      E,
      A
   >;
}

export function makeScalarTypeSummoner<URI extends string>(): ScalarTypeSummoner<URI> {
   return (name, definition, config) => {
      return new ScalarType(
         name,
         createScalarTypeDefinitionNode({
            description: config?.description,
            directives: config?.directives,
            name
         }),
         definition
      );
   };
}

interface ScalarTypeFromCodecConfig<E, A> {
   errorCode?: string;
   message?: string;
   parseLiteral?: ScalarParseLiteralF<unknown, E>;
   userMessage?: string;
}

export function makeScalarTypeFromCodecSummoner<URI extends string>(): ScalarTypeFromCodecSummoner<
   URI
> {
   return (name, codec, config) => {
      const serialize = (u: unknown) =>
         pipe(
            T.fromEither(() => codec.decode(u)),
            T.mapError(
               (errors) =>
                  new DecodeError({
                     code: config?.errorCode ?? "INVALID_SCALAR_VALUE",
                     errors,
                     message: config?.message ?? `Invalid value ${u} provided to Scalar ${name}`,
                     type: codec,
                     userMessage:
                        config?.userMessage ?? `Invalid value ${u} provided to Scalar ${name}`
                  })
            )
         );
      const parseValue = flow(serialize, T.map(codec.encode));
      const parseLiteral = (valueNode: ValueNode) =>
         pipe(
            valueNode,
            valueFromASTUntyped,
            (v) => T.fromEither(() => codec.decode(v)),
            T.bimap(
               (errors) =>
                  new DecodeError({
                     code: config?.errorCode ?? "INVALID_SCALAR_VALUE",
                     errors,
                     message:
                        config?.message ??
                        `Invalid value ${valueFromASTUntyped(
                           valueNode
                        )} provided to Scalar ${name}`,
                     type: codec,
                     userMessage:
                        config?.userMessage ??
                        `Invalid value ${valueFromASTUntyped(valueNode)} provided to Scalar ${name}`
                  }),
               codec.encode
            )
         );
      return new ScalarType(
         name,
         createScalarTypeDefinitionNode({
            description: config?.description,
            directives: config?.directives,
            name
         }),
         {
            parseLiteral: config?.parseLiteral ?? (parseLiteral as any),
            parseValue,
            serialize
         }
      );
   };
}
