// import { helper } from '@ember/component/helper';

// export default helper(function getConstant(positional /*, named*/) {
//   return positional;
// });

import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-burgernabije-besluitendatabank/config/constants';

export default helper(function getConstant([title]: [string]) {
  for (const key in CONSTANTS) {
    if (Object.prototype.hasOwnProperty.call(CONSTANTS, key)) {
      if (title === key) {
        return CONSTANTS[key as keyof typeof CONSTANTS];
      }
    }
  }
  return '';
});
