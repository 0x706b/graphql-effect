import * as T from "@effect-ts/core/Effect";
import { pipe } from "@effect-ts/core/Function";

import { makeScalarTypeSummoner } from "../source";
import { SchemaScalarsEnv } from "../source/Scalar";

const scalar = makeScalarTypeSummoner<"A">();

const s = scalar("Test", {
   parseLiteral: (u) =>
      pipe(
         T.access((_: { env: string }) => _),
         T.chain(() => T.succeed("test"))
      ),
   parseValue: (u) =>
      pipe(
         T.access((_: { env: string }) => _),
         T.chain(() => T.succeed("test"))
      ),
   serialize: (u) =>
      pipe(
         T.access((_: { env: string }) => _),
         T.chain(() => T.succeed("test"))
      )
});

const schemaScalars = {
   A: s
}

type M = SchemaScalarsEnv<typeof schemaScalars>;
