import { UnnamedFieldDefinitionNode } from "../AST";
import { OutputTypeConfig } from "../Config";

/**
 * @name ScalarFieldType
 * @description Represents a field on an object type with a default resolve function
 */
export class ScalarFieldType<URI extends string, Config extends OutputTypeConfig, A> {
   _A!: A;
   _ServerURI!: URI;
   _tag = "ScalarFieldType" as const;
   constructor(public node: UnnamedFieldDefinitionNode, public config: Config) {}
}

export type AnyScalarFieldType<ApolloURI extends string> = ScalarFieldType<
   ApolloURI,
   OutputTypeConfig,
   any
>;
