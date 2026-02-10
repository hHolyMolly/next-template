module.exports = {
  apps: [
    {
      name: 'next-template',
      script: 'pnpm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
