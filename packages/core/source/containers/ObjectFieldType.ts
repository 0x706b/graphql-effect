import { UnnamedFieldDefinitionNode } from "../AST";
import { OutputTypeConfig } from "../Config";
import { AnyObjectType } from "./ObjectType";

export class ObjectFieldType<
   URI extends string,
   Config extends OutputTypeConfig,
   Root,
   Ctx,
   Type extends AnyObjectType<URI, Ctx>,
   A
> {
   _A!: A;
   _TYPE!: Type;
   _ROOT!: Root;
   _ServerURI!: URI;
   _tag = "ObjectFieldType" as const;
   constructor(public node: UnnamedFieldDefinitionNode, public config: Config) {}
}

export type AnyObjectFieldType<ApolloURI extends string, Ctx> = ObjectFieldType<
   ApolloURI,
   OutputTypeConfig,
   any,
   Ctx,
   AnyObjectType<ApolloURI, Ctx>,
   any
>;
