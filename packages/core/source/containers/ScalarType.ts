import * as E from "@effect-ts/core/Classic/Either";
import { DirectiveNode, ScalarTypeDefinitionNode } from "graphql";

import { ScalarFunctions } from "../Scalar";

export interface ScalarTypeConfig {
   description?: string;
   directives?: DirectiveNode[];
}

export class ScalarType<
   URI extends string,
   Name extends string,
   Funcs extends ScalarFunctions<E, A>,
   E,
   A
> {
   _tag = "ScalarType" as const;
   _A!: A;
   _ServerURI!: URI;
   constructor(public name: Name, public node: ScalarTypeDefinitionNode, public functions: Funcs) {}
}

export type AnyScalarType<ApolloURI extends string> = ScalarType<
   ApolloURI,
   string,
   ScalarFunctions<any, any>,
   any,
   any
>;
