import type { Jsonify } from "type-fest";
import { expectTypeOf, it } from "vitest";
import type { z } from "zod";

import type { zJobRecruiterLba as _zJobRecruiterLba } from "./laBonneAlternance.api.js";

it("should accept Jsonify input", () => {
  type Input = z.input<typeof _zJobRecruiterLba>;

  expectTypeOf<Input>().toMatchTypeOf<Jsonify<Input>>();
});
