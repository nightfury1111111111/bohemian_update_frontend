import { stakingGlobals } from "../../../constants/staking";

export * from "./gem-bank";
export * from "./gem-farm";
export * from "./gem-common";
export * from "./vault";

export const GEM_BANK_PROG_ID = stakingGlobals.gemBankProgramId;
export const GEM_FARM_PROG_ID = stakingGlobals.gemFarmProgramId;
export const VAULT_PROG_ID = stakingGlobals.vaultProgramId;

