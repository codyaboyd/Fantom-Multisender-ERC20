import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";

describe("multisender", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Multisender as Program;

  it("loads the program workspace", async () => {
    assert.isOk(program.programId, "program id should exist");
  });
});
