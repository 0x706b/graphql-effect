import { UnnamedInputValueDefinitionNode } from "../AST";
import { InputTypeConfig } from "../Config";

/**
 * @name InputValueType
 * @description Represents a field on an InputObjectType, or an arg on a field resolver
 */
export class InputValueType<URI extends string, Config extends InputTypeConfig<A>, A> {
   _A!: A;
   _ServerURI!: URI;
   _tag = "InputValueType" as const;
   constructor(public node: UnnamedInputValueDefinitionNode, public config: Config) {}
}
