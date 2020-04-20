import { generateGuid } from './helpers';

export const defaultSettings = {
  CLIENTPOLLINTERVAL: 1000,
  AUTOPLAY: true,
  HIDEUSERNAME: true,
  ALTUSERNAME: '',
  DARKMODE: false,
  SYNCMODE: 'cleanseek',
  SYNCFLEXABILITY: 5000,
  CUSTOMSERVER: 'http://',
  PTPLAYERVOLUME: 100,
  SLPLAYERFORCETRANSCODE: false,
  CLIENTIDENTIFIER: `${generateGuid()}-${generateGuid()}`,
  blockedServers: [],
  LASTSERVER: '',
};

export default {
  defaultSettings,
};
