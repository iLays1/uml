const DataJamList = require('./_data_jam_list');
const DataLeaderboard = require('./_data_leaderboard');
const JammerLookup = require('./_jammer_lookup');
const DataStats = require('./_data_stats');

async function main() {
	await DataJamList.main();
	await DataLeaderboard.main();
	await JammerLookup.main();
	await DataStats.main();
}

main();
