import * as qs from 'qs';
import * as crypto from 'crypto';
import { default as axios } from 'axios';
import express, { Request, Response } from 'express';
require('dotenv').config();

const app = express();

let token = '';

const config = {
  /* openapi host */
  host: process.env.HOST_URL,
  /* fetch from openapi platform */
  accessKey: process.env.ACCESS_KEY,
  /* fetch from openapi platform */
  secretKey: process.env.SECRET_KEY,
  /* Interface example device_ID */
  deviceId: process.env.WASHER_DEVICE_ID,
};

const httpClient = axios.create({
  baseURL: config.host!,
  timeout: 5 * 1e3,
});

async function main() {
  await getToken();
}

/**
 * fetch highway login token
 */
async function getToken() {
  const method = 'GET';
  const timestamp = Date.now().toString();
  const signUrl = '/v1.0/token?grant_type=1';
  const contentHash = crypto.createHash('sha256').update('').digest('hex');
  const stringToSign = [method, contentHash, '', signUrl].join('\n');
  const signStr = config.accessKey! + timestamp + stringToSign;

  const headers = {
    t: timestamp,
    sign_method: 'HMAC-SHA256',
    client_id: config.accessKey!,
    sign: await encryptStr(signStr, config.secretKey!),
  };
  const { data: login } = await httpClient.get('/v1.0/token?grant_type=1', {
    headers,
  });
  if (!login || !login.success) {
    throw Error(`fetch failed: ${login.msg}`);
  }
  token = login.result.access_token;
}

/**
 * fetch highway business data
 */
async function getPowerAndTime(deviceId: string) {
  const query = {};
  const method = 'GET';
  const url = `/v1.0/iot-03/devices/${deviceId}/status`;
  const reqHeaders: { [k: string]: string } = await getRequestSign(
    url,
    method,
    {},
    query
  );

  const { data } = await httpClient.request({
    method,
    data: {},
    params: {},
    headers: reqHeaders,
    url: reqHeaders.path,
  });
  if (!data || !data.success) {
    throw Error(`request api failed: ${data.msg}`);
  }
  const dummyPower = {
    code: 'power_level',
    value: 1,
  };

  const dummyDate = {
    code: 'date_started',
    value: new Date().toString(),
  };

  data.result.push(dummyPower);
  data.result.push(dummyDate);

  let powerData = data.result.filter((obj: any) => {
    return obj.code === 'power_level' || obj.code === 'date_started';
  });

  return powerData;
}

/**
 * HMAC-SHA256 crypto function
 */
async function encryptStr(str: string, secret: string): Promise<string> {
  return crypto
    .createHmac('sha256', secret)
    .update(str, 'utf8')
    .digest('hex')
    .toUpperCase();
}

/**
 * request sign, save headers
 * @param path
 * @param method
 * @param headers
 * @param query
 * @param body
 */
async function getRequestSign(
  path: string,
  method: string,
  headers: { [k: string]: string } = {},
  query: { [k: string]: any } = {},
  body: { [k: string]: any } = {}
) {
  const t = Date.now().toString();
  const [uri, pathQuery] = path.split('?');
  const queryMerged = Object.assign(query, qs.parse(pathQuery));
  const sortedQuery: { [k: string]: string } = {};
  Object.keys(queryMerged)
    .sort()
    .forEach((i) => (sortedQuery[i] = query[i]));

  const querystring = decodeURIComponent(qs.stringify(sortedQuery));
  const url = querystring ? `${uri}?${querystring}` : uri;
  const contentHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');
  const stringToSign = [method, contentHash, '', url].join('\n');
  const signStr = config.accessKey! + token + t + stringToSign;
  return {
    t,
    path: url,
    client_id: config.accessKey!,
    sign: await encryptStr(signStr, config.secretKey!),
    sign_method: 'HMAC-SHA256',
    access_token: token,
  };
}

main().catch((err) => {
  throw Error(`error: ${err}`);
});

app.get('/api/getStatus', async (req: Request, res: Response) => {
  const data = await getPowerAndTime(config.deviceId!);
  console.log(data);

  if (data[0].value > 0) {
    res.send({
      running: true,
      startTime: data[1].value,
    });
  } else {
    res.send({
      running: false,
    });
  }
});

app.listen(3080, () => console.log('listening on port 3080'));
