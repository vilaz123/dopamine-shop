import { readJson, storageKeys, writeJson } from "@/lib/utils/storage";
import type { AccountSnapshot, MockUser } from "@/types/user";

export function saveAccountSnapshot(user: MockUser, data: Omit<AccountSnapshot, "user" | "updatedAt">) {
  const accounts = readJson<Record<string, AccountSnapshot>>(storageKeys.accounts, {});
  accounts[user.id] = { user, ...data, updatedAt: new Date().toISOString() };
  writeJson(storageKeys.accounts, accounts);
}

export function getAccountSnapshot(userId: string) {
  return readJson<Record<string, AccountSnapshot>>(storageKeys.accounts, {})[userId] ?? null;
}
