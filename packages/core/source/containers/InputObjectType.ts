import { InputObjectTypeDefinitionNode } from "graphql";

import { InputRecord } from "./Utils";

/**
 * @name InputObjectType
 * @description Represents a named input object type, must be added to the schema in order to be used
 */
export class InputObjectType<
   URI extends string,
   Name extends string,
   Fields extends InputRecord<URI, Fields>,
   A
> {
   _A!: A;
   _FIELDS!: Fields;
   _ServerURI!: URI;
   _CONFIGS!: { [k in keyof Fields]: Fields[k]["config"] };
   _tag = "InputObjectType" as const;
   constructor(public name: Name, public node: InputObjectTypeDefinitionNode) {}
}

export type AnyInputObjectType<ApolloURI extends string> = InputObjectType<
   ApolloURI,
   any,
   InputRecord<ApolloURI, any>,
   any
>;
