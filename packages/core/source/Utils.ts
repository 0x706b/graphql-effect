import type { ExcludeMatchingProperties } from "@0x706b/convenience-ts/Utils";
import { Any as _A } from "ts-toolbelt";

import { FieldRecord, InputRecord } from "./containers";

export type NonRequiredInputKeys<T extends InputRecord<any, T>> = keyof ExcludeMatchingProperties<
   {
      [k in keyof T]: T[k]["config"]["required"] extends false ? k : never;
   },
   never
>;

export type RequiredInputKeys<T extends InputRecord<any, T>> = Exclude<
   keyof T,
   NonRequiredInputKeys<T>
>;

export type TypeofInputRecord<T extends InputRecord<any, T>> = _A.Compute<
   {
      [k in NonRequiredInputKeys<T>]?: T[k]["_A"];
   } &
      {
         [k in RequiredInputKeys<T>]: T[k]["_A"];
      },
   "flat"
>;

export type NullableFieldKeys<
   T extends FieldRecord<any, any, any, T>
> = keyof ExcludeMatchingProperties<
   {
      [k in keyof T]: T[k]["config"]["nullable"] extends true ? k : never;
   },
   never
>;

export type NonNullableFieldKeys<T extends FieldRecord<any, any, any, T>> = Exclude<
   keyof T,
   NullableFieldKeys<T>
>;

export type TypeofFieldRecord<T extends FieldRecord<any, any, any, T>> = _A.Compute<
   {
      [k in NullableFieldKeys<T>]?: T[k]["_A"];
   } &
      {
         [k in NonNullableFieldKeys<T>]: T[k]["_A"];
      },
   "flat"
>;
