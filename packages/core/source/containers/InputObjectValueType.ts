import { UnnamedInputValueDefinitionNode } from "../AST";
import { InputTypeConfig } from "../Config";
import { AnyInputObjectType } from "./InputObjectType";

export class InputObjectValueType<
   URI extends string,
   Config extends InputTypeConfig<A>,
   Type extends AnyInputObjectType<URI>,
   A
> {
   _A!: A;
   _TYPE!: Type;
   _ServerURI!: URI;
   _tag = "InputObjectValueType" as const;
   constructor(public node: UnnamedInputValueDefinitionNode, public config: Config) {}
}
