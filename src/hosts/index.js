const fs = require('../common/fs');
const path = require('path');
const mkdirp = require('../common/mkdirp');
const os = require('os');

const SYSTEM_HOSTS_FILE = '/etc/hosts';
const DATA_PATH = path.normalize(`${process.env.HOME}/.hoster`);
const DATA_FILE = path.normalize(`${DATA_PATH}/hosts`);
const DEFAULT_HOSTS_FILE = path.normalize(`${__dirname}/default.txt`);

exports.load = async function () {
  await mkdirp(DATA_PATH);
  let buffer = await fs.readFile(DATA_FILE);
  let list;
  try {
    list = JSON.parse(buffer.toString()) || [];
  } catch (err) {
    if (err) console.error(err);
    list = [];
  }
  let defaultHosts = await fs.readFile(DEFAULT_HOSTS_FILE);
  list.unshift({
    name: 'SYSTEM',
    type: 'system',
    editing: false,
    checked: true,
    content: defaultHosts.toString()
  });
  return list;
};

exports.save = async function (list) {
  await mkdirp(DATA_PATH);
  let customList = list.filter(item => item.type != 'system');
  await fs.writeFile(DATA_FILE, JSON.stringify(customList));
  let usedList = list.filter(item => item.checked);
  let buffer = usedList.map(item => {
    return `${os.EOL}#${item.name}${os.EOL}${item.content.trim()}${os.EOL}`;
  });
  await fs.writeFile(SYSTEM_HOSTS_FILE, buffer.join(os.EOL));
};