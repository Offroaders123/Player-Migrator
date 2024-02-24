# Player Inventory Migrator

Started working the last day or so on making a tool to copy inventories between Bedrock worlds!

This requires the installation of Node.js, as well as `npm`, which comes with the install.

This project can be installed one of two ways, one with Git, and one without.

## Using Git to clone the project:

```sh
git clone https://github.com/Offroaders123/Player-Migrator --recurse-submodules
cd ./Player-Migrator/
npm ci
npm run build:full
npm link
```

## How to clone without needing Git:

First, download the project from here on GitHub as a `.zip` file. Then extract it using your file explorer.

Next you can open the extracted folder in your terminal, and continue with these commands:

```sh
npm ci
npm run build
npm link
```

## Possible issues with `npm ci`:

This project depends on [`node-leveldb-zlib`](https://github.com/extremeheat/node-leveldb-zlib), which may have to build locally to target your machine's architecture (it's a native C++ project). It does have pre-builds available for most systems, but not for all system architectures. For example, on my Apple Silicon machine, it has to build for `arm64` for example, while I think it already has a pre-build for `x86_64` macOS. So it may just work fine depending on your system. But if not, you may have to [install the tooling to build `node-leveldb-zlib`](https://github.com/extremeheat/node-leveldb-zlib?tab=readme-ov-file#dependencies) from source.

## Possible issues with `npm run build`:

When downloading the project as a `.zip` (say if Git isn't available), then the dependency [`Region-Types`](https://github.com/Offroaders123/Region-Types) won't be cloned, since it's a submodule. It's only needed for type-checking though, so the project will still run perfectly without it, the build step will just show some extra errors for not having found the types though.

## How to use the CLI itself:

Now that it's been installed globally to your terminal (because of the `npm link` call), you can start using the project itself!

```sh
# Logs the players in this world.
player-migrator ./minecraftWorlds/DbKdZWg+AAA=

# Copy the inventory of the '~local_player' key from the first world, to the second one.
player-migrator ./minecraftWorlds/DbKdZWg+AAA= ./minecraftWorlds/yLRnZYpDAAA= ~local_player

# Copy the inventory of the '~local_player' key to the 'player_4380f792-ebd4-4776-8153-472db4ac7756' key.
# (It is optional for you to need to specify the output key, it will use the input key by default, say like if you are copying to/from '~local_player' for both worlds.)
player-migrator ./minecraftWorlds/DbKdZWg+AAA= ./minecraftWorlds/yLRnZYpDAAA= ~local_player player_4380f792-ebd4-4776-8153-472db4ac7756
```

This likely could be designed much better, I want to get better at designing proper CLI setups. I could already see it could be useful to provide options to copy between players in the same world, allow dumping the NBT contents of players themselves, things like that.

This intentionally only copies the inventory data over (items in the Ender Chest included), because it is a bit backwards for things like your position and status effects to be copied over as well. This would be a different story if this was for a world conversion step, but this is only for copying over player data itself, not an entire converter. This also only goes from Bedrock to Bedrock. Eventually down the line I do want to work on a converter as well though, that will be another project on it's own though, this is more of a one-off thing to build on it's own from that.