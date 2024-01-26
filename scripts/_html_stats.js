const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

async function main() {
	let stats = await SF.read_json('./data_files/stats/stats.json');
	let str_html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Unofficial Mini Jam Leaderboard</title>

	<link rel="stylesheet" href="../_css/main.css">
	<link rel="stylesheet" href="../_css/stats.css">

	<link rel="shortcut icon" href="#">
</head>
<body>
	<div id="content">
		<div id="nav">
			<a href="../leaderboard/leaderboard_10_page_0000.html">Leaderboard</a>
			<a href="../jam_list/mini_jam_page_0000.html">Jam list</a>
			<a href="../jammer_search.html">Jammer search</a>
			<a href="../stats/stats.html">Stats</a>
			<a href="https://github.com/TripleCubes/uml">Github</a>
		</div>
		<div id="result">
			<h1>Stats</h1>
			<h3>Number of jammers</h3>`
	+ `
			<p>` + stats.num_of_jammer + ` jammers</p>`
	+ `
			<p>` + stats.num_of_minijammer + ` minijammers</p>`
	+ `
			<p>` + stats.num_of_majorjammer + ` majorjammers</p>`
	+ `
			<h3>Mini Jam</h3>`
	+ `
			<p>` + stats.num_of_mini_jam + ` Mini Jams</p>`
	+ `
			<p>` + stats.mini_jam_num_of_game + ` games</p>`
	+ `
			<h3>Major Jam</h3>`
	+ `
			<p>` + stats.num_of_major_jam + ` Major Jams</p>`
	+ `
			<p>` + stats.major_jam_num_of_game + ` games</p>`
	+ `
		</div>
	</div>
</body>
</html>
`;
	await SF.write_file_str(str_html, '../docs/stats/', 'stats.html');
}

// main();
