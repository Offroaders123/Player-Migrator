#!/usr/bin/env node

import { LevelDB } from "leveldb-zlib";
import { Int16, NBTData, read, write } from "nbtify";
import { join } from "node:path";
import { Player } from "../Region-Types/dist/bedrock/index.js";

process.on("uncaughtException",error => {
  console.error(`${error}`);
  process.exit(1);
});

// Args

const inputWorld: string = process.argv[2] ?? ((): never => { throw new Error("Please specify an input world to read from"); })();
const outputWorld: string | undefined = process.argv[3];
const inputPlayerKey: string | undefined = process.argv[4];
let outputPlayerKey: string | undefined = process.argv[5];

// CLI

async function main(): Promise<void> {
  await using inputDB = await openWorld(inputWorld);

  if (outputWorld === undefined){
    const playerEntries = await findPlayerEntries(inputDB);
    return await printPlayerEntries(playerEntries);
  }

  await using outputDB = await openWorld(outputWorld);

  if (inputPlayerKey === undefined){
    throw new Error("Please specify a player key to copy from the input world");
  }

  outputPlayerKey = inputPlayerKey;

  const inputPlayerEntry = await getPlayerEntry(inputDB,inputPlayerKey);
  printPlayerEntry(inputPlayerEntry);

  const outputPlayerEntry = await getPlayerEntry(outputDB,outputPlayerKey);
  printPlayerEntry(outputPlayerEntry);

  console.log(`Copying player inventory from '${join(inputDB.path,inputPlayerKey)}' to '${join(outputDB.path,outputPlayerKey)}'...`,"\n");

  await copyPlayerInventory(outputDB,inputPlayerEntry,outputPlayerEntry);

  console.log("Completed successfully!");
}

class WorldDB extends LevelDB implements AsyncDisposable {
  constructor(path: string) {
    super(join(path,"db"),{ createIfMissing: false });
  }

  async [Symbol.asyncDispose]() {
    await this.close();
  }
}

async function openWorld(path: string): Promise<WorldDB> {
  const db = new WorldDB(path);
  await db.open();
  return db;
}

await main();

type PlayerEntry = [string, NBTData<Player>];

async function printPlayerEntries(entries: PlayerEntry[]): Promise<void> {
  for (const entry of entries){
    printPlayerEntry(entry);
  }
}

function printPlayerEntry(entry: PlayerEntry): void {
  const inventory: string[] = prettifyPlayer(entry[1]);
  console.log(entry[0],inventory,"\n");
}

function prettifyPlayer(player: NBTData<Player>): string[] {
  return player.data.Inventory
    .filter(item =>
      // @ts-expect-error - `BedrockItem` property usage
      item.Name !== "" && item.id?.valueOf() !== 0
    )
    .map(item => {
      // Also need to add item IDs to Region-Types for legacy Bedrock chunks, as well as the `id` property itself.
      const id: string | number = "id" in item && item.id instanceof Int16 ? item.id.valueOf() as number : item.Name;
      const { Count } = item;
      const customName: string | undefined = item.tag?.display?.Name;
      return `${id} [${Count}]${customName !== undefined ? ` "${customName}"` : ""}`;
    });
}

// World

async function getPlayerEntry(db: LevelDB, playerKey: string): Promise<PlayerEntry> {
  const entry: PlayerEntry | undefined = (await findPlayerEntries(db))
    .find(([key]) => key === playerKey);

  if (entry === undefined){
    throw new Error(`Could not find player key '${playerKey}' in '${db.path}'`);
  }

  return entry;
}

async function findPlayerEntries(db: LevelDB): Promise<PlayerEntry[]> {
  const keys = await findPlayerKeys(db);
  const entries: PlayerEntry[] = await Promise.all(
    keys.map(async key => {
      const buffer: Buffer = (await db.get(key))!;
      const value = await read<Player>(buffer);
      return [key, value];
    })
  );
  return entries;
}

async function findPlayerKeys(db: LevelDB): Promise<string[]> {
  const keys: string[] = (await fromAsync(db.getIterator({ values: false })))
    .filter(entry => /player/.test(entry[0].toString("utf-8")))
    .map(([key]) => key.toString("utf-8"))
  return keys;
}

async function copyPlayerInventory(db: LevelDB, inputEntry: PlayerEntry, outputEntry: PlayerEntry): Promise<void> {
  outputEntry[1].data.Inventory = inputEntry[1].data.Inventory;
  outputEntry[1].data.EnderChestInventory = inputEntry[1].data.EnderChestInventory;
  const buffer: Buffer = Buffer.from((await write(outputEntry[1])).buffer);
  await db.put(inputEntry[0],buffer);
}

// Polyfills

async function fromAsync<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const entries: T[] = [];
  for await (const entry of iterable){
    entries.push(entry);
  }
  return entries;
}