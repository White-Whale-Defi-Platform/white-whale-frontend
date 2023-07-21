window.debugLogsEnabled = localStorage.getItem('debugLogsEnabled') === 'true';

const logs = () => {
  window.debugLogsEnabled = !window.debugLogsEnabled ;
  localStorage.setItem('debugLogsEnabled', (window.debugLogsEnabled).toString());
  return "Debug logs " + (window.debugLogsEnabled ? "enabled" : "disabled")+  "."
};
