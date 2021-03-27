import * as fs from 'fs';

import { Config } from './models';

export default JSON.parse(fs.readFileSync(`assets/config/${process.env.PROPELLERHEAD_ENV || 'dev'}.json`, 'utf8')) as Config;
