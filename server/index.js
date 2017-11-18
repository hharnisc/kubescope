const fetch = require('isomorphic-fetch');
const { send } = require('micro');
const { router, get } = require('microrouter');
const dockerData = require('./docker.json');

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
  const response = await fetch('http://localhost:3002/api/v1.3/docker/');
  const data = await response.json();
  send(res, 200, parseContainers(data));
};

const container = async (req, res) => {
  const summaryResponse = await fetch(`http://localhost:3002/api/v2.0/summary/${decodeURIComponent(req.params.containerId)}`);
  const specResponse = await fetch(`http://localhost:3002/api/v2.0/spec/${decodeURIComponent(req.params.containerId)}`);
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

const notfound = (req, res) => send(res, 404, 'Not found route');

module.exports = router(
  get('/api/containers/:containerId/', container),
  get('/api/containers/', containers),
  get('/*', notfound)
)
