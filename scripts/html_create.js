const HtmlJamList = require('./_html_jam_list');
const HtmlLeaderboard = require('./_html_leaderboard');
const HtmlStats = require('./_html_stats');

async function main() {
	await HtmlJamList.main();
	await HtmlLeaderboard.main();
	await HtmlStats.main();
}

main();
