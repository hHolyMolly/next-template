module.exports = {
  apps: [
    {
      name: 'next-template',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
