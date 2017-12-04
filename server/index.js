const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const util = require('util');
const fetch = require('isomorphic-fetch');
const { send } = require('micro');
const { router, get } = require('microrouter');

const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);

const cadvisorHost =
  process.env.NODE_ENV === 'production' ?
  `http://${process.env.HOST_IP}:${process.env.HOST_CADVISOR_PORT}` :
  'http://localhost:3002'; // port forward a proxy to cadvisor (hharnisc/host-proxy:beta02)

const parseContainers = dockerData => {
  const containerMap = {};
  Object.keys(dockerData)
    .forEach((dockerKey) => {
      const containerName = dockerData[dockerKey].labels['io.kubernetes.container.name'];
      if (containerName in containerMap) {
        containerMap[containerName].push(dockerData[dockerKey].name);
      } else {
        containerMap[containerName] = [dockerData[dockerKey].name];
      }
    });
  delete containerMap.POD;
  return containerMap;
};

const parseSummaryUsage = ({ summary }) =>
  Object.keys(summary)
    .reduce((_, key) => summary[key].latest_usage, {});

const parseSpecLimits = ({ spec }) =>
  Object.keys(spec)
    .reduce((_, key) => ({
      cpu: spec[key].cpu,
      memory: spec[key].memory,
    }), {});

const parseTimestamp = ({ summary }) =>
  Object.keys(summary)
    .reduce((_, key) => summary[key].timestamp, {});

const containers = async (req, res) => {
  const response = await fetch(`${cadvisorHost}/api/v1.3/docker/`);
  const data = await response.json();
  send(res, 200, parseContainers(data));
};

const container = async (req, res) => {
  const summaryResponse = await fetch(`${cadvisorHost}/api/v2.0/summary/${decodeURIComponent(req.params.containerId)}`);
  const specResponse = await fetch(`${cadvisorHost}/api/v2.0/spec/${decodeURIComponent(req.params.containerId)}`);
  const response = {
    alive: true,
  };
  try {
    const summary = await summaryResponse.json();
    const spec = await specResponse.json();
    response.usage = parseSummaryUsage({ summary });
    response.spec = parseSpecLimits({ spec });
    response.timestamp = parseTimestamp({ summary });
  } catch (e) {
    response.alive = false;
  }
  send(res, 200, response);
};

const main = async (req, res) => {
  const parseUrl = url.parse(req.url);
  const root = `${__dirname}/../build`;
  let file = `${root}${parseUrl.pathname}`;

  if (!await exists(file)) {
    file = root;
  }

  if (fs.statSync(file).isDirectory()) {
    file += '/index.html';
  }

  if (!await exists(file)) {
    send(res, 404, {error: 'index.html not found'});
    return;
  }

  try {
    const data = await readFile(file);
    res.setHeader('Content-type', mime.getType(file));
    send(res, 200, data);
  } catch (err) {
    send(res, 500);
  }
};

module.exports = router(
  get('/api/containers/:containerId/', container),
  get('/api/containers/', containers),
  get('/*', main),
)
