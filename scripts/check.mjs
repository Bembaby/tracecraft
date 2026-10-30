import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { validateLessons } from './validate-content.mjs';
import {validateApiCourse} from './validate-api-course.mjs';
for (const dir of ['src','scripts','tests','server','api']) for (const name of await readdir(dir)) {
  if(!/\.(m?js)$/.test(name)) continue;
  const result=spawnSync(process.execPath,['--check',`${dir}/${name}`],{stdio:'inherit'});
  if(result.status!==0) process.exit(result.status||1);
}
validateLessons();
validateApiCourse();
console.log('Source, scripts, test syntax, and lesson contracts passed.');
