module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux']
    }
  ],
  publishers: [],
  plugins: [],
  hooks: {},
  buildIdentifier: 'my-build'
};
