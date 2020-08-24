import { ObjectTypeDefinitionNode } from "graphql";

import { FieldRecord, FieldResolverRecord } from "./Utils";

/**
 * @name ObjectType
 * @description Represents a named output object type, must be added to the schema in order to be used
 */
export class ObjectType<
   URI extends string,
   Name extends string,
   Root,
   Ctx,
   Fields extends FieldRecord<URI, Root, Ctx, Fields>,
   FieldResolvers extends FieldResolverRecord<URI, Fields>,
   R,
   A
> {
   _ROOT!: Root;
   _A!: A;
   _R!: R;
   _FIELDS!: Fields;
   _CTX!: Ctx;
   _ServerURI!: URI;
   _CONFIGS!: { [k in keyof Fields]: Fields[k]["config"] };
   _tag = "ObjectType" as const;
   constructor(
      public name: Name,
      public node: ObjectTypeDefinitionNode,
      public fields: Fields,
      public fieldResolvers: FieldResolvers
   ) {}
}

export type AnyObjectType<ApolloURI extends string, Ctx> = ObjectType<
   ApolloURI,
   string,
   any,
   Ctx,
   FieldRecord<ApolloURI, any, Ctx, any>,
   any,
   any,
   any
>;
