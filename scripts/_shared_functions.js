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
	msec_to_str: msec_to_str,
	html_major_jam_tag: html_major_jam_tag,
	html_late_tag: html_late_tag,
	html_early_tag: html_early_tag,
	html_time_unknown_tag: html_time_unknown_tag,
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

function msec_to_str(t_msec) {
	let t_sec = Math.floor(t_msec / (1000));
	let t_sec_remains = t_sec % 60;

	let t_min = Math.floor(t_msec / (1000*60));
	let t_min_remains = t_min % 60;

	let t_hour = Math.floor(t_msec / (1000*60*60));
	let t_day = Math.floor(t_hour / 24);
	let t_hour_remains = t_hour % 24;

	let day_str = '';
	if (t_day != 0) {
		day_str = t_day + 'd ';
	}

	let hour_str = '';
	if (t_day != 0 || t_hour_remains != 0) {
		hour_str = t_hour_remains + 'h ';
	}

	let min_str = '';
	if (t_day == 0 && t_min_remains != 0) {
		min_str = t_min_remains + 'm ';
	}

	let sec_str = '';
	if (t_day == 0 && t_hour == 0) {
		sec_str = t_sec_remains + 's ';
	}

	return day_str + hour_str + min_str + sec_str;
}

function html_major_jam_tag() {
	return '<span class="major_jam_tag"></span>';
}

function html_late_tag(str) {
	return '<span class="late">' + str + '</span>';
}

function html_early_tag(str) {
	return '<span class="early">' + str + '</span>';
}

function html_time_unknown_tag() {
	return '<span class="time_unknown"></span>';
}
