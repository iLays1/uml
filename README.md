# Data file location
There are three type of datas:
- scrapped files:
	- `scripts/scrapped_files/`
- The generated json files:
	- `docs/_data_files/`
	- `scripts/data_files/`
- The generated html files:
	- `docs/jam_list/`
	- `docs/leaderboard/`
	- `docs/stats/`

To generate the json files, you need the scrapped files \
To generate the html files, you need the generated json files

# How to use the scripts
### NOTICE: I asked the Mini Jam's hosts for permissions to use the minijamofficial.com private api and to publish the datas. You should also ask for the permissions like I did 

To run the scripts, you need NodeJS installed. You also need [jsdom](https://www.npmjs.com/package/jsdom) module installed globally

`cd` to the `scripts/` folder,

```
node scrap_files.js
``` 
This command request from minijamofficial.com private api and scrap itch.io for datas. This will take more than a hour so only do this once every two weeks, after jam voting is done

Delete `scripts/scrapped_files/` before running this command

```
node data_create.js
```
This command generate the json files. The json files are used to generate the html files, but the leaderboard json files and the jammer_lookup.json are also used for the site's search page and jammer page

Delete `docs/_data_files` and `scripts/data_files` before running this command

```
node html_create.js
```
This command generate the html files

Delete `docs/jam_list/`, `docs/leaderboard/`, `docs/stats/` before running this command

The workflow kinda go like this: You delete all the data folders, and then you run `node scrap_files.js`, and then `node data_create.js`, and then `node html_create.js`

Afterthat the page is up to date. Just git push to github pages or sth

If you have any other questions dm me on Discord. My user name is triplecubes

# LICENSE
Unofficial Mini Jam Leaderboard is under the MIT license. Check [LICENSE](LICENSE) for full information.

# THIRD PARTY LICENSES
## jsdom
MIT license

Copyright (c) 2010 Elijah Insua

The license file can be found here [third_party_licenses/jsdom/LICENSE.txt](third_party_licenses/jsdom/LICENSE.txt)
