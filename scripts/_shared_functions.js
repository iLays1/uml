const fs = require('fs').promises;
const fs_sync = require('fs');

module.exports = {
	is_file_exist: is_file_exist,
	read_json: read_json,
	write_json: write_json,
	write_file_str: write_file_str,
	int_to_str: int_to_str,
	add_html_top_bottom: add_html_top_bottom,
	html_tag: html_tag,
	html_nav: html_nav,
	get_jam_name: get_jam_name,
	get_jammer_short_link: get_jammer_short_link,
}

function is_file_exist(path) {
	return fs_sync.existsSync(path);
}

async function read_json(path) {
	console.log('    reading ' + path);
	return JSON.parse(await fs.readFile(path, 'utf8'));
}

async function write_json(data, folder_path, file_name) {
	console.log('writing ' + file_name);

	if (!fs_sync.existsSync(folder_path)) {
		fs_sync.mkdirSync(folder_path, { recursive: true });
	}

	await fs.writeFile(folder_path + file_name, JSON.stringify(data, null, '\t'), function(err) {
		if (err) {
			console.log('write file error: ' + err);
		}
	});
}

async function write_file_str(str_data, folder_path, file_name) {
	console.log('writing ' + folder_path + file_name);

	if (!fs_sync.existsSync(folder_path)) {
		fs_sync.mkdirSync(folder_path, { recursive: true });
	}

	await fs.writeFile(folder_path + file_name, str_data, function(err) {
		if (err) {
			console.log('write file error: ' + err);
		}
	});
}

function int_to_str(num) {
	return ('000000' + num).slice(-4);
};

function add_html_top_bottom(str_html, list_additional_css) {
	let top_0 = 
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Unofficial Mini Jam Leaderboard</title>
	<link rel="stylesheet" href="../_css/main.css">`;
	let top_2 = `	
	<link rel="shortcut icon" href="#">
</head>
<body>
	<div id="content">`;
	let bottom = `
	</div>
</body>
</html>
`;
	let top_1 = '';
	for (let i = 0; i < list_additional_css.length; i++) {
		top_1 += `	
	<link rel="stylesheet" href="`
		+ list_additional_css[i]
		+ `">`;
	}

	return top_0 + top_1 + top_2 + str_html + bottom;
}

function html_tag(tag, inner_html, attribs, tabs, line_break = false) {
	let _0 = `
`;
	for (let i = 0; i < tabs; i++) {
		_0 += '	';
	}

	_0 += '<' + tag + ' ' + attribs + '>' + inner_html;

	if (line_break) {
		_0 += `
`;
		for (let i = 0; i < tabs; i++) {
			_0 += '	';
		}
	}

	_0 += '</' + tag + `>`;
	
	return _0;
}

function html_nav(up_folder) {
	if (!up_folder) {
		return `
		<div id="nav">
			<a href="./leaderboard/leaderboard_10_page_0000.html">Leaderboard</a>
			<a href="./jam_list/mini_jam_page_0000.html">Jam list</a>
			<a href="./jammer_search.html">Jammer search</a>
			<a href="./stats/stats.html">Stats</a>
			<a href="https://github.com/TripleCubes/uml">Github</a>
		</div>`;
	}

	return `
		<div id="nav">
			<a href="../leaderboard/leaderboard_10_page_0000.html">Leaderboard</a>
			<a href="../jam_list/mini_jam_page_0000.html">Jam list</a>
			<a href="../jammer_search.html">Jammer search</a>
			<a href="../stats/stats.html">Stats</a>
			<a href="https://github.com/TripleCubes/uml">Github</a>
		</div>`;
}

function get_jam_name(jam_name, jam_id, jam_type) {
	if (jam_type == 'major_jam') {
		let colon_pos = jam_name.indexOf(':');
		if (colon_pos != -1) {
			jam_name = jam_name.slice(colon_pos + 2, jam_name.length);
		}
	}

	return (jam_type == 'major_jam' ? 'Major Jam ' : 'Mini Jam ') + jam_id + ': ' + jam_name;
}

function get_jammer_short_link(link) {
	link = link.replaceAll('https://', '');
	if (link[link.length - 1] == '/') {
		link = link.slice(0, link.length - 1);
	}
	return link;
}
