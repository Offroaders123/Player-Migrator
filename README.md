# Player Inventory Migrator

Started working the last day or so on making a tool to copy inventories between Bedrock worlds!

This requires the installation of Node.js, as well as `npm`, which comes with the install.

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