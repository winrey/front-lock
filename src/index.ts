import locker from './locker';
import code from './code';
import wait from './wait';
import error from './error';

export default { ...locker, ...code, ...wait, ...error };
