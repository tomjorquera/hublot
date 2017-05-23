// Load third-parties libraries given in config

/* global robotController document */

robotController.external = {
  load: config => {
    for (const url of config.externalLibs) {
      const script = document.createElement('script');
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', url);
      document.head.appendChild(script);
    }
  }
};
